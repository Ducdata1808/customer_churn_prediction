import React, { useState, useEffect } from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import api from "utils/api";

// ─── Feature Engineering Summary (Mục 5.3 – trocungDucLevan.ipynb) ───────────
// Hiển thị biểu đồ phân tích cho 2 đặc trưng phái sinh cốt lõi:
//   • loyalty_tier (Phân khúc Vòng đời)
//   • charge_segment (Phân khúc Cước phí)
// Kết hợp với bảng tóm tắt tĩnh 4 "Cờ rủi ro hành vi" từ notebook.

const FEATURE_CARDS = [
  {
    key: "composite_risk_profile",
    label: "Siêu cờ Tổ hợp Rủi ro",
    icon: "🚩",
    color: "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700",
    textColor: "text-red-700 dark:text-red-300",
    churnRate: "55.0%",
    description:
      "Fiber optic + Month-to-month → Cứ 20 người thì 11 người hủy hợp đồng. Đây là vùng cộng hưởng rủi ro mạnh nhất toàn bộ tập dữ liệu.",
  },
  {
    key: "zero_supportive_service",
    label: "Cờ Không có Dịch vụ Bảo vệ",
    icon: "🛡️",
    color:
      "border-orange-300 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-700",
    textColor: "text-orange-700 dark:text-orange-300",
    churnRate: "52.7%",
    description:
      "Khách hàng dùng Internet nhưng từ chối mọi dịch vụ bảo vệ/hỗ trợ bổ sung. Rủi ro rời bỏ 52.7% — cao hơn 3.5 lần so với nhóm còn lại (15.1%).",
  },
  {
    key: "manual_payment",
    label: "Cờ Thanh toán Thủ công",
    icon: "💳",
    color:
      "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700",
    textColor: "text-yellow-700 dark:text-yellow-300",
    churnRate: "34.0%",
    description:
      "Electronic check / Mailed check → 34.0% rủi ro. Đối lập hoàn toàn với hệ thống thanh toán tự động chỉ đạt 7.3%. Chênh lệch 26.7%.",
  },
  {
    key: "security_score",
    label: "Điểm Khiên Bảo vệ (Security Score)",
    icon: "🔒",
    color:
      "border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700",
    textColor: "text-green-700 dark:text-green-300",
    churnRate: "1.4% (điểm 4/4)",
    description:
      "Tích lũy 4 dịch vụ bảo vệ (OnlineSecurity, TechSupport, OnlineBackup, DeviceProtection) → rủi ro giảm cấp số nhân từ 52.7% xuống chỉ còn 1.4%.",
  },
];

