import React, { useState, useEffect } from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import Card from "components/card";
import { SectionLabel, Spin, getChartBase, BRAND, TEAL, AMBER, NotebookChart } from "./common";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

// ─── Nhận xét cố định từ notebook ─────────────────────────────────────────────
const InsightCard = ({ color, label, points }) => {
  const colorMap = {
    orange: { dot: "bg-orange-400", label: "text-orange-500", bullet: "bg-orange-400" },
    blue:   { dot: "bg-blue-400",   label: "text-blue-500",   bullet: "bg-blue-400"   },
    red:    { dot: "bg-red-400",    label: "text-red-500",    bullet: "bg-red-400"    },
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <Card extra="p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${c.dot}`} />
        <span className={`text-xs font-semibold uppercase tracking-widest ${c.label}`}>{label}</span>
      </div>
      <ul className="space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
        {points.map((p, i) => (
          <li key={i} className="flex gap-2">
            <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${c.bullet}`} />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};

const UnivariatePanel = ({ ov, isDark }) => {
  const [uniCol, setUniCol] = useState("tenure");
  const [uniD, setUniD] = useState(null);
  const [uniL, setUniL] = useState(false);

  useEffect(() => {
    if (!ov) return;
    const isNum = ov.feature_roles?.numerical?.includes(uniCol);
    (async () => {
      try {
        setUniL(true);
        const url = isNum
          ? `${API}/api/v1/eda/distribution/numerical/${uniCol}?bins=15`
          : `${API}/api/v1/eda/distribution/categorical/${uniCol}`;
        const r = await axios.get(url);
        setUniD({ isNum, data: r.data });
      } catch {}
      finally { setUniL(false); }
    })();
  }, [uniCol, ov]);

  const { ax, tooltipTheme, chartBase } = getChartBase(isDark);

  const histOpt = {
    ...chartBase,
    chart: { ...chartBase.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 5, columnWidth: "70%" } },
    xaxis: { categories: uniD?.isNum ? uniD.data.labels : [], labels: { rotate: -45, style: { colors: ax, fontSize: "10px" } }, axisBorder: { show: false } },
    yaxis: { labels: { style: { colors: ax } } },
    colors: [BRAND],
    dataLabels: { enabled: false },
  };

  const boxOpt = {
    ...chartBase,
    chart: { ...chartBase.chart, type: "boxPlot" },
    colors: [BRAND, TEAL],
    xaxis: { labels: { style: { colors: ax } } },
    yaxis: { labels: { style: { colors: ax } } },
  };

  const pieOpt = !uniD || uniD.isNum ? {} : {
    labels: uniD.data.labels,
    colors: [BRAND, TEAL, AMBER, "#3b82f6", "#8b5cf6", "#ec4899"],
    chart: { type: "donut", background: "transparent" },
    theme: { mode: tooltipTheme },
    legend: { position: "bottom", labels: { colors: ax } },
    dataLabels: { enabled: true, style: { colors: ["#fff"] } },
    stroke: { width: 2 },
    tooltip: { theme: tooltipTheme },
    plotOptions: { pie: { donut: { size: "65%", labels: { show: true, total: { show: true, color: ax } } } } },
  };

  const selectCls = "rounded-xl border border-gray-200 bg-white/0 px-3 py-2 text-sm text-navy-700 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-800 dark:text-white";

  return (
    <div className="space-y-5">
      {/* ── Interactive Chart ── */}
      <Card extra="p-6">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <SectionLabel text="Univariate Analysis" />
            <h3 className="text-lg font-bold text-navy-700 dark:text-white">Phân tích đơn biến</h3>
            <p className="text-xs text-gray-500">Phân bố giá trị của từng thuộc tính</p>
          </div>
          <select value={uniCol} onChange={(e) => setUniCol(e.target.value)} className={selectCls}>
            <optgroup label="Numerical">
              {ov?.feature_roles?.numerical?.map((c) => <option key={c} value={c}>{c}</option>)}
            </optgroup>
            <optgroup label="Categorical">
              {ov?.feature_roles?.categorical?.map((c) => <option key={c} value={c}>{c}</option>)}
            </optgroup>
          </select>
        </div>

        {uniL ? <Spin /> : uniD ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="h-[320px]">
              <p className="mb-2 text-center text-[10px] uppercase tracking-widest text-gray-500">
                {uniD.isNum ? "Histogram" : "Tỷ lệ (%)"}
              </p>
              {uniD.isNum
                ? <Chart options={histOpt} series={[{ name: "Count", data: uniD.data.values }]} type="bar" height="90%" />
                : <Chart options={pieOpt} series={uniD.data.counts} type="donut" height="90%" />
              }
            </div>
            <div className="flex flex-col gap-4">
              {uniD.isNum && (
                <div className="h-[200px]">
                  <p className="mb-2 text-center text-[10px] uppercase tracking-widest text-gray-500">Boxplot</p>
                  <Chart
                    options={boxOpt}
                    series={[{ type: "boxPlot", data: [{ x: uniCol, y: [uniD.data.boxplot_data?.min, uniD.data.boxplot_data?.q1, uniD.data.boxplot_data?.median, uniD.data.boxplot_data?.q3, uniD.data.boxplot_data?.max] }] }]}
                    type="boxPlot"
                    height="85%"
                  />
                </div>
              )}
              {!uniD.isNum && (
                <div className="max-h-[200px] overflow-y-auto rounded-xl bg-lightPrimary p-4 dark:bg-navy-700">
                  <p className="mb-2 text-[10px] uppercase tracking-widest text-gray-500">Bảng tần suất</p>
                  {uniD.data.labels.map((l, i) => (
                    <div key={l} className="flex justify-between py-1 text-sm">
                      <span className="text-navy-700 dark:text-white">{l}</span>
                      <span className="font-mono font-semibold text-brand-500">
                        {uniD.data.counts[i]?.toLocaleString()} ({uniD.data.percentages[i]?.toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="max-h-[150px] overflow-y-auto rounded-xl bg-orange-50 p-4 dark:bg-orange-950/20">
                <p className="mb-1 text-[10px] uppercase tracking-widest text-orange-400">Nhận xét</p>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{uniD.data.insight}</p>
              </div>
            </div>
          </div>
        ) : null}
      </Card>

      {/* ── Notebook Insights Cards ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <InsightCard
          color="orange"
          label="Cân bằng mẫu biến mục tiêu"
          points={[
            "Tập dữ liệu thể hiện sự mất cân bằng mẫu ở mức độ vừa phải với tỷ lệ xấp xỉ 3.5 : 1 — khách hàng tiếp tục sử dụng chiếm 77.5%.",
            "Nhóm khách hàng rời bỏ dịch vụ — nhóm mục tiêu cốt lõi cần dự đoán — chiếm phần thiểu số với 22.5% trên tổng số khách hàng.",
          ]}
        />
        <InsightCard
          color="blue"
          label="Phân tách định lượng theo Churn"
          points={[
            "tenure: nhóm rời bỏ tập trung ở 1–6 tháng đầu; nhóm tiếp tục chiếm ưu thế trên 48 tháng. Trung vị nhóm rời đi khoảng 10 tháng.",
            "MonthlyCharges: nhóm tiếp tục dồn mật độ cao ở ~20$; nhóm rời bỏ tập trung ở phân khúc 70$–105$.",
            "TotalCharges: nhóm churn chiếm ưu thế quanh mốc $0 vì phần lớn hủy dịch vụ ngay trong những tháng đầu.",
          ]}
        />
        <InsightCard
          color="red"
          label="Phân hóa churn theo biến định tính"
          points={[
            "PaymentMethod — mức phân hóa mạnh nhất 41.97%. Electronic check có tỷ lệ churn 48.91%; thanh toán tự động thẻ tín dụng chỉ 6.93%.",
            "Contract — chênh lệch 41.06%. Month-to-month rủi ro hủy 42.05%; Two year gần như triệt tiêu với chỉ 1.00%.",
            "InternetService — Fiber optic churn 41.54%; No internet service chỉ 1.4%.",
            "Giới tính (gender) gần như không có phân hóa — chênh lệch chỉ 0.57% giữa Nam và Nữ.",
          ]}
        />
      </div>

      {/* ── Biểu đồ notebook 03: Phân bố biến mục tiêu Churn ── */}
      <NotebookChart
        src="/eda_charts/03_churn_target_distribution.png"
        label="Phân bố biến mục tiêu — Donut Chart (notebook cell 77)"
        title="Phân bố nhãn Churn: Tiếp tục sử dụng vs Rời bỏ dịch vụ"
        color="orange"
        maxH="380px"
        points={[
          "Tỷ lệ xấp xỉ 3.5 : 1 — nhóm tiếp tục (77.5%) so với nhóm rời bỏ (22.5%). Mức mất cân bằng này ở ngưỡng vừa phải, có thể xử lý bằng SMOTE hoặc class_weight.",
          "Nhóm khách hàng rời bỏ dịch vụ — nhóm mục tiêu cốt lõi cần dự đoán — chiếm thiểu số nhưng có tác động tài chính lớn nhất.",
          "Không cần oversampling quá mức vì tỷ lệ 3.5:1 chưa đủ nghiêm trọng để gây ra hiện tượng mô hình thiên lệch nặng.",
        ]}
      />

      {/* ── Biểu đồ notebook 04: Numerical vs Churn KDE + Boxplot ── */}
      <NotebookChart
        src="/eda_charts/04_numerical_vs_churn.png"
        label="Phân bố biến định lượng theo Churn — KDE + Boxplot (notebook cell 85)"
        title="Phân tách hành vi: tenure, MonthlyCharges, TotalCharges theo nhóm Churn"
        color="blue"
        maxH="500px"
        points={[
          "tenure xuất hiện sự phân tách rõ rệt về hành vi. Nhóm dừng sử dụng dịch vụ tập trung chủ yếu ở giai đoạn trải nghiệm 1–6 tháng đầu tiên. Ngược lại, nhóm trung thành phân tán đều dọc theo toàn bộ vòng đời với mật độ cao nhất sau mốc 48 tháng.",
          "MonthlyCharges: nhóm tiếp tục dồn mật độ cao ở mức cước thấp ~20$ (gói DSL/No internet). Nhóm rời bỏ tập trung ở phân khúc 70$–105$ — gói Fiber optic với kỳ vọng chất lượng cao hơn.",
          "TotalCharges: nhóm churn chiếm ưu thế quanh mốc $0 vì phần lớn hủy dịch vụ trong những tháng đầu, chưa kịp tích lũy tổng cước.",
        ]}
      />
    </div>
  );
};

export default UnivariatePanel;
