import React from "react";
import Card from "components/card";

export const BRAND = "#422AFB"; // Horizon UI brand-500 purple
export const TEAL  = "#14b8a6";
export const AMBER = "#f97316";

export const SectionLabel = ({ text }) => (
  <p className="mb-1 text-xs uppercase tracking-widest text-gray-500">{text}</p>
);

export const Spin = () => (
  <div className="flex h-[300px] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-brand-500 border-gray-200 dark:border-white/10" />
  </div>
);

export const getChartBase = (isDark) => {
  const ax = isDark ? "rgba(255,255,255,0.85)" : "#1a1a1a";
  const gr = isDark ? "rgba(255,255,255,0.06)" : "rgba(46,64,54,0.08)";
  const tooltipTheme = isDark ? "dark" : "light";
  return {
    ax,
    gr,
    tooltipTheme,
    chartBase: {
      chart: { background: "transparent", toolbar: { show: false }, animations: { enabled: true, easing: "easeinout", speed: 600 } },
      theme: { mode: tooltipTheme },
      grid: { borderColor: gr, strokeDashArray: 4 },
      tooltip: { theme: tooltipTheme },
    }
  };
};

// ─── Reusable component hiển thị chart từ notebook + nhận xét ─────────────
const COLOR_VARIANTS = {
  teal:   { dot: "bg-teal-400",   label: "text-teal-400",   card: "bg-teal-950/20 border border-teal-900/30" },
  blue:   { dot: "bg-blue-400",   label: "text-blue-400",   card: "bg-blue-950/20 border border-blue-900/30" },
  orange: { dot: "bg-orange-400", label: "text-orange-400", card: "bg-orange-950/20 border border-orange-900/30" },
  amber:  { dot: "bg-amber-400",  label: "text-amber-400",  card: "bg-amber-950/20 border border-amber-900/30" },
  red:    { dot: "bg-red-400",    label: "text-red-400",    card: "bg-red-950/20 border border-red-900/30" },
  purple: { dot: "bg-purple-400", label: "text-purple-400", card: "bg-purple-950/20 border border-purple-900/30" },
  green:  { dot: "bg-green-400",  label: "text-green-400",  card: "bg-green-950/20 border border-green-900/30" },
};

/**
 * NotebookChart — hiển thị 1 biểu đồ PNG từ notebook + nhận xét
 * @param {string} src       - đường dẫn ảnh, ví dụ "/eda_charts/01_numerical_distribution.png"
 * @param {string} title     - tiêu đề hiển thị
 * @param {string} label     - nhãn màu nhỏ trên cùng (ví dụ: "Phân tích notebook")
 * @param {string} color     - "teal" | "blue" | "orange" | "amber" | "red" | "purple" | "green"
 * @param {string[]} points  - mảng string nhận xét (mỗi phần tử = 1 bullet)
 * @param {string} maxH      - chiều cao tối đa của ảnh, mặc định "500px"
 */
export const NotebookChart = ({ src, title, label, color = "teal", points = [], maxH = "500px" }) => {
  const c = COLOR_VARIANTS[color] || COLOR_VARIANTS.teal;
  return (
    <Card extra="overflow-hidden">
      {/* Chart image */}
      <div className="bg-[#0F172A] p-3">
        {label && (
          <p className={`mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest ${c.label}`}>
            📊 {label}
          </p>
        )}
        {title && (
          <p className="mb-2 px-1 text-sm font-bold text-navy-700 dark:text-white">{title}</p>
        )}
        <img
          src={src}
          alt={title || label || "EDA Chart"}
          className="mx-auto w-full rounded-lg"
          style={{ maxHeight: maxH, objectFit: "contain" }}
          loading="lazy"
        />
      </div>
      {/* Insights */}
      {points.length > 0 && (
        <div className={`mx-4 mb-4 mt-3 rounded-xl p-4 ${c.card}`}>
          <p className={`mb-2 text-[10px] font-semibold uppercase tracking-widest ${c.label}`}>
            Nhận xét
          </p>
          <ul className="space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {points.map((pt, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${c.dot}`} />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};
