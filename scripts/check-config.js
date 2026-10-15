import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { loadSiteEnv } from "./site-env.js";
import { isSafeLink } from "../src/utils/links.js";
import dayjs from "dayjs";

const env = loadSiteEnv();
for (const key of ["VITE_SITE_NAME", "VITE_SITE_URL", "VITE_SITE_AUTHOR"])
  assert.ok(env[key]?.trim(), `缺少 ${key}`);
for (const key of [
  "VITE_SITE_LOGO",
  "VITE_SITE_MAIN_LOGO",
  "VITE_SITE_APPLE_LOGO",
]) {
  const value = env[key];
  assert.ok(value, `缺少 ${key}`);
  if (value.startsWith("/"))
    assert.ok(existsSync(join("public", value)), `${key} 对应资源不存在`);
  else
    assert.ok(
      /^https:\/\//i.test(value),
      `${key} 必须是本地绝对路径或 HTTPS 地址`,
    );
}
for (const [file, property] of [
  ["siteLinks.json", "link"],
  ["socialLinks.json", "url"],
]) {
  const items = JSON.parse(readFileSync(join("src/assets", file), "utf8"));
  const names = new Set();
  for (const item of items) {
    assert.ok(item.name && !names.has(item.name), `${file} 存在重复或空名称`);
    names.add(item.name);
    assert.ok(
      !item[property] || isSafeLink(item[property]),
      `${file} 的 ${item.name} 链接无效`,
    );
    if (item.icon?.startsWith("/"))
      assert.ok(
        existsSync(join("public", item.icon)),
        `${item.name} 图标不存在`,
      );
  }
}
assert.equal(
  Boolean(env.VITE_SONG_ID),
  Boolean(env.VITE_SONG_API),
  "音乐接口和歌单 ID 必须同时配置或同时留空",
);
if (env.VITE_SONG_API)
  assert.ok(/^https:\/\//i.test(env.VITE_SONG_API), "音乐接口必须使用 HTTPS");
if (env.VITE_SITE_START)
  assert.match(
    env.VITE_SITE_START,
    /^\d{4}(?:-\d{2}-\d{2})?$/,
    "建站日期格式为 YYYY 或 YYYY-MM-DD",
  );
if (env.VITE_SITE_START?.length === 10) {
  assert.equal(dayjs(env.VITE_SITE_START).format("YYYY-MM-DD"), env.VITE_SITE_START, "建站日期不是有效的日历日期");
}
console.log("站点配置检查通过");
