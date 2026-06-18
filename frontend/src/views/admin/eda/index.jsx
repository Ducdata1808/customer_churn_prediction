import React, { useState, useEffect } from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import Card from "components/card";
import Widget from "components/widget/Widget";
import {
  MdGridOn,
  MdWarning,
  MdAnalytics,
  MdCheckCircle,
  MdBarChart,
  MdBubbleChart,
  MdTableChart,
  MdCompareArrows,
  MdRefresh,
} from "react-icons/md";
import { IoDocuments } from "react-icons/io5";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

const BRAND = "#422AFB"; // Horizon UI brand-500 purple
const TEAL  = "#14b8a6";
const AMBER = "#f97316";

const TABS = [
  { id: "overview",     label: "Tổng quan",          icon: MdGridOn,       c: BRAND },
  { id: "sanity",       label: "Kiểm tra Logic",      icon: MdCheckCircle,  c: "#22c55e" },
  { id: "stats",        label: "Thống kê mô tả",      icon: MdTableChart,   c: AMBER },
  { id: "univariate",   label: "Phân tích đơn biến",  icon: MdBarChart,     c: BRAND },
  { id: "correlation",  label: "Ma trận tương quan",  icon: MdBubbleChart,  c: "#14b8a6" },
  { id: "bivariate",    label: "Phân tích hai biến",  icon: MdCompareArrows,c: AMBER },
];

const Spin = () => (
  <div className="flex h-[300px] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-brand-500 border-gray-200 dark:border-white/10" />
  </div>
);

const SectionLabel = ({ text }) => (
  <p className="mb-1 text-xs uppercase tracking-widest text-gray-500">{text}</p>
);

