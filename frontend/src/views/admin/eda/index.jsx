import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "utils/api";
import OverviewCards from "./components/OverviewCards";
import ChurnDistribution from "./components/ChurnDistribution";
import DescriptiveStats from "./components/DescriptiveStats";
import UnivariateAnalysis from "./components/UnivariateAnalysis";
import BivariateAnalysis from "./components/BivariateAnalysis";
import FeatureEngineeringSummary from "./components/FeatureEngineeringSummary";
import NotebookCharts from "./components/NotebookCharts";

const EDADashboard = () => {
  const [overviewData, setOverviewData] = useState(null);
  const [overviewError, setOverviewError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    api.get("/api/v1/eda/overview", { signal: controller.signal })
      .then((res) => setOverviewData(res.data))
      .catch((err) => {
        if (!axios.isCancel(err)) {
          setOverviewError("Không thể kết nối Backend. Hãy chắc chắn uvicorn đang chạy ở cổng 8000!");
        }
      });
    return () => controller.abort();
  }, []);

  return (
    <div className="mt-3 flex flex-col gap-5">
      {/* Tiêu đề trang */}
      <div>
        <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
          EDA Dashboard (Trực quan hoá dữ liệu)
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Khám phá và trực quan hoá bộ dữ liệu Customer Churn
        </p>
      </div>

      {/* Hiển thị lỗi kết nối */}
      {overviewError && (
        <div className="rounded-[20px] bg-red-50 border border-red-200 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          ⚠️ {overviewError}
        </div>
      )}

      {/* Section 1: Thống kê nhanh */}
      <OverviewCards overviewData={overviewData} />

      {/* Section 2: Phân bố Churn */}
      <ChurnDistribution />

      {/* Section 3: Thống kê mô tả */}
      <DescriptiveStats />

      {/* Section 4: Biểu đồ thực từ notebook – 16 charts */}
      <NotebookCharts />

      {/* Section 5: Phân phối đơn biến (interactive – API) */}
      <UnivariateAnalysis overviewData={overviewData} />

      {/* Section 6: Tương quan & Bivariate (interactive – API) */}
      <BivariateAnalysis overviewData={overviewData} />

      {/* Section 7: Feature Engineering & Risk Analysis */}
      <FeatureEngineeringSummary />
    </div>
  );
};

export default EDADashboard;
