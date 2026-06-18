import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "utils/api";

// Fix #7: Hàm helper an toàn — tránh crash khi giá trị là null/undefined
const fmt = (val) => (val != null ? Number(val).toFixed(2) : "N/A");

const DescriptiveStats = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  // Fix #4: Thêm state lỗi để hiển thị trực tiếp trên màn hình
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fix #2: AbortController để hủy request khi rời trang
    const controller = new AbortController();

    // Fix #3: Dùng api instance thay vì viết URL thủ công
    api.get("/api/v1/eda/numerical-stats", { signal: controller.signal })
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          // Fix #4: Báo lỗi ra màn hình thay vì chỉ console.error
          setError("Không thể tải bảng thống kê. Hãy kiểm tra Backend đang chạy.");
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="mt-5 h-48 rounded-[20px] bg-gray-100 dark:bg-navy-700 animate-pulse" />
    );
  }

  if (error) {
    return (
      <div className="mt-5 rounded-[20px] bg-red-50 border border-red-200 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
        ⚠️ {error}
      </div>
    );
  }

  const { insight, ...stats } = data;
  const statRows = Object.keys(stats).map((colName) => ({
    feature: colName,
    ...stats[colName]
  }));

  return (
    <div className="mt-5 rounded-[20px] bg-white p-4 shadow-3xl dark:!bg-navy-800 dark:text-white w-full overflow-x-auto">
      <h2 className="text-lg font-bold mb-4">Thống kê mô tả (Descriptive Statistics)</h2>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-sm text-gray-500 dark:border-white/10">
            <th className="pb-3 pr-4">Đặc trưng (Feature)</th>
            <th className="pb-3 pr-4">Trung bình (Mean)</th>
            <th className="pb-3 pr-4">Min</th>
            <th className="pb-3 pr-4">Q1 (25%)</th>
            <th className="pb-3 pr-4">Median</th>
            <th className="pb-3 pr-4">Q3 (75%)</th>
            <th className="pb-3 pr-4">Max</th>
            <th className="pb-3 pr-4">Độ lệch (Skew)</th>
          </tr>
        </thead>
        <tbody>
          {statRows.map((row, index) => (
            <tr key={index} className="border-b border-gray-50 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-navy-700">
              <td className="py-3 pr-4 font-semibold">{row.feature}</td>
              {/* Fix #7: Dùng fmt() thay vì gọi .toFixed() trực tiếp */}
              <td className="py-3 pr-4">{fmt(row.mean)}</td>
              <td className="py-3 pr-4">{fmt(row.min)}</td>
              <td className="py-3 pr-4">{fmt(row.q1)}</td>
              <td className="py-3 pr-4">{fmt(row.median)}</td>
              <td className="py-3 pr-4">{fmt(row.q3)}</td>
              <td className="py-3 pr-4">{fmt(row.max)}</td>
              <td className="py-3 pr-4">{fmt(row.skewness)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 rounded-[20px] bg-indigo-50 p-4 dark:bg-navy-700">
        <p className="text-sm text-navy-700 dark:text-white">
          💡 <b>Nhận xét (Insight):</b> {insight}
        </p>
      </div>
    </div>
  );
};

export default DescriptiveStats;
