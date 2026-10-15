import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { loadSiteEnv } from "./site-env.js";

const html = readFileSync("dist/index.html", "utf8");
assert.ok(!/%VITE_[A-Z_]+%/.test(html), "HTML 包含未替换的环境变量");
assert.ok(
  !/<link[^>]*modulepreload[^>]*(?:aplayer|\/Music-|\/Player-|\/Set-)/i.test(
    html,
  ),
  "可选音乐或设置功能被首屏预加载",
);
const visit = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? visit(path) : [path];
  });
if (!loadSiteEnv().VITE_SONG_ID) {
  assert.ok(
    !visit("dist/assets").some((path) =>
      /(?:Music-|aplayer-|fetch-jsonp-)/.test(path),
    ),
    "音乐已关闭，但播放器仍被打包",
  );
}
let jsBytes = 0;
let cssBytes = 0;
for (const path of visit("dist/assets")) {
  if (!/\.(js|css)$/.test(path)) continue;
  const data = readFileSync(path, "utf8");
  assert.ok(
    !/VITE_WEATHER_KEY|restapi\.amap\.com/.test(data),
    "天气密钥或直连接口进入前端产物",
  );
  if (path.endsWith(".js")) jsBytes += Buffer.byteLength(data);
  else cssBytes += Buffer.byteLength(data);
}
const sw = readFileSync("dist/sw.js", "utf8");
assert.ok(sw.includes("images/background1.jpg"), "离线默认壁纸未预缓存");
console.log(
  `产物检查通过：全部分包 JS ${(jsBytes / 1024).toFixed(1)} KiB，CSS ${(cssBytes / 1024).toFixed(1)} KiB`,
);
