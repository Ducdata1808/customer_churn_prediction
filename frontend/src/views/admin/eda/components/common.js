import React from "react";

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
