import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  MdArrowForward,
  MdBarChart,
  MdPeople,
  MdAutoGraph,
  MdCheckCircle,
  MdTrendingDown,
  MdBolt,
  MdInsights,
} from "react-icons/md";

// ─── Brand tokens matching Horizon UI template ─────────────────────────────
// brand-500 = #422AFB  brand-400 = #868CFF  navy-700 = #1B254B
// lightPrimary = #F4F7FE  white, gray shades

const FEATURES = [
  {
    icon: MdInsights,
    title: "EDA Dashboard",
    desc: "Phân tích toàn diện 7,043 khách hàng: phân phối, tương quan, bivariate — tất cả trực quan hóa theo thời gian thực.",
    color: "from-brand-500/10 to-brand-400/5",
    border: "border-brand-500/20",
    iconBg: "bg-brand-500",
  },
  {
    icon: MdAutoGraph,
    title: "Churn Prediction",
    desc: "Nhập hồ sơ khách hàng, nhận xác suất rời mạng tức thì cùng hành động CSKH đề xuất từ mô hình LightGBM.",
    color: "from-purple-500/10 to-purple-400/5",
    border: "border-purple-500/20",
    iconBg: "bg-purple-500",
  },
  {
    icon: MdBarChart,
    title: "Model Comparison",
    desc: "Huấn luyện và so sánh 5 thuật toán ML (LR, DT, RF, XGBoost, LightGBM) với hyperparameter tuning trực tiếp.",
    color: "from-indigo-500/10 to-indigo-400/5",
    border: "border-indigo-500/20",
    iconBg: "bg-indigo-500",
  },
];

const STATS = [
  { value: "7,043", label: "Khách hàng", icon: MdPeople },
  { value: "93.4%", label: "Độ chính xác", icon: MdCheckCircle },
  { value: "26.5%", label: "Churn Rate", icon: MdTrendingDown },
  { value: "5 Model", label: "Thuật toán", icon: MdBolt },
];

const PIPELINE = [
  {
    step: "01",
    title: "Thu thập & Xác thực",
    desc: "Nạp dataset IBM Telco Customer Churn (7,043 dòng, 21 cột). Kiểm tra schema, xử lý missing values, sanity check logic.",
    badge: "Data Ingestion",
    done: true,
  },
  {
    step: "02",
    title: "Xử lý & Cân bằng",
    desc: "Label encoding, feature engineering, chuẩn hóa cột số. Áp dụng SMOTE để cân bằng lớp dữ liệu (26.5% → 50%).",
    badge: "Preprocessing",
    done: true,
  },
  {
    step: "03",
    title: "Huấn luyện & Dự đoán",
    desc: "Train 5 mô hình ML, đánh giá qua Accuracy / F1 / ROC-AUC. Export model tối ưu (LightGBM) phục vụ inference API.",
    badge: "ML Pipeline",
    done: true,
  },
];

