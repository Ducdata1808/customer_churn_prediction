import React, { useState, useEffect } from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import Card from "components/card";
import Widget from "components/widget/Widget";
import {
  MdPeople,
  MdTrendingUp,
  MdWarning,
  MdCheckCircle,
  MdArrowDropUp,
  MdArrowDropDown,
  MdBarChart,
} from "react-icons/md";
import { IoStatsChart } from "react-icons/io5";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

// ── Chart theme helpers ────────────────────────────────────────────────────────
const chartBase = (isDark) => ({
  chart: {
    background: "transparent",
    toolbar: { show: false },
    animations: { enabled: true, easing: "easeinout", speed: 600 },
  },
  theme: { mode: isDark ? "dark" : "light" },
  grid: {
    borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(46,64,54,0.08)",
    strokeDashArray: 4,
  },
  tooltip: { theme: isDark ? "dark" : "light" },
});

const BRAND  = "#422AFB"; // Horizon UI brand-500 purple
const TEAL   = "#14b8a6";
const AMBER  = "#f97316";

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [churnDist, setChurnDist] = useState(null);
  const [contractSeries, setContractSeries] = useState([
    { name: "Churn Rate (%)", data: [42.7, 11.3, 2.8] },
    { name: "Retain Rate (%)", data: [57.3, 88.7, 97.2] },
  ]);
  const [contractCats, setContractCats] = useState([
    "Month-to-month",
    "One year",
    "Two year",
  ]);
  const [internetSeries, setInternetSeries] = useState([44.0, 34.1, 21.9]);
  const [internetLabels, setInternetLabels] = useState([
    "Fiber optic",
    "DSL",
    "No",
  ]);
  const [tenureCats, setTenureCats] = useState([
    "0-12",
    "13-24",
    "25-36",
    "37-48",
    "49-60",
    "61-72",
  ]);
  const [tenureSeries, setTenureSeries] = useState([
    { name: "Churn", data: [31.6, 26.8, 22.1, 18.4, 15.2, 10.5] },
    { name: "Retain", data: [68.4, 73.2, 77.9, 81.6, 84.8, 89.5] },
  ]);
  const [riskFeatures, setRiskFeatures] = useState([
    { feature: "Loại hợp đồng (Contract)", impact: "Cao", direction: "Month-to-month → rời mạng nhiều nhất", risk: 90 },
    { feature: "Thời gian sử dụng (Tenure)", impact: "Cao", direction: "Tenure thấp → rủi ro cao", risk: 85 },
    { feature: "Internet Service", impact: "Trung bình", direction: "Fiber Optic → churn cao hơn", risk: 62 },
    { feature: "Monthly Charges", impact: "Trung bình", direction: "Cước cao → tỷ lệ churn tăng", risk: 58 },
    { feature: "Tech Support", impact: "Thấp", direction: "Không có hỗ trợ kỹ thuật", risk: 35 },
  ]);
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains("dark"))
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    axios.get(`${API_BASE}/api/v1/eda/overview`).then((r) => setOverview(r.data)).catch(() => {});
    axios.get(`${API_BASE}/api/v1/eda/distribution/categorical/Churn`).then((r) => setChurnDist(r.data)).catch(() => {});

    axios.get(`${API_BASE}/api/v1/eda/bivariate/Contract`).then((r) => {
      if (r.data?.type === "categorical") {
        const { index, values } = r.data;
        const churn = [], retain = [];
        index.forEach((_, i) => {
          const row = values[i] || [0, 0];
          const tot = (row[0] || 0) + (row[1] || 0) || 1;
          churn.push(+((row[1] / tot) * 100).toFixed(1));
          retain.push(+((row[0] / tot) * 100).toFixed(1));
        });
        setContractCats(index);
        setContractSeries([
          { name: "Churn Rate (%)", data: churn },
          { name: "Retain Rate (%)", data: retain },
        ]);
      }
    }).catch(() => {});

    axios.get(`${API_BASE}/api/v1/eda/distribution/categorical/InternetService`).then((r) => {
      if (r.data?.percentages && r.data?.labels) {
        setInternetSeries(r.data.percentages);
        setInternetLabels(r.data.labels);
      }
    }).catch(() => {});

    axios.get(`${API_BASE}/api/v1/eda/tenure-binned`).then((r) => {
      if (r.data?.categories) {
        setTenureCats(r.data.categories);
        setTenureSeries([
          { name: "Churn", data: r.data.churn_percentages },
          { name: "Retain", data: r.data.retain_percentages },
        ]);
      }
    }).catch(() => {});

    axios.get(`${API_BASE}/api/v1/eda/risk-features`).then((r) => {
      if (r.data?.risk_features) setRiskFeatures(r.data.risk_features);
    }).catch(() => {});
  }, []);

  const totalSamples = overview?.shape?.rows ?? 7043;
  const totalFeatures = (overview?.shape?.columns ?? 21) - 1;
  const missingValues = overview?.missing_values_count ?? 0;

  let churnCount = Math.round(totalSamples * 0.265);
  if (churnDist?.labels && churnDist?.counts) {
    const yi = churnDist.labels.indexOf("Yes");
    if (yi !== -1) churnCount = churnDist.counts[yi];
  }
  const retainCount = totalSamples - churnCount;
  const churnPct = ((churnCount / totalSamples) * 100).toFixed(1);
  const retainPct = ((retainCount / totalSamples) * 100).toFixed(1);

  const ax = isDark ? "rgba(255,255,255,0.85)" : "#1a1a1a";
  const base = chartBase(isDark);

  const contractOptions = {
    ...base,
    plotOptions: { bar: { borderRadius: 8, columnWidth: "45%" } },
    xaxis: {
      categories: contractCats,
      labels: { style: { colors: ax, fontSize: "11px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: ax, fontSize: "10px" } } },
    dataLabels: {
      enabled: true,
      style: { colors: [ax], fontSize: "11px" },
      formatter: (v) => `${v}%`,
    },
    colors: [BRAND, TEAL],
    legend: {
      show: true,
      position: "top",
      labels: { colors: ax },
      fontSize: "10px",
    },
    fill: { type: "solid", opacity: 0.85 },
  };

  const donutOptions = {
    ...base,
    labels: internetLabels.map((l) =>
      l === "Fiber optic" ? "Fiber Optic" : l === "No" ? "No Internet" : l
    ),
    colors: [BRAND, AMBER, TEAL],
    stroke: { width: 3 },
    legend: { show: false },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: { show: false },
            value: {
              show: true,
              fontSize: "16px",
              fontWeight: "bold",
              color: ax,
              offsetY: 6,
            },
            total: {
              show: true,
              showAlways: true,
              label: "",
              formatter: () => "Internet",
            },
          },
        },
      },
    },
  };

  const tenureOptions = {
    ...base,
    chart: { ...base.chart, type: "area" },
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { type: "vertical", shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.02 }, colors: [BRAND, TEAL] },
    xaxis: {
      categories: tenureCats,
      labels: { style: { colors: ax, fontSize: "11px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
      title: { text: "Tenure (tháng)", style: { color: ax, fontSize: "10px" } },
    },
    yaxis: { labels: { style: { colors: ax } } },
    dataLabels: { enabled: false },
    colors: [BRAND, TEAL],
    markers: { size: 4, strokeWidth: 2, hover: { size: 7 } },
    legend: { show: true, position: "top", labels: { colors: ax }, fontSize: "10px" },
  };

  const impactColor = { Cao: "text-red-500", "Trung bình": "text-orange-400", Thấp: "text-green-500" };

  return (
    <div className="space-y-5 pt-5 pb-10">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
          Tổng quan hệ thống
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Telco Customer Churn — IBM Sample Dataset · {totalSamples.toLocaleString()} khách hàng
        </p>
      </div>

      {/* KPI Widgets Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-5">
        <Widget icon={<MdWarning className="h-6 w-6" />} title="Tổng khách rời bỏ dịch vụ" subtitle={churnCount.toLocaleString()} />
        <Widget icon={<MdPeople className="h-6 w-6" />} title="Tổng khách hàng" subtitle={totalSamples.toLocaleString()} />
        <Widget icon={<MdCheckCircle className="h-6 w-6" />} title="Tổng khách tiếp tục sử dụng dịch vụ" subtitle={retainCount.toLocaleString()} />
        <Widget icon={<IoStatsChart className="h-5 w-5" />} title="Số thuộc tính" subtitle={String(totalFeatures)} />
        <Widget icon={<MdTrendingUp className="h-6 w-6" />} title="Churn Rate" subtitle={`${churnPct}%`} />
      </div>

      {/* Summary cards row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card extra="p-5 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/20">
            <MdArrowDropDown className="h-7 w-7 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Churn rate</p>
            <p className="text-2xl font-bold text-navy-700 dark:text-white">{churnPct}%</p>
          </div>
        </Card>
        <Card extra="p-5 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 dark:bg-green-950/20">
            <MdArrowDropUp className="h-7 w-7 text-green-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Retention rate</p>
            <p className="text-2xl font-bold text-navy-700 dark:text-white">{retainPct}%</p>
          </div>
        </Card>
        <Card extra="p-5 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lightPrimary dark:bg-navy-700">
            <MdBarChart className="h-6 w-6 text-brand-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Giá trị khuyết</p>
            <p className="text-2xl font-bold text-navy-700 dark:text-white">
              {missingValues}
            </p>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Contract vs Churn bar */}
        <Card extra="p-6 lg:col-span-2">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-widest text-gray-500">Bivariate Analysis</p>
            <h3 className="text-lg font-bold text-navy-700 dark:text-white">
              Churn Rate theo Loại Hợp đồng
            </h3>
          </div>
          <div className="h-[260px]">
            <Chart options={contractOptions} series={contractSeries} type="bar" height="100%" />
          </div>
        </Card>

        {/* Internet Service Donut */}
        <Card extra="p-6">
          <div className="mb-2">
            <p className="text-xs uppercase tracking-widest text-gray-500">Distribution</p>
            <h3 className="text-lg font-bold text-navy-700 dark:text-white">
              Dịch vụ Internet
            </h3>
          </div>
          <div className="h-[200px]">
            <Chart options={donutOptions} series={internetSeries} type="donut" height="100%" />
          </div>
          <div className="mt-3 flex justify-around">
            {internetLabels.map((label, idx) => {
              const display = label === "Fiber optic" ? "Fiber Optic" : label === "No" ? "No Internet" : label;
              const colors = [BRAND, AMBER, TEAL];
              return (
                <div key={label} className="flex flex-col items-center gap-0.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: colors[idx] }} />
                  <p className="text-[9px] text-gray-500">{display}</p>
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    {Number(internetSeries[idx] ?? 0).toFixed(1)}%
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Tenure Chart */}
      <Card extra="p-6">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-widest text-gray-500">Tenure Analysis</p>
          <h3 className="text-lg font-bold text-navy-700 dark:text-white">
            Churn Rate theo Tenure (số tháng sử dụng)
          </h3>
        </div>
        <div className="h-[220px]">
          <Chart options={tenureOptions} series={tenureSeries} type="area" height="100%" />
        </div>
      </Card>

      {/* Risk Features Table */}
      <Card extra="p-6 overflow-x-auto">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-widest text-gray-500">Top Risk Features</p>
          <h3 className="text-lg font-bold text-navy-700 dark:text-white">
            Yếu tố ảnh hưởng Churn
          </h3>
        </div>
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-white/10">
              {["Feature", "Mức ảnh hưởng", "Hướng tác động", "Risk Score (Tỷ lệ Churn %)"].map((h) => (
                <th key={h} className="py-2.5 pr-4 text-left text-[10px] uppercase tracking-widest text-gray-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {riskFeatures.map((row, i) => (
              <tr key={i} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors">
                <td className="py-3 pr-4 text-sm font-semibold text-navy-700 dark:text-white">{row.feature}</td>
                <td className="py-3 pr-4">
                  <span className={`text-xs font-bold ${impactColor[row.impact] || "text-gray-500"}`}>
                    {row.impact}
                  </span>
                </td>
                <td className="py-3 pr-4 text-xs text-gray-600 dark:text-gray-400">{row.direction}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 rounded-full bg-gray-200 dark:bg-navy-700">
                      <div
                        className="h-1.5 rounded-full bg-brand-500"
                        style={{ width: `${row.risk}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-gray-500">{row.risk}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default Dashboard;
