import { loadEnv } from "vite";

export function loadSiteEnv(mode = "production") {
  const env = {
    ...loadEnv("example", process.cwd()),
    ...loadEnv(mode, process.cwd()),
  };
  if (env.VITE_WEATHER_KEY) {
    throw new Error(
      "请删除 VITE_WEATHER_KEY，在 EdgeOne 服务端环境设置 WEATHER_KEY；密钥不能编译到前端。",
    );
  }
  return env;
}
