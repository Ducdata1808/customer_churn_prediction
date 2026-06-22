import React, { useState, useEffect } from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import Card from "components/card";
import { SectionLabel, Spin, getChartBase, BRAND, TEAL } from "./common";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

// ─── Dữ liệu Risk Gap từ notebook (cell 103) ──────────────────────────────────
const RISK_GAP_DATA = [
  { feature: "OnlineSecurity",    noChurn: 91.3, churn: 8.7,  gap: 30.5 },
  { feature: "TechSupport",       noChurn: 90.4, churn: 9.6,  gap: 29.8 },
  { feature: "OnlineBackup",      noChurn: 79.5, churn: 20.5, gap: 19.8 },
  { feature: "DeviceProtection",  noChurn: 78.8, churn: 21.2, gap: 19.3 },
  { feature: "StreamingTV",       noChurn: 60.2, churn: 39.8, gap: 1.5  },
  { feature: "StreamingMovies",   noChurn: 59.8, churn: 40.2, gap: 1.3  },
];

// ─── Dữ liệu Expected Churn Segments từ notebook (cell 98) ───────────────────
const EXPECTED_CHURN_SEGMENTS = [
  { segment: "Contract = Month-to-month", size: "47.7% KH", expectedChurn: "21.16%", color: "#ef4444" },
  { segment: "InternetService = Fiber optic", size: "45.9% KH", expectedChurn: "19.04%", color: "#f97316" },
  { segment: "PaymentMethod = Electronic check", size: "36.3% KH", expectedChurn: "17.73%", color: "#eab308" },
];

