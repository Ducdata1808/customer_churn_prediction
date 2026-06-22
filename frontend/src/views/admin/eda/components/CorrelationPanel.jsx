import React from "react";
import Chart from "react-apexcharts";
import Card from "components/card";
import { SectionLabel, getChartBase, BRAND } from "./common";

// ─── Feature ranking từ notebook (cell 177) ────────────────────────────────────
const FEATURE_RANKING = [
  { name: "Siêu cờ Tổ hợp rủi ro",       type: "Engineered", corr: 0.54, color: "#ef4444" },
  { name: "Log Tỷ lệ Áp lực chi phí",     type: "Engineered", corr: 0.53, color: "#f97316" },
  { name: "Điểm Khiên Bảo vệ",            type: "Engineered", corr: 0.49, color: "#eab308" },
  { name: "Mức độ gắn bó (loyalty_tier)", type: "Engineered", corr: 0.43, color: "#a855f7" },
  { name: "MonthlyCharges (gốc)",          type: "Original",   corr: 0.27, color: "#6366f1" },
  { name: "tenure (gốc)",                  type: "Original",   corr: 0.42, color: "#14b8a6" },
];

const CorrelationPanel = ({ cor, isDark }) => {
  const { ax, chartBase } = getChartBase(isDark);

  const heatOpt = {
    ...chartBase,
    chart: { ...chartBase.chart, type: "heatmap" },
    dataLabels: { enabled: true, style: { colors: ["#fff"], fontSize: "9px" } },
    colors: [BRAND],
    xaxis: { labels: { style: { colors: ax, fontSize: "9px" }, rotate: -45 } },
    yaxis: { labels: { style: { colors: ax, fontSize: "9px" } } },
  };

  const series = cor
    ? cor.index.map((r, ri) => ({ name: r, data: cor.columns.map((c, ci) => ({ x: c, y: +cor.values[ri][ci].toFixed(2) })) }))
    : [];

  // Horizontal bar chart cho feature ranking
  const rankingOpt = {
    ...chartBase,
    chart: { ...chartBase.chart, type: "bar" },
    plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
    xaxis: { labels: { style: { colors: ax }, formatter: (v) => v.toFixed(2) }, min: 0, max: 0.6 },
    yaxis: { labels: { style: { colors: ax, fontSize: "11px" } } },
    colors: FEATURE_RANKING.map(f => f.color),
    dataLabels: { enabled: true, formatter: (val) => val.toFixed(2), style: { fontSize: "10px" } },
    tooltip: { y: { formatter: (val) => `|r| = ${val.toFixed(2)}` } },
    legend: { show: false },
  };
  const rankingSeries = [{
    name: "Tương quan tuyệt đối",
    data: FEATURE_RANKING.map(f => ({ x: f.name, y: f.corr }))
  }];

  return (
    <div className="space-y-5">
      {/* ── Heatmap từ API ── */}
      <Card extra="p-6">
        <SectionLabel text="Correlation Matrix" />
        <h3 className="mb-1 text-lg font-bold text-navy-700 dark:text-white">Ma trận tương quan</h3>
        <p className="mb-4 text-xs text-gray-500">Độ tương quan tuyến tính giữa các biến định lượng gốc</p>
        <div className="h-[400px]">
          <Chart options={heatOpt} series={series} type="heatmap" height="100%" />
        </div>
        {cor?.insight && (
          <div className="mt-4 rounded-xl bg-lightPrimary p-4 dark:bg-navy-700">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-semibold text-brand-500">Tương quan: </span>{cor.insight}
            </p>
          </div>
        )}
      </Card>

      {/* ── Feature Superiority Ranking (notebook cell 177) ── */}
      <Card extra="p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-purple-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-purple-500">Xếp hạng sức mạnh đặc trưng</span>
        </div>
        <div className="h-[280px]">
          <Chart options={rankingOpt} series={rankingSeries} type="bar" height="100%" />
        </div>
        <div className="mt-4 space-y-2 rounded-xl bg-purple-50 p-4 dark:bg-purple-950/20">
          <ul className="space-y-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500" />
              <span><strong className="text-navy-700 dark:text-white">Log Tỷ lệ Áp lực chi phí</strong> — hệ số tương quan <strong>r = 0.53</strong>, vượt trội hoàn toàn so với <em>MonthlyCharges</em> gốc chỉ <strong>r = 0.27</strong>. Khách hàng không rời bỏ vì cước phí cao mà là vì <em>áp lực tài chính quá lớn so với thời gian gắn bó</em>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500" />
              <span><strong className="text-navy-700 dark:text-white">Siêu cờ Tổ hợp rủi ro</strong> — đạt <strong>V = 0.54</strong>, khẳng định việc kết hợp tín hiệu <em>Cáp quang + Hợp đồng ngắn hạn</em> là thao tác Feature Engineering đúng đắn.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500" />
              <span>Các đặc trưng phái sinh <strong className="text-navy-700 dark:text-white">Engineered</strong> áp đảo hoàn toàn so với dải dữ liệu nguyên bản <em>Original</em> ở tất cả các vị trí đầu bảng xếp hạng.</span>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default CorrelationPanel;
