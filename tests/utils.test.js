import test from "node:test";
import assert from "node:assert/strict";
import { setTimeout } from "node:timers/promises";
import debounce from "../src/utils/debounce.js";
import { isSafeLink, splitSiteUrl } from "../src/utils/links.js";

test("域名保留多级后缀并去掉协议和路径", () => {
  assert.deepEqual(splitSiteUrl("https://home.example.com/path"), [
    "home",
    "example.com",
  ]);
  assert.deepEqual(splitSiteUrl("luofish.com"), ["luofish", "com"]);
});
test("空链接和危险协议不会渲染为链接", () => {
  for (const value of [
    "",
    undefined,
    "javascript:alert(1)",
    "data:text/html,test",
    "//untrusted.example",
  ])
    assert.equal(isSafeLink(value), false);
  for (const value of ["https://example.com", "mailto:test@example.com"])
    assert.equal(isSafeLink(value), true);
});
test("不同组件的防抖独立计时，卸载可取消", async () => {
  const calls = [];
  const first = debounce((value) => calls.push(value), 10);
  const second = debounce((value) => calls.push(value), 10);
  first("old");
  first("latest");
  second("other");
  await setTimeout(30);
  assert.deepEqual(calls.sort(), ["latest", "other"]);
  first("cancelled");
  first.cancel();
  await setTimeout(30);
  assert.equal(calls.length, 2);
});
