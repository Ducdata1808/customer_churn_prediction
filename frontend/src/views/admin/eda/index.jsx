import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "utils/api";
import OverviewCards from "./components/OverviewCards";
import DescriptiveStats from "./components/DescriptiveStats";
import UnivariateAnalysis from "./components/UnivariateAnalysis";
import BivariateAnalysis from "./components/BivariateAnalysis";

const EDADashboard = () => {
  // Fix #1: Gọi /overview một lần duy nhất ở đây, truyền xuống các component con qua props
  const [overviewData, setOverviewData] = useState(null);
  const [overviewError, setOverviewError] = useState(null);

  useEffect(() => {
    // Fix #2: Dùng AbortController để hủy request khi rời trang → tránh Memory Leak
    const controller = new AbortController();

    api.get("/api/v1/eda/overview", { signal: controller.signal })
      .then((res) => setOverviewData(res.data))
      .catch((err) => {
        if (!axios.isCancel(err)) {
          setOverviewError("Không thể kết nối Backend. Hãy chắc chắn uvicorn đang chạy ở cổng 8000!");
        }
      });

    // Cleanup: hủy request nếu người dùng rời khỏi trang EDA
    return () => controller.abort();
  }, []);

  return (
    <div className="mt-3 flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
          EDA Dashboard (Trực quan hoá dữ liệu)
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Khám phá và trực quan hoá bộ dữ liệu Customer Churn
        </p>
      </div>

      {/* Hiển thị lỗi kết nối nếu không lấy được dữ liệu cơ bản */}
      {overviewError && (
        <div className="rounded-[20px] bg-red-50 border border-red-200 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          ⚠️ {overviewError}
        </div>
      )}

      {/* Truyền overviewData xuống các component con qua props */}
      <OverviewCards overviewData={overviewData} />
      <DescriptiveStats />
      <UnivariateAnalysis overviewData={overviewData} />
      <BivariateAnalysis overviewData={overviewData} />
    </div>
  );
};

export default EDADashboard;
