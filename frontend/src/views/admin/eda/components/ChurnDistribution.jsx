import React, { useState, useEffect } from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import api from "utils/api";

// ─── Phân bố biến mục tiêu Churn (Mục 4.3 – trocungDucLevan.ipynb) ──────────
// Vẽ Donut Chart % Churn Yes / No và hiển thị nhận xét từ notebook.
const ChurnDistribution = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    api
      .get("/api/v1/eda/distribution/categorical/Churn", {
        signal: controller.signal,
      })
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          setError("Không thể tải phân bố biến mục tiêu Churn.");
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="mt-5 h-56 rounded-[20px] bg-gray-100 dark:bg-navy-700 animate-pulse" />
    );
  }

  if (error) {
    return (
      <div className="mt-5 rounded-[20px] bg-red-50 border border-red-200 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
        ⚠️ {error}
      </div>
    );
  }

  // Sắp xếp: "No" trước, "Yes" sau (nhất quán với notebook)
  const noIdx = data.labels.indexOf("No");
  const yesIdx = data.labels.indexOf("Yes");
  const orderedLabels = [];
  const orderedPcts = [];
  const orderedCounts = [];

  if (noIdx !== -1) {
    orderedLabels.push("Ở lại (No)");
    orderedPcts.push(data.percentages[noIdx]);
    orderedCounts.push(data.counts[noIdx]);
  }
  if (yesIdx !== -1) {
    orderedLabels.push("Rời bỏ (Yes)");
    orderedPcts.push(data.percentages[yesIdx]);
    orderedCounts.push(data.counts[yesIdx]);
  }

  const donutOptions = {
    chart: { type: "donut", animations: { enabled: true, speed: 600 } },
    labels: orderedLabels,
    colors: ["#01B574", "#EE5D50"],
    legend: {
      position: "bottom",
      fontSize: "13px",
      fontFamily: "inherit",
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => val.toFixed(1) + "%",
      style: { fontSize: "13px", fontWeight: "bold" },
      dropShadow: { enabled: false },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "60%",
          labels: {
            show: true,
            name: { show: true, fontSize: "14px", fontWeight: 600 },
            value: {
              show: true,
              fontSize: "24px",
              fontWeight: 700,
              formatter: (val) => Number(val).toLocaleString("vi-VN"),
            },
            total: {
              show: true,
              label: "Tổng mẫu",
              fontSize: "13px",
              color: "#718096",
              formatter: (w) =>
                w.globals.seriesTotals
                  .reduce((a, b) => a + b, 0)
                  .toLocaleString("vi-VN"),
            },
          },
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val) =>
          `${val.toLocaleString("vi-VN")} khách hàng`,
      },
    },
    stroke: { width: 2 },
  };

  // Thẻ thống kê nhanh
  const stats = [
    {
      label: "Ở lại dịch vụ",
      value: orderedCounts[0]?.toLocaleString("vi-VN") ?? "—",
      pct: orderedPcts[0]?.toFixed(1) + "%" ?? "—",
      color: "bg-green-50 border-green-200 dark:bg-green-900/20",
      textColor: "text-green-700 dark:text-green-400",
      icon: "✅",
    },
    {
      label: "Rời bỏ dịch vụ",
      value: orderedCounts[1]?.toLocaleString("vi-VN") ?? "—",
      pct: orderedPcts[1]?.toFixed(1) + "%" ?? "—",
      color: "bg-red-50 border-red-200 dark:bg-red-900/20",
      textColor: "text-red-700 dark:text-red-400",
      icon: "⚠️",
    },
  ];

  return (
    <div className="mt-5 rounded-[20px] bg-white p-6 shadow-3xl dark:!bg-navy-800 dark:text-white w-full">
      <h2 className="text-lg font-bold mb-5">
        Phân bố Biến mục tiêu – Churn (Target Variable Distribution)
      </h2>

      <div className="flex flex-col lg:flex-row gap-8 items-center">
        {/* Donut Chart */}
        <div className="w-full lg:w-1/2">
          <Chart
            options={donutOptions}
            series={orderedPcts}
            type="donut"
            height={320}
          />
        </div>

        {/* Stats + Insight bên phải */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`flex items-center gap-4 rounded-xl border p-4 ${s.color}`}
            >
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className={`font-semibold text-sm ${s.textColor}`}>
                  {s.label}
                </p>
                <p className={`text-2xl font-bold ${s.textColor}`}>
                  {s.value}{" "}
                  <span className="text-base font-medium">({s.pct})</span>
                </p>
              </div>
            </div>
          ))}

          {/* Tỷ lệ mất cân bằng */}
          <div className="mt-2 rounded-xl bg-amber-50 border border-amber-200 p-4 dark:bg-amber-900/20 dark:border-amber-700">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">
              Tỷ lệ mất cân bằng mẫu (Imbalance Ratio)
            </p>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
              ≈ 3.5 : 1
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Ở lại : Rời bỏ
            </p>
          </div>
        </div>
      </div>

      {data.insight && (
        <div className="mt-5 rounded-[20px] bg-indigo-50 p-4 dark:bg-navy-700">
          <p className="text-sm text-navy-700 dark:text-white">
            💡 <b>Nhận xét:</b> {data.insight}
          </p>
        </div>
      )}

      {/* Nhận xét bổ sung từ notebook */}
      <div className="mt-3 rounded-[20px] bg-blue-50 border border-blue-100 p-4 dark:bg-navy-700 dark:border-white/10">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          📊 <b>Kết luận phân tích:</b> Tập dữ liệu thể hiện sự mất cân bằng mẫu ở mức vừa phải
          với tỷ lệ xấp xỉ <b>3.5 : 1</b>, nhóm khách hàng tiếp tục sử dụng chiếm <b>~77.5%</b>.
          Nhóm khách hàng rời bỏ — mục tiêu cốt lõi cần dự đoán — chỉ chiếm phần thiểu số{" "}
          <b>~22.5%</b>. Mức mất cân bằng này đặt ra yêu cầu áp dụng kỹ thuật xử lý mẫu như{" "}
          <b>SMOTE</b> hoặc điều chỉnh <code>class_weight</code> khi huấn luyện mô hình.
        </p>
      </div>
    </div>
  );
};

export default ChurnDistribution;