// ─── Sub-component: Biểu đồ Stacked Bar cho 1 feature phái sinh ──────────────
const FeatureBarChart = ({ featureName, title, description }) => {
  const [biData, setBiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    api
      .get(`/api/v1/eda/bivariate/${featureName}`, { signal: controller.signal })
      .then((res) => {
        setBiData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          setError(`Không thể tải dữ liệu cho "${featureName}".`);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [featureName]);

  if (loading) {
    return (
      <div className="h-80 rounded-[20px] bg-gray-100 dark:bg-navy-700 animate-pulse" />
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
        ⚠️ {error}
      </div>
    );
  }

  if (!biData || biData.type !== "categorical") return null;

  // Tính tỷ lệ churn % cho mỗi nhóm (Yes / (Yes + No) * 100)
  const churnRates = biData.values.map((row) => {
    const total = row[0] + row[1];
    return total > 0 ? parseFloat(((row[1] / total) * 100).toFixed(1)) : 0;
  });

  const barOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      animations: { enabled: true, speed: 500 },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 6,
        columnWidth: "55%",
        dataLabels: { position: "top" },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => val + "%",
      offsetY: -18,
      style: { fontSize: "11px", colors: ["#374151"] },
    },
    xaxis: {
      categories: biData.index,
      labels: { style: { fontSize: "11px" }, rotate: -20 },
    },
    yaxis: {
      max: 100,
      title: { text: "Tỷ lệ Churn (%)", style: { fontSize: "11px" } },
      labels: { formatter: (v) => v + "%" },
    },
    colors: ["#EE5D50"],
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.3,
        gradientToColors: ["#FF8F73"],
        stops: [0, 100],
      },
    },
    grid: { borderColor: "#f3f4f6" },
    tooltip: { y: { formatter: (v) => v + "% rời bỏ" } },
  };

  return (
    <div>
      <Chart
        options={barOptions}
        series={[{ name: "Tỷ lệ Churn", data: churnRates }]}
        type="bar"
        height={300}
      />
      {biData.insight && (
        <div className="mt-3 rounded-xl bg-indigo-50 p-3 dark:bg-navy-700">
          <p className="text-xs text-navy-700 dark:text-white">
            💡 <b>Nhận xét:</b> {biData.insight}
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const FeatureEngineeringSummary = () => {
  return (
    <div className="mt-5 flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="rounded-[20px] bg-white p-6 shadow-3xl dark:!bg-navy-800 dark:text-white">
        <h2 className="text-lg font-bold mb-4">
          Kỹ thuật Đặc trưng &amp; Phân tích Rủi ro (Feature Engineering &amp; Risk Analysis)
        </h2>

        {/* 4 Cờ rủi ro hành vi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURE_CARDS.map((card) => (
            <div
              key={card.key}
              className={`rounded-xl border-2 p-4 transition-all hover:shadow-md ${card.color}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{card.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className={`font-bold text-sm ${card.textColor}`}>
                      {card.label}
                    </p>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full bg-white/60 ${card.textColor}`}
                    >
                      {card.churnRate} churn
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Kết luận tổng hợp */}
        <div className="mt-4 rounded-xl bg-purple-50 border border-purple-200 p-4 dark:bg-purple-900/20 dark:border-purple-700">
          <p className="text-sm text-purple-800 dark:text-purple-300">
            🧠 <b>Kết luận Feature Engineering (Mục 5.3.3):</b> Việc thiết lập các{" "}
            <b>Cờ rủi ro hành vi</b> đã khoanh vùng thành công những điểm gãy
            khiến khách hàng rời bỏ dịch vụ. Siêu cờ{" "}
            <code className="bg-purple-100 dark:bg-purple-900 px-1 rounded text-xs">
              composite_risk_profile
            </code>{" "}
            là thành quả ấn tượng nhất — sự kết hợp Fiber optic + Month-to-month
            tạo ra vùng cộng hưởng rủi ro lên đến <b>55%</b>.
          </p>
        </div>
      </div>

      {/* Biểu đồ phân tích 2 đặc trưng phái sinh chính */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* loyalty_tier */}
        <div className="rounded-[20px] bg-white p-6 shadow-3xl dark:!bg-navy-800 dark:text-white">
          <h3 className="text-base font-bold mb-1">
            Tỷ lệ Churn theo Vòng đời Khách hàng
          </h3>
          <p className="text-xs text-gray-400 mb-1">
            Đặc trưng phái sinh:{" "}
            <code className="text-indigo-500">loyalty_tier</code>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Nhóm <b>Onboarding (0-6 tháng)</b> nằm ở vùng rủi ro cao nhất.
            Rủi ro giảm mạnh theo cấp số nhân khi thời gian gắn bó tăng lên.
          </p>
          <FeatureBarChart
            featureName="loyalty_tier"
            title="loyalty_tier vs Churn"
          />
        </div>

        {/* charge_segment */}
        <div className="rounded-[20px] bg-white p-6 shadow-3xl dark:!bg-navy-800 dark:text-white">
          <h3 className="text-base font-bold mb-1">
            Tỷ lệ Churn theo Phân khúc Cước phí
          </h3>
          <p className="text-xs text-gray-400 mb-1">
            Đặc trưng phái sinh:{" "}
            <code className="text-indigo-500">charge_segment</code>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Phân khúc <b>Premium (trên 70$)</b> có tỷ lệ rời bỏ cao nhất.
            Nhóm <b>Budget (0-35$)</b> duy trì mức rủi ro cực kỳ thấp.
          </p>
          <FeatureBarChart
            featureName="charge_segment"
            title="charge_segment vs Churn"
          />
        </div>
      </div>

      {/* Nhận xét cuối trang từ notebook Mục 5.3.1 */}
      <div className="rounded-[20px] bg-white p-6 shadow-3xl dark:!bg-navy-800 dark:text-white">
        <h3 className="text-base font-bold mb-3">
          📋 Nhận xét tổng hợp – Ma trận Rủi ro
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-700">
            <p className="font-bold text-red-700 dark:text-red-300 mb-2">
              🔴 Vùng rủi ro cộng hưởng
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Khách hàng mới <b>Onboarding (0-6 tháng)</b> + phân khúc{" "}
              <b>Premium (trên 70$)</b> → Tỷ lệ rời bỏ{" "}
              <b className="text-red-700">77.4%</b>. Áp lực chi phí cao giai
              đoạn đầu là sức ép mạnh nhất khiến khách hàng rời bỏ.
            </p>
          </div>
          <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 dark:bg-yellow-900/20 dark:border-yellow-700">
            <p className="font-bold text-yellow-700 dark:text-yellow-300 mb-2">
              🟡 Xu hướng giảm dần
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Phân khúc <b>Premium</b>: Rủi ro giảm từ <b>77.4%</b> (0-6 tháng)
              → <b>48.1%</b> (Year 2) → <b>8.2%</b> (trên 2 năm). Thời gian
              gắn bó giúp khách hàng nhận ra giá trị thực từ hệ sinh thái.
            </p>
          </div>
          <div className="rounded-xl bg-green-50 border border-green-200 p-4 dark:bg-green-900/20 dark:border-green-700">
            <p className="font-bold text-green-700 dark:text-green-300 mb-2">
              🟢 Vùng an toàn tự nhiên
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Nhóm <b>Budget (0-35$)</b> duy trì rủi ro cực thấp, giảm từ{" "}
              <b>16.5%</b> xuống <b>0.4%</b> ở nhóm Loyal. Ít áp lực tài chính
              = gắn kết tự nhiên cao nhất.
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-indigo-50 border border-indigo-200 p-4 dark:bg-navy-700 dark:border-white/10">
          <p className="text-sm text-navy-700 dark:text-white">
            💡 <b>Kết luận (Mục 5.3.1):</b> Đặc trưng phái sinh{" "}
            <code className="bg-indigo-100 dark:bg-indigo-900 px-1 rounded text-xs">
              loyalty_tier
            </code>{" "}
            và{" "}
            <code className="bg-indigo-100 dark:bg-indigo-900 px-1 rounded text-xs">
              charge_segment
            </code>{" "}
            đã thành công phân loại các nhóm hành vi phi tuyến tính một cách xuất
            sắc. Sự phân hóa rủi ro giữa các ô trên ma trận Heatmap là minh chứng
            rõ nét cho sự dày đặc mật độ thông tin <b>Information Density</b> của
            hai đặc trưng này.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeatureEngineeringSummary;
