export async function requestJson(
  url,
  { timeout = 8000, signal, fetchImpl = fetch, ...options } = {},
) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, timeout);
  try {
    const response = await fetchImpl(url, {
      ...options,
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`请求失败 (${response.status})`);
    return await response.json();
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}
