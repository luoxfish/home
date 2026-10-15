import { requestJson } from "./request.js";

export async function getPlayerList(server, type, id, options = {}) {
  const { api = import.meta.env?.VITE_SONG_API, ...requestOptions } = options;
  if (!api || !id) throw new Error("尚未配置音乐接口或歌单");
  const query = new URLSearchParams({ server, type, id });
  const data = await requestJson(
    api + (api.includes("?") ? "&" : "?") + query,
    requestOptions,
  );
  if (
    !Array.isArray(data) ||
    !data.length ||
    data.some((track) => !track || typeof track.url !== "string")
  ) {
    throw new Error("音乐接口返回了无效或空歌单");
  }
  let urls;
  if (data[0].url.startsWith("@")) {
    const url = data[0].url.split("@").slice(1)[3];
    if (!/^https:\/\//i.test(url || "")) throw new Error("无效的音乐解析地址");
    const { default: fetchJsonp } = await import("fetch-jsonp");
    const result = await fetchJsonp(url, { timeout: 8000 }).then((response) =>
      response.json(),
    );
    const resolved = result?.req_0?.data;
    const domain =
      resolved?.sip?.find((value) => !value.startsWith("http://ws")) ||
      resolved?.sip?.[0];
    if (!domain || !Array.isArray(resolved?.midurlinfo))
      throw new Error("音乐解析失败");
    urls = resolved.midurlinfo.map((item) =>
      item.purl ? domain.replace(/^http:/, "https:") + item.purl : "",
    );
  }
  const tracks = data
    .map((track, index) => ({
      name: track.name || track.title || "未知歌曲",
      artist: track.artist || track.author || "未知歌手",
      url: urls ? urls[index] : track.url,
      cover: track.cover || track.pic,
      lrc: track.lrc,
    }))
    .filter((track) => /^https?:\/\//i.test(track.url || ""));
  if (!tracks.length) throw new Error("歌单中没有可播放的歌曲");
  return tracks;
}

export const getHitokoto = (options) =>
  requestJson("https://v1.hitokoto.cn", options);

export async function getWeatherData(options = {}) {
  try {
    const data = await requestJson("/api/weather", {
      timeout: 10000,
      ...options,
    });
    if (
      !data?.city ||
      !data?.weather ||
      data.temperature == null ||
      data.temperature === "" ||
      !Number.isFinite(Number(data.temperature))
    ) {
      throw new Error("天气数据不完整");
    }
    return data;
  } catch (error) {
    if (options.signal?.aborted) throw error;
    const result = await requestJson(
      "https://api.oioweb.cn/api/weather/GetWeather",
      options,
    );
    const data = result?.result;
    const min = Number(data?.condition?.min_degree);
    const max = Number(data?.condition?.max_degree);
    if (
      !data?.city?.City ||
      !data?.condition?.day_weather ||
      data.condition.min_degree == null ||
      data.condition.max_degree == null ||
      data.condition.min_degree === "" ||
      data.condition.max_degree === "" ||
      !Number.isFinite(min) ||
      !Number.isFinite(max)
    ) {
      throw new Error("备用天气数据不完整");
    }
    return {
      city: data.city.City,
      weather: data.condition.day_weather,
      temperature: Math.round((min + max) / 2),
      winddirection: data.condition.day_wind_direction || "",
      windpower: data.condition.day_wind_power || "",
    };
  }
}
