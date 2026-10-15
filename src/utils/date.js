import dayjs from "dayjs";

// 按日历整月计算，月底对齐到目标月最后一天，再计算剩余日数。
export function siteDateStatistics(startDate, currentDate = new Date()) {
  const start = dayjs(startDate).startOf("day");
  const current = dayjs(currentDate).startOf("day");
  if (!start.isValid() || !current.isValid()) return "建站日期未配置";
  if (start.isAfter(current)) return "站点尚未建立";
  let totalMonths =
    (current.year() - start.year()) * 12 + current.month() - start.month();
  if (start.add(totalMonths, "month").isAfter(current)) totalMonths--;
  const days = current.diff(start.add(totalMonths, "month"), "day");
  return `本站已经苟活了 ${Math.floor(totalMonths / 12)} 年 ${totalMonths % 12} 月 ${days} 天`;
}