const BivariatePanel = ({ ov, isDark }) => {
  const [biCol, setBiCol] = useState("Contract");
  const [biD, setBiD] = useState(null);
  const [biL, setBiL] = useState(false);

  useEffect(() => {
    if (!ov) return;
    (async () => {
      try {
        setBiL(true);
        const r = await axios.get(`${API}/api/v1/eda/bivariate/${biCol}`);
        setBiD(r.data);
      } catch {}
      finally { setBiL(false); }
    })();
  }, [biCol, ov]);

  const { ax, chartBase } = getChartBase(isDark);

  const isCat = biD?.type === "categorical";
  const bvOpt = !biD ? {} : isCat ? {
    ...chartBase,
    chart: { ...chartBase.chart, type: "bar", stacked: true },
    plotOptions: { bar: { horizontal: false, borderRadius: 4 } },
    xaxis: { categories: biD.index, labels: { style: { colors: ax } }, axisBorder: { show: false } },
    yaxis: { labels: { style: { colors: ax } } },
    colors: [TEAL, BRAND],
    legend: { position: "top", labels: { colors: ax } },
  } : {
    ...chartBase,
    chart: { ...chartBase.chart, type: "boxPlot" },
    colors: [BRAND, TEAL],
    xaxis: { labels: { style: { colors: ax } } },
    yaxis: { labels: { style: { colors: ax } } },
  };

  const bvS = !biD ? [] : isCat
    ? biD.columns.map((c, ci) => ({ name: `Churn: ${c}`, data: biD.values.map((r) => r[ci]) }))
    : [{ type: "boxPlot", data: [{ x: "No Churn", y: biD.churn_no_stats?.boxplot }, { x: "Churn", y: biD.churn_yes_stats?.boxplot }] }];

  const selectCls = "rounded-xl border border-gray-200 bg-white/0 px-3 py-2 text-sm text-navy-700 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-800 dark:text-white";

  // Chart cho Risk Gap
  const riskGapOpt = {
    ...chartBase,
    chart: { ...chartBase.chart, type: "bar", stacked: false },
    plotOptions: { bar: { horizontal: true, borderRadius: 4, dataLabels: { position: "top" } } },
    xaxis: { categories: RISK_GAP_DATA.map(d => d.feature), labels: { style: { colors: ax, fontSize: "11px" } }, min: 0, max: 100 },
    yaxis: { labels: { style: { colors: ax, fontSize: "11px" } } },
    colors: [TEAL, "#ef4444"],
    legend: { position: "top", labels: { colors: ax } },
    dataLabels: { enabled: true, formatter: (val) => `${val}%`, style: { fontSize: "10px" } },
    tooltip: { y: { formatter: (val) => `${val}%` } },
  };
  const riskGapSeries = [
    { name: "Tiếp tục sử dụng", data: RISK_GAP_DATA.map(d => d.noChurn) },
    { name: "Rời bỏ dịch vụ",   data: RISK_GAP_DATA.map(d => d.churn) },
  ];

  return (
    <div className="space-y-5">
      {/* ── Interactive Chart ── */}
      <Card extra="p-6">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <SectionLabel text="Bivariate Analysis" />
            <h3 className="text-lg font-bold text-navy-700 dark:text-white">Phân tích hai biến với Churn</h3>
            <p className="text-xs text-gray-500">Ảnh hưởng của từng đặc trưng tới Churn</p>
          </div>
          <select value={biCol} onChange={(e) => setBiCol(e.target.value)} className={selectCls}>
            <optgroup label="Categorical">
              {ov?.feature_roles?.categorical.map((c) => <option key={c} value={c}>{c}</option>)}
            </optgroup>
            <optgroup label="Numerical">
              {ov?.feature_roles?.numerical.map((c) => <option key={c} value={c}>{c}</option>)}
            </optgroup>
          </select>
        </div>

        {biL ? <Spin /> : biD ? (
          <div className="space-y-4">
            <div className="h-[350px]">
              <Chart options={bvOpt} series={bvS} type={isCat ? "bar" : "boxPlot"} height="100%" />
            </div>
            {biD.insight && (
              <div className="rounded-xl bg-green-50 p-4 dark:bg-green-950/20">
                <p className="mb-1 text-[10px] uppercase tracking-widest text-green-500">Đánh giá</p>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{biD.insight}</p>
              </div>
            )}
          </div>
        ) : null}
      </Card>

      {/* ── Risk Gap Chart (notebook cell 103) ── */}
      <Card extra="p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-red-500">Phân tích Risk Gap — Dịch vụ bổ trợ</span>
        </div>
        <div className="h-[280px]">
          <Chart options={riskGapOpt} series={riskGapSeries} type="bar" height="100%" />
        </div>
        <div className="mt-4 space-y-2 rounded-xl bg-red-50 p-4 dark:bg-red-950/20">
          <ul className="space-y-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
              <span>Dịch vụ bảo mật trực tuyến <strong className="text-navy-700 dark:text-white">OnlineSecurity</strong> và hỗ trợ kỹ thuật <strong className="text-navy-700 dark:text-white">TechSupport</strong> dẫn đầu về khả năng giữ chân — giảm churn từ ~40% xuống chỉ còn <strong>8.7%</strong> và <strong>9.6%</strong>. Mức chênh lệch hơn <strong>30%</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
              <span><strong className="text-navy-700 dark:text-white">OnlineBackup</strong> và <strong className="text-navy-700 dark:text-white">DeviceProtection</strong> duy trì hiệu quả ấn tượng với mức chênh lệch xấp xỉ <strong>20%</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
              <span>Trái ngược hoàn toàn, <strong className="text-navy-700 dark:text-white">StreamingMovies</strong> và <strong className="text-navy-700 dark:text-white">StreamingTV</strong> gần như không có hiệu quả giữ chân — độ chênh lệch chỉ <strong>1.3%–1.6%</strong>. Dịch vụ streaming của nhà mạng rất dễ bị thay thế bởi các nền tảng bên thứ ba.</span>
            </li>
          </ul>
        </div>
      </Card>

      {/* ── Expected Churn Segments (notebook cell 98) ── */}
      <Card extra="p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-orange-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-orange-500">Phân khúc rủi ro thực sự (Expected Churn)</span>
        </div>
        <div className="space-y-3">
          {EXPECTED_CHURN_SEGMENTS.map((seg, i) => (
            <div key={i} className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 p-4 dark:border-white/10">
              <div>
                <p className="text-sm font-semibold text-navy-700 dark:text-white">{seg.segment}</p>
                <p className="text-xs text-gray-500">Quy mô: {seg.size}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold" style={{ color: seg.color }}>{seg.expectedChurn}</p>
                <p className="text-[10px] uppercase tracking-wide text-gray-400">Tỷ lệ rời bỏ dự kiến</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-gray-500">
          Cứ <strong>5</strong> khách hàng của công ty sẽ có <strong>1</strong> người thuộc nhóm hợp đồng ngắn hạn và rời bỏ dịch vụ.
        </p>
      </Card>
    </div>
  );
};

export default BivariatePanel;
