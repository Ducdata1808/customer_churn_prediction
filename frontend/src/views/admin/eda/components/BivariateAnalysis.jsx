import React, { useState, useEffect } from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import api from "utils/api";

// Fix #1: Nhận overviewData từ cha qua props, không tự gọi API /overview nữa
const BivariateAnalysis = ({ overviewData }) => {
  const [corrData, setCorrData] = useState(null);
  const [corrError, setCorrError] = useState(null);

  const [columns, setColumns] = useState([]);
  const [selectedCol, setSelectedCol] = useState("");
  const [biData, setBiData] = useState(null);
  const [loadingBi, setLoadingBi] = useState(false);
  // Fix #4: State lỗi cho bivariate chart
  const [biError, setBiError] = useState(null);

  // Khi trang load: chỉ gọi /correlation (không gọi /overview nữa)
  useEffect(() => {
    // Fix #2: AbortController cho correlation request
    const controller = new AbortController();

    // Fix #3: Dùng api instance
    api.get("/api/v1/eda/correlation", { signal: controller.signal })
      .then((res) => setCorrData(res.data))
      .catch((err) => {
        if (!axios.isCancel(err)) {
          // Fix #4: Hiển thị lỗi trực tiếp
          setCorrError("Không thể tải dữ liệu tương quan.");
        }
      });

    return () => controller.abort();
  }, []);

  // Khi overviewData từ cha truyền xuống, trích xuất danh sách cột
  useEffect(() => {
    if (!overviewData) return;
    const allCols = [
      ...overviewData.feature_roles.numerical,
      ...overviewData.feature_roles.categorical
    ].filter(c => c !== "Churn");
    setColumns(allCols);
    if (allCols.length > 0) setSelectedCol(allCols[0]);
  }, [overviewData]);

  // Khi selectedCol thay đổi → gọi API bivariate
  useEffect(() => {
    if (!selectedCol) return;

    // Fix #2: AbortController cho mỗi bivariate request
    const controller = new AbortController();
    setLoadingBi(true);
    setBiData(null);
    setBiError(null);

    // Fix #3: Dùng api instance
    api.get(`/api/v1/eda/bivariate/${selectedCol}`, { signal: controller.signal })
      .then((res) => {
        setBiData(res.data);
        setLoadingBi(false);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          // Fix #4: Hiển thị lỗi
          setBiError(`Không thể tải dữ liệu so sánh cho cột "${selectedCol}".`);
          setLoadingBi(false);
        }
      });

    return () => controller.abort();
  }, [selectedCol]);

  // Vẽ Heatmap
  let heatElement = null;
  if (corrData) {
    const heatOptions = {
      chart: { type: "heatmap", toolbar: { show: false } },
      dataLabels: { enabled: true, style: { fontSize: "10px" } },
      colors: ["#4318FF"],
      xaxis: { categories: corrData.columns }
    };
    const heatSeries = [...corrData.index].reverse().map((rowName, i) => {
      const originalI = corrData.index.length - 1 - i;
      return {
        name: rowName,
        data: corrData.columns.map((colName, j) => ({
          x: colName,
          y: parseFloat(corrData.values[originalI][j].toFixed(2))
        }))
      };
    });
    heatElement = <Chart options={heatOptions} series={heatSeries} type="heatmap" height={400} className="w-full" />;
  }

  // Vẽ biểu đồ so sánh với Churn
  let biElement = null;
  if (biData) {
    if (biData.type === "categorical") {
      const barOptions = {
        chart: { type: "bar", stacked: true, toolbar: { show: false } },
        xaxis: { categories: biData.index },
        colors: ["#E1E9F8", "#4318FF"],
        plotOptions: { bar: { borderRadius: 4 } },
        dataLabels: { enabled: false },
        legend: { position: "bottom" }
      };
      const barSeries = [
        { name: "Churn = No", data: biData.values.map(v => v[0]) },
        { name: "Churn = Yes", data: biData.values.map(v => v[1]) }
      ];
      biElement = <Chart options={barOptions} series={barSeries} type="bar" height={350} className="w-full" />;
    } else if (biData.type === "numerical") {
      const boxOptions = {
        chart: { type: "boxPlot", toolbar: { show: false } },
        plotOptions: { boxPlot: { colors: { upper: "#4318FF", lower: "#6AD2FF" } } }
      };
      const boxSeries = [{
        type: "boxPlot",
        data: [
          { x: "Rời bỏ (Yes)", y: biData.churn_yes_stats.boxplot },
          { x: "Ở lại (No)", y: biData.churn_no_stats.boxplot }
        ]
      }];
      biElement = <Chart options={boxOptions} series={boxSeries} type="boxPlot" height={350} className="w-full" />;
    }
  }

  return (
    <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
      {/* Khu vực 1: Heatmap Tương quan */}
      <div className="rounded-[20px] bg-white p-4 shadow-3xl dark:!bg-navy-800 dark:text-white flex flex-col">
        <h2 className="text-lg font-bold mb-4">Tương quan (Correlation Heatmap)</h2>
        <div className="w-full flex-grow flex items-center justify-center min-h-[400px]">
          {corrError ? (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">⚠️ {corrError}</div>
          ) : (
            heatElement || <span className="text-gray-500 animate-pulse">Đang vẽ bản đồ nhiệt...</span>
          )}
        </div>
        {corrData && corrData.insight && (
          <div className="mt-4 rounded-[20px] bg-indigo-50 p-4 dark:bg-navy-700">
            <p className="text-sm text-navy-700 dark:text-white">💡 <b>Nhận xét:</b> {corrData.insight}</p>
          </div>
        )}
      </div>

      {/* Khu vực 2: Phân tích so sánh với Churn */}
      <div className="rounded-[20px] bg-white p-4 shadow-3xl dark:!bg-navy-800 dark:text-white flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <h2 className="text-lg font-bold">Phân tích với mục tiêu (Churn)</h2>
          <select
            className="rounded-lg border px-4 py-2 text-sm dark:bg-navy-700 dark:border-white/10 dark:text-white outline-none cursor-pointer w-full sm:w-auto"
            value={selectedCol}
            onChange={(e) => setSelectedCol(e.target.value)}
          >
            {columns.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="w-full flex-grow flex items-center justify-center min-h-[350px]">
          {loadingBi && <span className="text-gray-500 animate-pulse">Đang tải...</span>}
          {/* Fix #4 */}
          {biError && !loadingBi && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">⚠️ {biError}</div>
          )}
          {!loadingBi && !biError && biElement}
        </div>
        {biData && biData.insight && (
          <div className="mt-4 rounded-[20px] bg-indigo-50 p-4 dark:bg-navy-700">
            <p className="text-sm text-navy-700 dark:text-white">💡 <b>Nhận xét:</b> {biData.insight}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BivariateAnalysis;