// ── Animated counter ────────────────────────────────────────────────────────
function useCountUp(target, duration = 1500, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const num = parseFloat(target.replace(/[^0-9.]/g, ""));
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * num));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [visible, setVisible] = useState(false);
  const heroRef = useRef(null);

  // Remove dark mode forced by old landing page
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    return () => {};
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    setVisible(true);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const statsVisible = scrollY > 300;
  const c0 = useCountUp("7043", 1500, statsVisible);
  const c1 = useCountUp("93.4", 1500, statsVisible);
  const c2 = useCountUp("26.5", 1500, statsVisible);

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrollY > 50
            ? "bg-white/90 backdrop-blur-md shadow-sm shadow-gray-100 border-b border-gray-100"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
              <MdInsights className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-navy-700">
              Churn<span className="text-brand-500">Pulse</span>
            </span>
          </div>

          {/* Links */}
          <div className="hidden items-center gap-8 md:flex">
            {["Pipeline", "Tính năng", "Mô hình"].map((l) => (
              <a
                key={l}
                href={`#${l}`}
                className="text-sm font-semibold text-gray-600 transition-colors hover:text-brand-500"
              >
                {l}
              </a>
            ))}
          </div>

          {/* CTA */}
          <Link
            to="/admin"
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-600 hover:shadow-brand-500/40 hover:scale-[1.02]"
          >
            Vào Dashboard <MdArrowForward className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#F4F7FE] via-white to-[#EEF2FF] px-6 pt-20 pb-16"
      >
        {/* Background blobs */}
        <div className="pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-brand-500/8 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-500/8 blur-[100px]" />

        {/* Dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #422AFB22 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Badge */}
        <div
          className={`relative z-10 mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/8 px-4 py-2 text-xs font-bold text-brand-500 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
          IBM Telco Customer Churn · LightGBM · FastAPI · React
        </div>

        {/* Headline */}
        <div className="relative z-10 max-w-4xl text-center">
          <h1
            className={`text-5xl font-extrabold leading-tight tracking-tight text-navy-700 md:text-7xl transition-all duration-700 delay-100 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            Dự báo rủi ro{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-brand-500">rời mạng</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 rounded-sm bg-brand-500/15 -z-0" />
            </span>
            <br />
            <span className="text-gray-400 font-light">bằng Machine Learning.</span>
          </h1>

          <p
            className={`mt-6 text-lg leading-relaxed text-gray-500 md:text-xl max-w-2xl mx-auto transition-all duration-700 delay-200 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            Phân tích 7,043 khách hàng viễn thông, phát hiện sớm nguy cơ rời dịch vụ và đề xuất hành động giữ chân hiệu quả.
          </p>

          <div
            className={`mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center transition-all duration-700 delay-300 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <Link
              to="/admin"
              className="flex items-center gap-2 rounded-2xl bg-brand-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-brand-500/30 transition-all hover:bg-brand-600 hover:shadow-brand-500/50 hover:scale-[1.03]"
            >
              Khám phá Dashboard <MdArrowForward className="h-5 w-5" />
            </Link>
            <a
              href="#Pipeline"
              className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-navy-700 shadow-sm transition-all hover:border-brand-300 hover:shadow-md"
            >
              Xem Pipeline →
            </a>
          </div>
        </div>

        {/* Hero dashboard mockup */}
        <div
          className={`relative z-10 mt-16 w-full max-w-5xl transition-all duration-1000 delay-500 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <div className="rounded-2xl border border-gray-200 bg-white p-1.5 shadow-2xl shadow-gray-200/80">
            {/* Fake browser bar */}
            <div className="flex items-center gap-1.5 rounded-t-xl bg-gray-50 px-4 py-3 border-b border-gray-100">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-3 flex-1 rounded-md bg-white border border-gray-200 px-3 py-1 text-xs text-gray-400">
                localhost:3000/admin/default
              </span>
            </div>
            {/* Mockup content */}
            <div className="rounded-b-xl bg-[#F4F7FE] p-6 space-y-4">
              {/* Widget row */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Tổng Churn", val: "1,869", color: "text-red-500" },
                  { label: "Tổng KH", val: "7,043", color: "text-navy-700" },
                  { label: "Accuracy", val: "93.4%", color: "text-brand-500" },
                  { label: "ROC-AUC", val: "0.934", color: "text-green-500" },
                ].map((w) => (
                  <div key={w.label} className="rounded-2xl bg-white p-4 shadow-sm shadow-gray-100">
                    <p className="text-xs text-gray-500">{w.label}</p>
                    <p className={`mt-1 text-xl font-bold ${w.color}`}>{w.val}</p>
                  </div>
                ))}
              </div>
              {/* Fake chart bar */}
              <div className="rounded-2xl bg-white p-4 shadow-sm shadow-gray-100">
                <p className="mb-3 text-sm font-semibold text-navy-700">Churn Rate theo Hợp đồng</p>
                <div className="space-y-2">
                  {[
                    { label: "Month-to-month", pct: 88, color: "bg-brand-500" },
                    { label: "One year", pct: 28, color: "bg-indigo-400" },
                    { label: "Two year", pct: 8, color: "bg-green-400" },
                  ].map((b) => (
                    <div key={b.label} className="flex items-center gap-3">
                      <span className="w-28 text-xs text-gray-500 shrink-0">{b.label}</span>
                      <div className="flex-1 rounded-full bg-gray-100 h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${b.color}`}
                          style={{ width: `${b.pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-navy-700 w-8 text-right">{b.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Band ─────────────────────────────────────────────────── */}
      <section className="border-y border-gray-100 bg-white py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
          {STATS.map(({ value, label, icon: Icon }, i) => {
            const displayVal =
              i === 0
                ? statsVisible ? c0.toLocaleString() : "0"
                : i === 1
                ? statsVisible ? `${c1}%` : "0%"
                : i === 2
                ? statsVisible ? `${c2}%` : "0%"
                : value;
            return (
              <div key={label} className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10">
                  <Icon className="h-6 w-6 text-brand-500" />
                </div>
                <p className="text-3xl font-extrabold text-navy-700">{displayVal}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section id="Tính năng" className="bg-[#F4F7FE] py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <span className="mb-3 inline-block rounded-full bg-brand-500/10 px-4 py-1.5 text-xs font-bold text-brand-500">
              Tính năng hệ thống
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-navy-700 md:text-4xl">
              Ba module phân tích{" "}
              <span className="text-brand-500">toàn diện</span>
            </h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">
              Từ EDA khám phá dữ liệu, dự đoán churn theo thời gian thực, đến so sánh hiệu năng mô hình ML.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc, color, border, iconBg }) => (
              <div
                key={title}
                className={`group rounded-2xl border bg-gradient-to-br p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10 ${border} ${color}`}
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-navy-700">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pipeline ───────────────────────────────────────────────────── */}
      <section id="Pipeline" className="bg-white py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <span className="mb-3 inline-block rounded-full bg-brand-500/10 px-4 py-1.5 text-xs font-bold text-brand-500">
              ML Pipeline
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-navy-700 md:text-4xl">
              3 giai đoạn{" "}
              <span className="text-brand-500">end-to-end</span>
            </h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">
              Quy trình xây dựng mô hình hoàn chỉnh từ thu thập dữ liệu thô đến API dự đoán production.
            </p>
          </div>

          <div className="relative space-y-6">
            {/* Connector line */}
            <div className="absolute left-8 top-8 bottom-8 hidden w-0.5 bg-gradient-to-b from-brand-500 via-indigo-400 to-green-400 md:block" />

            {PIPELINE.map(({ step, title, desc, badge, done }) => (
              <div
                key={step}
                className="relative flex gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-brand-200"
              >
                {/* Step circle */}
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-black text-white shadow-lg shadow-brand-500/30">
                  {step}
                </div>

                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-3">
                    <h3 className="text-lg font-bold text-navy-700">{title}</h3>
                    <span className="rounded-full bg-green-50 border border-green-100 px-2.5 py-0.5 text-[10px] font-bold text-green-600 uppercase tracking-wider">
                      {done ? "✓ Hoàn thành" : badge}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Model Showcase ─────────────────────────────────────────────── */}
      <section id="Mô hình" className="bg-[#F4F7FE] py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <span className="mb-3 inline-block rounded-full bg-brand-500/10 px-4 py-1.5 text-xs font-bold text-brand-500">
              So sánh mô hình
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-navy-700 md:text-4xl">
              LightGBM dẫn đầu{" "}
              <span className="text-brand-500">leaderboard</span>
            </h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {/* Table header */}
            <div className="grid grid-cols-5 gap-4 border-b border-gray-100 bg-gray-50 px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">
              <span className="col-span-2">Thuật toán</span>
              <span className="text-center">Accuracy</span>
              <span className="text-center">F1-Score</span>
              <span className="text-center">ROC-AUC</span>
            </div>
            {[
              { name: "LightGBM", acc: 93.4, f1: 86.4, auc: 0.934, best: true },
              { name: "XGBoost", acc: 91.8, f1: 84.1, auc: 0.919, best: false },
              { name: "Random Forest", acc: 90.2, f1: 82.7, auc: 0.908, best: false },
              { name: "Decision Tree", acc: 85.6, f1: 76.3, auc: 0.862, best: false },
              { name: "Logistic Regression", acc: 82.1, f1: 72.5, auc: 0.841, best: false },
            ].map((m) => (
              <div
                key={m.name}
                className={`grid grid-cols-5 items-center gap-4 border-b border-gray-50 px-6 py-4 transition-colors last:border-0 ${
                  m.best ? "bg-brand-500/5" : "hover:bg-gray-50"
                }`}
              >
                <div className="col-span-2 flex items-center gap-3">
                  {m.best && (
                    <span className="rounded-full bg-brand-500 px-2.5 py-0.5 text-[10px] font-black text-white">
                      BEST
                    </span>
                  )}
                  <span className={`text-sm font-bold ${m.best ? "text-brand-500" : "text-navy-700"}`}>
                    {m.name}
                  </span>
                </div>
                <span className="text-center text-sm font-mono font-semibold text-navy-700">{m.acc}%</span>
                <span className="text-center text-sm font-mono font-semibold text-navy-700">{m.f1}%</span>
                <span className="text-center text-sm font-mono font-semibold text-navy-700">{m.auc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand-500 py-24 px-6">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white/5" />

        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
            Sẵn sàng khám phá
            <br />
            <span className="text-brand-200">hệ thống phân tích?</span>
          </h2>
          <p className="mt-5 text-lg text-white/70 max-w-xl mx-auto">
            Truy cập Dashboard để xem EDA toàn bộ dataset, chạy dự đoán churn real-time và so sánh hiệu năng mô hình ML.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/admin"
              className="flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-brand-500 shadow-xl shadow-black/10 transition-all hover:scale-[1.03] hover:shadow-2xl"
            >
              Vào Dashboard ngay <MdArrowForward className="h-5 w-5" />
            </Link>
            <Link
              to="/admin/predict"
              className="flex items-center gap-2 rounded-2xl border-2 border-white/30 bg-transparent px-8 py-4 text-base font-bold text-white transition-all hover:bg-white/10 hover:border-white/60"
            >
              Thử Churn Prediction
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white py-8 px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-sm text-gray-400 md:flex-row">
          <div className="flex items-center gap-2 font-bold text-navy-700">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500">
              <MdInsights className="h-4 w-4 text-white" />
            </div>
            Churn<span className="text-brand-500">Pulse</span>
          </div>
          <p>©2026 Horizon UI · All Rights Reserved</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-brand-500 transition-colors">Support</a>
            <a href="#" className="hover:text-brand-500 transition-colors">License</a>
            <a href="#" className="hover:text-brand-500 transition-colors">Blog</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
