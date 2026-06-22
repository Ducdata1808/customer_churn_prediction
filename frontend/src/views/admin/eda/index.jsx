import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "components/card";
import { MdWarning, MdRefresh } from "react-icons/md";

// Import Custom Tabs component
import EdaTabs from "./EdaTabs";

// Import Panels
import OverviewPanel from "./components/OverviewPanel";
import SanityPanel from "./components/SanityPanel";
import StatsPanel from "./components/StatsPanel";
import UnivariatePanel from "./components/UnivariatePanel";
import CorrelationPanel from "./components/CorrelationPanel";
import BivariatePanel from "./components/BivariatePanel";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

const EDADashboard = () => {
  const [tab, setTab] = useState("overview");
  const [ov, setOv] = useState(null);
  const [san, setSan] = useState(null);
  const [ns, setNs] = useState(null);
  const [cor, setCor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        setError("Không thể kết nối Backend. Hãy kiểm tra server đang chạy tại cổng 8002.");
        setLoading(false);
      }
    })();
  }, []);

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
      <EdaTabs active={tab} onChange={setTab} />

      {/* Active Panel */}
      <div>
        {tab === "overview" && <OverviewPanel ov={ov} />}
        {tab === "sanity" && <SanityPanel san={san} />}
        {tab === "stats" && <StatsPanel ns={ns} />}
        {tab === "univariate" && <UnivariatePanel ov={ov} isDark={isDark} />}
        {tab === "correlation" && <CorrelationPanel cor={cor} isDark={isDark} />}
        {tab === "bivariate" && <BivariatePanel ov={ov} isDark={isDark} />}
      </div>
    </div>
  );
};

export default EDADashboard;
