import test from "node:test";
import assert from "node:assert/strict";
import { onRequest } from "../edge-functions/api/weather.js";

const context = (env = {}, method = "GET") => ({
  env,
  request: Object.assign(
    new Request("https://home.example/api/weather", { method }),
    { eo: { clientIp: "203.0.113.5" } },
  ),
});
test("未配置 Key 和不支持的方法不会访问上游", async (t) => {
  t.mock.method(globalThis, "fetch", () => {
    throw new Error("Must not fetch");
  });
  assert.equal((await onRequest(context())).status, 503);
  const response = await onRequest(
    context({ WEATHER_KEY: "test-key" }, "POST"),
  );
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET");
});
test("天气代理使用访客 IP 并仅返回展示字段", async (t) => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async (url) => {
    calls++;
    const parsed = new URL(url);
    assert.equal(parsed.searchParams.get("key"), "test-key");
    if (calls === 1) {
      assert.equal(parsed.searchParams.get("ip"), "203.0.113.5");
      return new Response(
        JSON.stringify({ infocode: "10000", adcode: "310000" }),
      );
    }
    assert.equal(parsed.searchParams.get("city"), "310000");
    return new Response(
      JSON.stringify({
        infocode: "10000",
        lives: [
          {
            city: "上海",
            weather: "晴",
            temperature: "0",
            winddirection: "北",
            windpower: "3",
          },
        ],
      }),
    );
  });
  const response = await onRequest(context({ WEATHER_KEY: "test-key" }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(await response.json(), {
    city: "上海",
    weather: "晴",
    temperature: 0,
    winddirection: "北",
    windpower: "3",
  });
});
test("代理错误不泄漏密钥或上游 URL", async (t) => {
  t.mock.method(globalThis, "fetch", async () => {
    throw new Error("https://upstream/?key=test-secret");
  });
  const response = await onRequest(
    context({ WEATHER_KEY: "test-secret", WEATHER_CITY: "310000" }),
  );
  assert.equal(response.status, 502);
  const text = await response.text();
  assert.ok(!text.includes("test-secret") && !text.includes("upstream"));
});
test("没有可信访客 IP 时不使用出口 IP", async (t) => {
  const visitor = context({ WEATHER_KEY: "test-key" });
  visitor.request = new Request("https://home.example/api/weather");
  t.mock.method(globalThis, "fetch", () => {
    throw new Error("Must not fetch");
  });
  assert.equal((await onRequest(visitor)).status, 503);
});

test("客户端伪造的 IP 请求头不能替代平台访客 IP", async (t) => {
  const visitor = context({ WEATHER_KEY: "test-key" });
  visitor.request = new Request("https://home.example/api/weather", {
    headers: {
      "EO-Connecting-IP": "198.51.100.10",
      "X-Forwarded-For": "198.51.100.11",
    },
  });
  t.mock.method(globalThis, "fetch", () => {
    throw new Error("Must not fetch");
  });
  assert.equal((await onRequest(visitor)).status, 503);
});
test("指定城市时无需查询 IP", async (t) => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async (url) => {
    calls++;
    assert.equal(new URL(url).pathname, "/v3/weather/weatherInfo");
    return new Response(
      JSON.stringify({
        infocode: "10000",
        lives: [{ city: "上海", weather: "晴", temperature: "20" }],
      }),
    );
  });
  assert.equal(
    (
      await onRequest(
        context({ WEATHER_KEY: "test-key", WEATHER_CITY: "310000" }),
      )
    ).status,
    200,
  );
  assert.equal(calls, 1);
});
