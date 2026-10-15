import test from "node:test";
import assert from "node:assert/strict";
import { requestJson } from "../src/api/request.js";
import { getPlayerList, getWeatherData } from "../src/api/index.js";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status });
test("请求校验 HTTP 状态与 JSON 格式", async () => {
  assert.deepEqual(
    await requestJson("/test", { fetchImpl: async () => json({ ok: true }) }),
    { ok: true },
  );
  await assert.rejects(
    requestJson("/test", { fetchImpl: async () => json({}, 503) }),
    /503/,
  );
  await assert.rejects(
    requestJson("/test", { fetchImpl: async () => new Response("not json") }),
    SyntaxError,
  );
});
const pending = (_url, { signal }) =>
  new Promise((_resolve, reject) => {
    const fail = () => reject(new DOMException("Aborted", "AbortError"));
    if (signal.aborted) fail();
    else signal.addEventListener("abort", fail, { once: true });
  });
test("超时会中止请求", async () => {
  await assert.rejects(
    requestJson("/test", { timeout: 10, fetchImpl: pending }),
    { name: "AbortError" },
  );
});
test("组件卸载的取消信号会传递到请求", async () => {
  const controller = new AbortController();
  const request = requestJson("/test", {
    signal: controller.signal,
    fetchImpl: pending,
  });
  controller.abort();
  await assert.rejects(request, { name: "AbortError" });
});
test("歌单拒绝空数据、异常结构和危险播放地址", async () => {
  for (const data of [
    [],
    {},
    [null],
    [{ name: "bad" }],
    [{ url: "javascript:alert(1)" }],
  ]) {
    await assert.rejects(
      getPlayerList("netease", "playlist", "123", {
        api: "https://music.example/api",
        fetchImpl: async () => json(data),
      }),
    );
  }
});
test("歌单编码参数，兼容 title/author，跳过不可播放歌曲", async () => {
  const tracks = await getPlayerList("netease", "playlist", "id&unsafe=1", {
    api: "https://music.example/api?token=public",
    fetchImpl: async (url) => {
      assert.equal(new URL(url).searchParams.get("id"), "id&unsafe=1");
      assert.equal(new URL(url).searchParams.get("unsafe"), null);
      return json([
        { title: "Song", author: "Artist", url: "https://music.example/a.mp3" },
        { url: "" },
      ]);
    },
  });
  assert.equal(tracks.length, 1);
  assert.equal(tracks[0].name, "Song");
  assert.equal(tracks[0].artist, "Artist");
});
test("服务端天气失败时使用备用接口", async () => {
  let calls = 0;
  const result = await getWeatherData({
    fetchImpl: async (url) => {
      calls++;
      if (url === "/api/weather") return json({}, 503);
      return json({
        result: {
          city: { City: "上海" },
          condition: { day_weather: "晴", min_degree: "10", max_degree: "16" },
        },
      });
    },
  });
  assert.equal(calls, 2);
  assert.equal(result.city, "上海");
  assert.equal(result.temperature, 13);
});
test("天气正常时不请求备用接口；温度为零仍可显示", async () => {
  const result = await getWeatherData({
    fetchImpl: async (url) => {
      assert.equal(url, "/api/weather");
      return json({ city: "北京", weather: "雪", temperature: 0 });
    },
  });
  assert.equal(result.temperature, 0);
});
test("取消天气请求后不发起备用请求", async () => {
  const controller = new AbortController();
  controller.abort();
  let calls = 0;
  await assert.rejects(
    getWeatherData({
      signal: controller.signal,
      fetchImpl: (...args) => {
        calls++;
        return pending(...args);
      },
    }),
    { name: "AbortError" },
  );
  assert.equal(calls, 1);
});
test("备用天气结构错误时报告失败", async () => {
  await assert.rejects(
    getWeatherData({ fetchImpl: async () => json({}) }),
    /备用天气/,
  );
});
