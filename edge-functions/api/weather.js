const json = (body, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders,
    },
  });

export async function onRequest(context) {
  if (context.request.method !== "GET")
    return json({ error: "Method not allowed" }, 405, { Allow: "GET" });
  const key = context.env?.WEATHER_KEY;
  if (!key) return json({ error: "Weather service is not configured" }, 503);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  const read = async (url) => {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error("Weather upstream failed");
    const data = await response.json();
    if (data.infocode !== "10000")
      throw new Error("Weather upstream rejected request");
    return data;
  };
  try {
    let city = context.env.WEATHER_CITY;
    if (!city) {
      const ip =
        context.clientIp || context.request.headers.get("EO-Connecting-IP");
      // 不使用边缘节点出口 IP 推断访客城市。
      if (!ip) return json({ error: "Visitor location is unavailable" }, 503);
      const location = await read(
        `https://restapi.amap.com/v3/ip?${new URLSearchParams({ key, ip })}`,
      );
      city = typeof location.adcode === "string" ? location.adcode : "";
    }
    if (!/^\d{6}$/.test(city || ""))
      return json({ error: "City is unavailable" }, 503);
    const result = await read(
      `https://restapi.amap.com/v3/weather/weatherInfo?${new URLSearchParams({ key, city })}`,
    );
    const weather = result.lives?.[0];
    if (
      !weather?.city ||
      !weather.weather ||
      weather.temperature == null ||
      weather.temperature === "" ||
      !Number.isFinite(Number(weather.temperature))
    ) {
      throw new Error("Incomplete weather data");
    }
    return json({
      city: weather.city,
      weather: weather.weather,
      temperature: Number(weather.temperature),
      winddirection: weather.winddirection || "",
      windpower: weather.windpower || "",
    });
  } catch {
    return json({ error: "Weather service is temporarily unavailable" }, 502);
  } finally {
    clearTimeout(timer);
  }
}
