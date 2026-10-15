import test from "node:test";
import assert from "node:assert/strict";
import { siteDateStatistics } from "../src/utils/date.js";

for (const [start, end, expected] of [
  ["2026-02-15", "2026-03-10", "0 年 0 月 23 天"],
  ["2026-01-31", "2026-02-28", "0 年 1 月 0 天"],
  ["2024-02-29", "2025-02-28", "1 年 0 月 0 天"],
  ["2025-12-31", "2026-01-01", "0 年 0 月 1 天"],
  ["2026-03-07", "2026-03-07", "0 年 0 月 0 天"],
  ["2026-03-07", "2026-10-15", "0 年 7 月 8 天"],
]) {
  test(`建站时长 ${start} 至 ${end}`, () => {
    assert.equal(siteDateStatistics(start, end), `本站已经苟活了 ${expected}`);
  });
}
test("无效日期和未来日期有明确提示", () => {
  assert.equal(siteDateStatistics("invalid", "2026-10-15"), "建站日期未配置");
  assert.equal(siteDateStatistics("2027-01-01", "2026-10-15"), "站点尚未建立");
});
