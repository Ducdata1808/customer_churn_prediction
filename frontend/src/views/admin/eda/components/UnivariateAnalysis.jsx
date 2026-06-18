import React, { useState, useEffect } from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import api from "utils/api";

// Fix #6: Bảng màu đủ rộng để xử lý biến có nhiều hơn 6 giá trị
const COLOR_PALETTE = [
  "#4318FF", "#6AD2FF", "#01B574", "#FFB547",
  "#EE5D50", "#A3AED0", "#FF6B6B", "#4ECDC4",
  "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"
];

// Fix #1: Nhận overviewData từ cha (index.jsx) qua props thay vì tự gọi API
const UnivariateAnalysis = ({ overviewData }) => {
  // Fix #5: Gộp selectedCol + colType vào một object duy nhất
  // Đảm bảo 2 giá trị này luôn cập nhật đồng thời → tránh Race Condition
  const [selection, setSelection] = useState({ col: "", type: "" });
  const [columns, setColumns] = useState({ numerical: [], categorical: [] });

  const [chartData, setChartData] = useState(null);
  const [loadingChart, setLoadingChart] = useState(false);
  // Fix #4: State lỗi để hiển thị trực tiếp trên màn hình
  const [error, setError] = useState(null);

  // Khi overviewData từ cha truyền xuống, trích xuất danh sách cột
  useEffect(() => {
    if (!overviewData) return;
    const numCols = overviewData.feature_roles.numerical;
    const catCols = overviewData.feature_roles.categorical;
    setColumns({ numerical: numCols, categorical: catCols });
    // Mặc định chọn cột số đầu tiên
    if (numCols.length > 0) {
      setSelection({ col: numCols[0], type: "numerical" });
    }
  }, [overviewData]);

  // Khi selection thay đổi → gọi API distribution tương ứng
  useEffect(() => {
    if (!selection.col) return;

    // Fix #2: AbortController để hủy request cũ khi người dùng đổi cột nhanh
    const controller = new AbortController();
    setLoadingChart(true);
    setChartData(null);
    setError(null);

    const endpoint = selection.type === "numerical"
      ? `/api/v1/eda/distribution/numerical/${selection.col}`
      : `/api/v1/eda/distribution/categorical/${selection.col}`;

    // Fix #3: Dùng api instance thay vì viết URL thủ công
    api.get(endpoint, { signal: controller.signal })
      .then((res) => {
        setChartData(res.data);
        setLoadingChart(false);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          // Fix #4: Hiển thị lỗi rõ ràng thay vì console.error âm thầm
          setError(`Không thể tải biểu đồ cho cột "${selection.col}".`);
          setLoadingChart(false);
        }
      });

    return () => controller.abort();
  }, [selection]); // Fix #5: Chỉ phụ thuộc vào 1 object duy nhất

  // Fix #5: Hàm này cập nhật cả col lẫn type trong một lần gọi setSelection duy nhất
  const handleSelectChange = (e) => {
    const val = e.target.value;
    const type = columns.numerical.includes(val) ? "numerical" : "categorical";
    setSelection({ col: val, type }); // 1 lần set → 1 lần render → không race condition
  };

  // Xây dựng biểu đồ
  let chartElement = null;
  if (chartData && !error) {
    if (selection.type === "numerical" && chartData.values) {
      const barOptions = {
        chart: { type: "bar", toolbar: { show: false } },
        xaxis: { categories: chartData.labels || [], title: { text: "Khoảng giá trị" } },
        yaxis: { title: { text: "Số lượng" } },
        colors: ["#4318FF"],
        plotOptions: { bar: { borderRadius: 4, columnWidth: "60%" } },
        dataLabels: { enabled: false }
      };
      chartElement = (
        <Chart options={barOptions} series={[{ name: "Tần suất", data: chartData.values || [] }]} type="bar" height={350} className="w-full" />
      );
    } else if (selection.type === "categorical" && chartData.percentages) {
      // Fix #6: Tạo màu động dựa theo số lượng nhãn thực tế
      const dynamicColors = (chartData.labels || []).map((_, i) => COLOR_PALETTE[i % COLOR_PALETTE.length]);
      const pieOptions = {
        chart: { type: "donut" },
        labels: chartData.labels || [],
        colors: dynamicColors,
        legend: { position: "bottom" },
        dataLabels: { enabled: true, formatter: (val) => val ? val.toFixed(1) + "%" : "" }
      };
      chartElement = (
        <Chart options={pieOptions} series={chartData.percentages || []} type="donut" height={350} className="w-full" />
      );
    }
  }

  return (
    <div className="mt-5 rounded-[20px] bg-white p-4 shadow-3xl dark:!bg-navy-800 dark:text-white w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <h2 className="text-lg font-bold">Phân phối đơn biến (Univariate Analysis)</h2>
        <select
          className="rounded-lg border px-4 py-2 text-sm dark:bg-navy-700 dark:border-white/10 dark:text-white outline-none cursor-pointer"
          value={selection.col}
          onChange={handleSelectChange}
        >
          <optgroup label="Biến định lượng (Numerical)">
            {columns.numerical.map(c => <option key={c} value={c}>{c}</option>)}
          </optgroup>
          <optgroup label="Biến định tính (Categorical)">
            {columns.categorical.map(c => <option key={c} value={c}>{c}</option>)}
          </optgroup>
        </select>
      </div>

      <div className="w-full flex items-center justify-center min-h-[350px]">
        {loadingChart && <span className="text-gray-500 font-medium animate-pulse">Đang vẽ biểu đồ...</span>}
        {/* Fix #4: Hiển thị lỗi đẹp thay vì trang trắng */}
        {error && !loadingChart && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">⚠️ {error}</div>
        )}
        {!loadingChart && !error && chartElement}
      </div>

      {chartData && chartData.insight && (
        <div className="mt-4 rounded-[20px] bg-indigo-50 p-4 dark:bg-navy-700">
          <p className="text-sm text-navy-700 dark:text-white">
            💡 <b>Nhận xét (Insight):</b> {chartData.insight}
          </p>
        </div>
      )}
    </div>
  );
};

export default UnivariateAnalysis;