const EDADashboard = () => {
  const [tab, setTab] = useState("overview");
  const [ov, setOv] = useState(null);
  const [san, setSan] = useState(null);
  const [ns, setNs] = useState(null);
  const [cor, setCor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uniCol, setUniCol] = useState("tenure");
  const [uniD, setUniD] = useState(null);
  const [uniL, setUniL] = useState(false);
  const [biCol, setBiCol] = useState("Contract");
  const [biD, setBiD] = useState(null);
  const [biL, setBiL] = useState(false);
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
    (async () => {
      try {
        setLoading(true);
        const [o, s, n, c] = await Promise.all([
          axios.get(`${API}/api/v1/eda/overview`),
          axios.get(`${API}/api/v1/eda/sanity-check`),
          axios.get(`${API}/api/v1/eda/numerical-stats`),
          axios.get(`${API}/api/v1/eda/correlation`),
        ]);
        setOv(o.data); setSan(s.data); setNs(n.data); setCor(c.data);
        setLoading(false);
      } catch {
        setError("Không thể kết nối Backend. Hãy kiểm tra server đang chạy tại cổng 8000.");
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!ov) return;
    const isNum = ov.feature_roles?.numerical?.includes(uniCol);
    (async () => {
      try {
        setUniL(true);
        const url = isNum
          ? `${API}/api/v1/eda/distribution/numerical/${uniCol}?bins=15`
          : `${API}/api/v1/eda/distribution/categorical/${uniCol}`;
        const r = await axios.get(url);
        setUniD({ isNum, data: r.data });
      } catch {}
      finally { setUniL(false); }
    })();
  }, [uniCol, ov]);

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

  const ax = isDark ? "rgba(255,255,255,0.85)" : "#1a1a1a";
  const gr = isDark ? "rgba(255,255,255,0.06)" : "rgba(46,64,54,0.08)";
  const tooltipTheme = isDark ? "dark" : "light";
  const chartBase = {
    chart: { background: "transparent", toolbar: { show: false }, animations: { enabled: true, easing: "easeinout", speed: 600 } },
    theme: { mode: tooltipTheme },
    grid: { borderColor: gr, strokeDashArray: 4 },
    tooltip: { theme: tooltipTheme },
  };

  const nsk = Object.keys(ns || {}).filter((k) => k !== "insight");

  // ─── Loading / Error ──────────────────────────────────────────
  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-brand-500 border-gray-200 dark:border-white/10" />
        <p className="text-sm text-gray-500">Đang tải dữ liệu EDA...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex h-[80vh] items-center justify-center">
      <Card extra="p-10 max-w-md text-center">
        <MdWarning className="mx-auto mb-4 h-10 w-10 text-red-500" />
        <h3 className="mb-2 text-lg font-bold text-navy-700 dark:text-white">Lỗi kết nối</h3>
        <p className="mb-6 text-sm text-gray-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
        >
          <MdRefresh className="h-4 w-4" /> Tải lại
        </button>
      </Card>
    </div>
  );

  // ─── Tab renderers ─────────────────────────────────────────────
  const renderOverview = () => (
    <div className="space-y-5">
      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Widget icon={<MdGridOn className="h-6 w-6" />} title="Số mẫu dữ liệu" subtitle={ov?.shape?.rows?.toLocaleString()} />
        <Widget icon={<IoDocuments className="h-5 w-5" />} title="Số thuộc tính" subtitle={String(ov?.shape?.columns ?? "-")} />
        <Widget icon={<MdWarning className="h-6 w-6" />} title="Bản ghi trùng" subtitle={String(ov?.duplicates ?? 0)} />
        <Widget icon={<MdAnalytics className="h-6 w-6" />} title="Giá trị khuyết" subtitle={ov?.missing_values_count?.toLocaleString() ?? "0"} />
      </div>

      {/* Insight */}
      <Card extra="p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950/20">
            <MdCheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="mb-1 text-xs uppercase tracking-widest text-gray-500">Tổng quan dữ liệu</p>
            <p className="text-sm leading-relaxed text-navy-700 dark:text-white">{ov?.insight}</p>
          </div>
        </div>
      </Card>

      {/* Feature Roles */}
      <Card extra="p-6">
        <SectionLabel text="Feature Roles" />
        <h3 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">Phân loại thuộc tính</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { l: "Numerical", d: ov?.feature_roles?.numerical, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/20" },
            { l: "Categorical", d: ov?.feature_roles?.categorical, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/20" },
            { l: "Target", d: ov?.feature_roles?.target, color: "text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/20" },
          ].map((g) => (
            <div key={g.l} className={`rounded-xl p-4 ${g.bg}`}>
              <p className={`mb-2 text-[10px] uppercase tracking-widest font-bold ${g.color}`}>
                {g.l} ({g.d?.length ?? 0})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {g.d?.map((f) => (
                  <span key={f} className="rounded-md bg-white/60 px-2 py-0.5 text-xs font-mono text-navy-700 dark:bg-navy-800 dark:text-white">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderSanity = () => (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <Card extra="p-6">
        <SectionLabel text="Sanity Check" />
        <h3 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">Kiểm tra Logic</h3>
        <div className="space-y-3">
          {[
            { l: "Tenure lỗi (≤ 0)", v: san?.numerical_sanity?.tenure_invalid },
            { l: "Cước tháng lỗi (≤ 0)", v: san?.numerical_sanity?.monthly_charges_invalid },
            { l: "Cước tổng lỗi (≤ 0)", v: san?.numerical_sanity?.total_charges_invalid },
            { l: "Sai logic Internet", v: san?.categorical_sanity?.internet_logic_errors },
          ].map((x) => (
            <div key={x.l} className="flex items-center justify-between border-b border-gray-100 py-2.5 dark:border-white/10">
              <span className="text-sm text-navy-700 dark:text-white">{x.l}</span>
              <span className={`text-sm font-bold font-mono ${(x.v || 0) > 0 ? "text-red-500" : "text-green-500"}`}>
                {x.v || 0} dòng
              </span>
            </div>
          ))}
        </div>
      </Card>
      <Card extra="p-6 lg:col-span-2">
        <SectionLabel text="Data Quality" />
        <h3 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">Nhận xét chất lượng dữ liệu</h3>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{san?.insight}</p>
      </Card>
    </div>
  );

  const renderStats = () => (
    <Card extra="p-6 overflow-x-auto">
      <SectionLabel text="Descriptive Statistics" />
      <h3 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">Thống kê mô tả</h3>
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-gray-200 dark:border-white/10">
            {["Thuộc tính", "Mean", "Min", "Max", "Median", "Variance", "Skewness", "N-Unique"].map((h) => (
              <th key={h} className="py-3 pr-4 text-left text-[11px] uppercase tracking-widest text-gray-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {nsk.map((k) => {
            const it = ns[k];
            return (
              <tr key={k} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors">
                <td className="py-3.5 pr-4 text-sm font-semibold text-brand-500">{k}</td>
                {[it.mean, it.min, it.max, it.median, it.variance, it.skewness].map((v, i) => (
                  <td key={i} className="py-3.5 pr-4 font-mono text-sm text-navy-700 dark:text-white">
                    {v?.toFixed(2)}
                  </td>
                ))}
                <td className="py-3.5 font-mono text-sm text-navy-700 dark:text-white">{it.nunique}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {ns?.insight && (
        <div className="mt-4 rounded-xl bg-lightPrimary p-4 dark:bg-navy-700">
          <p className="text-sm text-navy-700 dark:text-white">
            <span className="font-semibold text-brand-500">Nhận xét: </span>
            {ns.insight}
          </p>
        </div>
      )}
    </Card>
  );

  const renderUnivariate = () => {
    const histOpt = {
      ...chartBase,
      chart: { ...chartBase.chart, type: "bar" },
      plotOptions: { bar: { borderRadius: 5, columnWidth: "70%" } },
      xaxis: { categories: uniD?.isNum ? uniD.data.labels : [], labels: { rotate: -45, style: { colors: ax, fontSize: "10px" } }, axisBorder: { show: false } },
      yaxis: { labels: { style: { colors: ax } } },
      colors: [BRAND],
      dataLabels: { enabled: false },
    };
    const boxOpt = {
      ...chartBase,
      chart: { ...chartBase.chart, type: "boxPlot" },
      colors: [BRAND, TEAL],
      xaxis: { labels: { style: { colors: ax } } },
      yaxis: { labels: { style: { colors: ax } } },
    };
    const pieOpt = !uniD || uniD.isNum ? {} : {
      labels: uniD.data.labels,
      colors: [BRAND, TEAL, AMBER, "#3b82f6", "#8b5cf6", "#ec4899"],
      chart: { type: "donut", background: "transparent" },
      theme: { mode: tooltipTheme },
      legend: { position: "bottom", labels: { colors: ax } },
      dataLabels: { enabled: true, style: { colors: ["#fff"] } },
      stroke: { width: 2 },
      tooltip: { theme: tooltipTheme },
      plotOptions: { pie: { donut: { size: "65%", labels: { show: true, total: { show: true, color: ax } } } } },
    };

    const selectCls = "rounded-xl border border-gray-200 bg-white/0 px-3 py-2 text-sm text-navy-700 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-800 dark:text-white";

    return (
      <Card extra="p-6">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <SectionLabel text="Univariate Analysis" />
            <h3 className="text-lg font-bold text-navy-700 dark:text-white">Phân tích đơn biến</h3>
            <p className="text-xs text-gray-500">Phân bố giá trị của từng thuộc tính</p>
          </div>
          <select value={uniCol} onChange={(e) => setUniCol(e.target.value)} className={selectCls}>
            <optgroup label="Numerical">
              {ov?.feature_roles?.numerical.map((c) => <option key={c} value={c}>{c}</option>)}
            </optgroup>
            <optgroup label="Categorical">
              {ov?.feature_roles?.categorical.map((c) => <option key={c} value={c}>{c}</option>)}
            </optgroup>
          </select>
        </div>

        {uniL ? <Spin /> : uniD ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="h-[320px]">
              <p className="mb-2 text-center text-[10px] uppercase tracking-widest text-gray-500">
                {uniD.isNum ? "Histogram" : "Tỷ lệ (%)"}
              </p>
              {uniD.isNum
                ? <Chart options={histOpt} series={[{ name: "Count", data: uniD.data.values }]} type="bar" height="90%" />
                : <Chart options={pieOpt} series={uniD.data.counts} type="donut" height="90%" />
              }
            </div>
            <div className="flex flex-col gap-4">
              {uniD.isNum && (
                <div className="h-[200px]">
                  <p className="mb-2 text-center text-[10px] uppercase tracking-widest text-gray-500">Boxplot</p>
                  <Chart
                    options={boxOpt}
                    series={[{ type: "boxPlot", data: [{ x: uniCol, y: [uniD.data.boxplot_data?.min, uniD.data.boxplot_data?.q1, uniD.data.boxplot_data?.median, uniD.data.boxplot_data?.q3, uniD.data.boxplot_data?.max] }] }]}
                    type="boxPlot"
                    height="85%"
                  />
                </div>
              )}
              {!uniD.isNum && (
                <div className="max-h-[200px] overflow-y-auto rounded-xl bg-lightPrimary p-4 dark:bg-navy-700">
                  <p className="mb-2 text-[10px] uppercase tracking-widest text-gray-500">Bảng tần suất</p>
                  {uniD.data.labels.map((l, i) => (
                    <div key={l} className="flex justify-between py-1 text-sm">
                      <span className="text-navy-700 dark:text-white">{l}</span>
                      <span className="font-mono font-semibold text-brand-500">
                        {uniD.data.counts[i]?.toLocaleString()} ({uniD.data.percentages[i]?.toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex-1 rounded-xl bg-orange-50 p-4 dark:bg-orange-950/20">
                <p className="mb-1 text-[10px] uppercase tracking-widest text-orange-400">Nhận xét</p>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{uniD.data.insight}</p>
              </div>
            </div>
          </div>
        ) : null}
      </Card>
    );
  };

  const renderCorrelation = () => {
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
    return (
      <Card extra="p-6">
        <SectionLabel text="Correlation Matrix" />
        <h3 className="mb-1 text-lg font-bold text-navy-700 dark:text-white">Ma trận tương quan</h3>
        <p className="mb-4 text-xs text-gray-500">Độ tương quan tuyến tính giữa các biến định lượng</p>
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
    );
  };

  const renderBivariate = () => {
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

    return (
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
    );
  };

  const panels = {
    overview: renderOverview,
    sanity: renderSanity,
    stats: renderStats,
    univariate: renderUnivariate,
    correlation: renderCorrelation,
    bivariate: renderBivariate,
  };

  return (
    <div className="space-y-5 pt-5 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-700 dark:text-white">EDA Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Phân tích toàn diện tập dữ liệu churn khách hàng viễn thông
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(({ id, label, icon: Icon, c }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                active
                  ? "border-brand-500 bg-brand-500/10 text-navy-700 dark:text-white shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:border-brand-300 dark:border-white/10 dark:bg-navy-800 dark:text-gray-400 dark:hover:border-brand-500/30"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-brand-500" : ""}`} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Active Panel */}
      <div key={tab}>
        {panels[tab]?.()}
      </div>
    </div>
  );
};

export default EDADashboard;
