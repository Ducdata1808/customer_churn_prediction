import React from "react";
import Card from "components/card";
import { SectionLabel, NotebookChart } from "./common";

const StatsPanel = ({ ns }) => {
  const nsk = Object.keys(ns || {}).filter((k) => k !== "insight");

  return (
    <div className="space-y-5">
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

      {/* ── Biểu đồ phân bố biến định lượng (notebook cell 64–65) ── */}
      <NotebookChart
        src="/eda_charts/01_numerical_distribution.png"
        label="Phân bố biến định lượng — Histogram + KDE"
        title="Phân bố các biến số: tenure, MonthlyCharges, TotalCharges"
        color="teal"
        maxH="420px"
        points={[
          "tenure có dạng phân phối hai đỉnh (Bimodal Distribution). Khách hàng tập trung rất cao ở hai biên — nhóm mới (1–6 tháng) và nhóm trung thành lâu năm (60–72 tháng). Đây là tín hiệu mạnh để phân đoạn khách hàng theo vòng đời.",
          "MonthlyCharges có phân phối lệch phải nhẹ với hai cụm mật độ: nhóm cước thấp (~20$) tương ứng gói DSL/No internet, và nhóm cước cao (70–105$) tương ứng Fiber optic. Median = 74.1$.",
          "TotalCharges có phân phối lệch phải mạnh vì gắn liền với tenure. Nhóm churn tập trung quanh mốc $0 do phần lớn hủy dịch vụ trong những tháng đầu khi tổng cước tích lũy còn thấp.",
        ]}
      />
    </div>
  );
};

export default StatsPanel;
