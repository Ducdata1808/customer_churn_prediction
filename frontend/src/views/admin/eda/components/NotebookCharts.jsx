import React, { useState } from "react";

// ─── Dữ liệu 16 biểu đồ trích xuất từ trocungDucLevan.ipynb ──────────────────
const CHARTS = [
  {
    id: 0, file: "chart_00.png",
    section: "4.1 – Phân phối đơn biến (Biến định lượng)",
    title: "Phân bố khách hàng theo Thời gian gắn bó, Cước phí hàng tháng & Tổng cước phí",
    insight: "Phân bố thời gian gắn bó (tenure) có dạng Bimodal với hai đỉnh ở biên: khách hàng mới (dưới 6 tháng) và lâu năm (trên 60 tháng). Cước phí hàng tháng có đỉnh cao ở mức thấp nhất (~20$). Tổng cước phí lệch phải mạnh (Right-skewed) với đa số tập trung ở 0–2,000$.",
    tags: ["Histogram", "KDE", "Bimodal"]
  },
  {
    id: 1, file: "chart_01.png",
    section: "4.2 – Phân phối đơn biến (Biến định tính)",
    title: "Phân bố 16 đặc trưng định tính",
    insight: "Phân bố các biến định tính cho thấy cấu trúc phân lớp rõ ràng. Tỷ lệ PhoneService cao (90%+). Hầu hết dịch vụ bổ sung (OnlineSecurity, TechSupport...) có xu hướng 'No' chiếm đa số, phản ánh cơ hội upsell còn lớn.",
    tags: ["Bar Chart", "Categorical", "Distribution"]
  },
  {
    id: 2, file: "chart_02.png",
    section: "4.3 – Phân bố Biến mục tiêu (Churn)",
    title: "Tỷ lệ Churn – Phân bố biến mục tiêu",
    insight: "Tập dữ liệu thể hiện sự mất cân bằng mẫu ở mức vừa phải với tỷ lệ xấp xỉ 3.5:1. Nhóm tiếp tục sử dụng chiếm 77.5%, nhóm rời bỏ chiếm 22.5%. Yêu cầu áp dụng SMOTE hoặc class_weight khi huấn luyện mô hình.",
    tags: ["Pie Chart", "Imbalance", "Target"]
  },
  {
    id: 3, file: "chart_03.png",
    section: "5.1 – Phân tích Song biến (Biến định lượng vs Churn)",
    title: "Phân phối Thời gian gắn bó, Cước phí & Tổng cước phí theo nhóm Churn",
    insight: "Khách hàng rời bỏ có thời gian gắn bó trung bình thấp hơn hẳn (đỉnh ở 1–5 tháng). Nhóm rời bỏ tập trung ở mức cước cao (70–100$). Vòng đời càng dài, tỷ lệ Churn càng thấp — tương quan nghịch mạnh.",
    tags: ["KDE", "Bivariate", "Churn vs Numerical"]
  },
  {
    id: 4, file: "chart_04.png",
    section: "5.2 – Phân tích Song biến (Biến định tính vs Churn)",
    title: "Tỷ lệ Churn theo từng nhóm biến định tính",
    insight: "Month-to-month → 42.05% churn. Electronic check → 48.91% churn. Fiber optic thiếu dịch vụ hỗ trợ → rủi ro 52.7%. Gender là đặc trưng Zero-Signal — hoàn toàn không có giá trị dự báo.",
    tags: ["Bar Chart", "Categorical", "Churn Rate"]
  },
  {
    id: 5, file: "chart_05.png",
    section: "5.2 – Phân tích Song biến (Risk Gap)",
    title: "Risk Gap – Chênh lệch tỷ lệ Churn giữa các nhóm",
    insight: "Contract: Risk Gap 41.06% — Month-to-month vs Two year. PaymentMethod: Risk Gap 41.97% — Electronic check vs Credit card tự động. Đây là 2 đặc trưng có khả năng phân tách nhóm Churn mạnh nhất trong tập dữ liệu.",
    tags: ["Risk Gap", "Bar Chart", "Feature Importance"]
  },
  {
    id: 6, file: "chart_06.png",
    section: "5.2 – Phân tích Song biến (Dịch vụ bổ trợ)",
    title: "Độ chênh lệch Churn (Risk Gap) của các Dịch vụ bổ trợ",
    insight: "OnlineSecurity và TechSupport dẫn đầu khả năng kéo giảm churn. Ngược lại, StreamingTV và StreamingMovies gần như không có tác dụng giữ chân — chênh lệch chỉ 1.3–1.6%. Dịch vụ Bảo vệ & Hỗ trợ > Dịch vụ Giải trí trong việc giữ khách.",
    tags: ["Risk Gap", "Services", "Retention"]
  },
  {
    id: 7, file: "chart_07.png",
    section: "5.3.1 – Feature Engineering: Phân khúc hóa (Binning)",
    title: "Ma trận Rủi ro – Loyalty Tier × Charge Segment",
    insight: "Onboarding (0–6 tháng) + Premium (trên 70$) → tỷ lệ rời bỏ 77.4%. Loyal (trên 48 tháng) + Budget → 0.4%. Đặc trưng phái sinh loyalty_tier và charge_segment phân loại hành vi phi tuyến tính xuất sắc, thể hiện Information Density cực cao.",
    tags: ["Heatmap", "Feature Engineering", "Risk Matrix"]
  },
  {
    id: 8, file: "chart_08.png",
    section: "5.3.2 – Feature Engineering: Tỷ số Tài chính",
    title: "Phân phối Log Áp lực Chi phí, Bill Shock Ratio & Đơn giá Dịch vụ theo Churn",
    insight: "charge_to_tenure_ratio_log: hai nhóm tách rời hoàn hảo — khẳng định khách hàng không rời đi vì cước cao mà vì áp lực tài chính so với thời gian gắn bó. bill_shock_ratio không mang giá trị thông tin hữu ích → loại bỏ khỏi Feature Space.",
    tags: ["KDE", "Feature Engineering", "Financial Ratio"]
  },
  {
    id: 9, file: "chart_09.png",
    section: "5.3.3 – Feature Engineering: Hệ thống điểm số",
    title: "Phân hóa Rủi ro theo Điểm Khiên Bảo vệ & Điểm Giải trí",
    insight: "Security Score 0 điểm → 52.7% churn. Tích lũy 4 dịch vụ bảo vệ → giảm cấp số nhân xuống 1.4%. Streaming Score dù có 2 dịch vụ giải trí vẫn ~27.2% — không tạo được sức giữ chân như kỳ vọng.",
    tags: ["Bar Chart", "Ecosystem Score", "Security vs Streaming"]
  },
  {
    id: 10, file: "chart_10.png",
    section: "5.3.3 – Feature Engineering: Cờ rủi ro hành vi",
    title: "Phân tích 3 Cờ Rủi ro Hành vi (Behavioral Risk Flags)",
    insight: "zero_supportive_service: 52.7% vs 15.1%. manual_payment: 34.0% vs 7.3%. composite_risk_profile (Fiber optic + Month-to-month): 55% churn — cứ 20 người có 11 người hủy. Đây là thành quả ấn tượng nhất của Feature Engineering.",
    tags: ["Risk Flags", "Bar Chart", "Feature Engineering"]
  },
  {
    id: 11, file: "chart_11.png",
    section: "5.3.4 – Feature Engineering: Phân khúc Nhân khẩu học",
    title: "Tỷ lệ Churn & Quy mô khách hàng theo Demographic Profile",
    insight: "Rủi ro tỷ lệ nghịch với quy mô khách hàng — tín hiệu tốt cho cấu trúc doanh thu. Cao tuổi + độc lập: rủi ro đỉnh 60.3%. demographic_profile tạo Risk Spread 49.7%, triệt tiêu rủi ro đa cộng tuyến từ 3 biến gốc.",
    tags: ["Dual Axis", "Demographics", "Life Stage"]
  },
  {
    id: 12, file: "chart_12.png",
    section: "5.4.1 – Tương quan Toàn cục (Pearson)",
    title: "Ma trận Tương quan Pearson – Biến định lượng & Thứ bậc",
    insight: "Log Áp lực Chi phí đạt r = 0.53 với Churn, vượt trội so với MonthlyCharges gốc (r = 0.27). Xác nhận: khách hàng không rời vì cước cao mà vì áp lực tài chính so với thời gian gắn bó. TotalCharges có Information Overlap cao với tenure.",
    tags: ["Heatmap", "Pearson", "Correlation"]
  },
  {
    id: 13, file: "chart_13.png",
    section: "5.4.1 – Tương quan Toàn cục (Spearman Ordinal)",
    title: "Ma trận Tương quan Spearman – Biến thứ bậc (Ordinal)",
    insight: "loyalty_tier đạt ρ = -0.43, nhỉnh hơn tenure gốc (r = -0.42). charge_segment tăng từ r = 0.27 lên ρ = 0.33. Binning bảo toàn thông tin và xử lí nhiễu loạn cục bộ của dữ liệu liên tục.",
    tags: ["Heatmap", "Spearman", "Ordinal Correlation"]
  },
  {
    id: 14, file: "chart_14.png",
    section: "5.4.2 – Tương quan Toàn cục (Cramér's V)",
    title: "Ma trận Cramér's V – Biến định tính & Điểm số",
    insight: "composite_risk_profile đạt V = 0.54 — vượt trội nhất. manual_payment V = 0.32. Các biến nhân khẩu học đơn lẻ nên được gộp thành demographic_profile để tránh bẫy đa cộng tuyến Dummy Variable Trap.",
    tags: ["Heatmap", "Cramér's V", "Categorical Correlation"]
  },
  {
    id: 15, file: "chart_15.png",
    section: "5.4.3 – Bảng Xếp hạng Sức mạnh Đặc trưng",
    title: "Feature Superiority Ranking – Xếp hạng Sức mạnh Đặc trưng",
    insight: "Top 3: composite_risk_profile (0.54), charge_to_tenure_ratio_log (0.53), security_score (0.49). Nhóm đặc trưng phái sinh Engineered Features áp đảo hoàn toàn so với dữ liệu nguyên bản. 9 đặc trưng tối ưu được chọn cho Modeling Pipeline.",
    tags: ["Bar Chart", "Ranking", "Feature Selection"]
  }
];

// Nhóm biểu đồ theo section cha
const SECTIONS = [
  {
    key: "univariate",
    label: "Phân tích Đơn biến (Univariate Analysis)",
    emoji: "📊",
    color: "border-blue-200 bg-blue-50 dark:bg-blue-900/10",
    badge: "bg-blue-100 text-blue-700",
    ids: [0, 1, 2]
  },
  {
    key: "bivariate",
    label: "Phân tích Song biến (Bivariate Analysis)",
    emoji: "🔍",
    color: "border-orange-200 bg-orange-50 dark:bg-orange-900/10",
    badge: "bg-orange-100 text-orange-700",
    ids: [3, 4, 5, 6]
  },
  {
    key: "feature_engineering",
    label: "Kỹ thuật Đặc trưng (Feature Engineering)",
    emoji: "⚙️",
    color: "border-purple-200 bg-purple-50 dark:bg-purple-900/10",
    badge: "bg-purple-100 text-purple-700",
    ids: [7, 8, 9, 10, 11]
  },
  {
    key: "correlation",
    label: "Phân tích Tương quan Toàn cục (Global Correlation)",
    emoji: "🔗",
    color: "border-green-200 bg-green-50 dark:bg-green-900/10",
    badge: "bg-green-100 text-green-700",
    ids: [12, 13, 14, 15]
  }
];

// ─── Modal xem ảnh phóng to ──────────────────────────────────────────────────
const ImageModal = ({ chart, onClose }) => {
  if (!chart) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-navy-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header modal */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-white/10">
          <div>
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">
              {chart.section}
            </p>
            <h3 className="text-base font-bold text-navy-700 dark:text-white leading-snug">
              {chart.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="ml-4 flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-navy-700 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-navy-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Ảnh */}
        <div className="p-5">
          <img
            src={`/eda_charts/${chart.file}`}
            alt={chart.title}
            className="w-full h-auto rounded-xl"
          />
        </div>

        {/* Insight */}
        <div className="px-5 pb-5">
          <div className="rounded-xl bg-indigo-50 dark:bg-navy-700 p-4">
            <p className="text-sm text-navy-700 dark:text-white leading-relaxed">
              💡 <b>Nhận xét:</b> {chart.insight}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Card biểu đồ ────────────────────────────────────────────────────────────
const ChartCard = ({ chart, onOpen }) => (
  <div
    className="bg-white dark:!bg-navy-800 rounded-[20px] shadow-md overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
    onClick={() => onOpen(chart)}
  >
    {/* Ảnh biểu đồ */}
    <div className="relative overflow-hidden bg-gray-50 dark:bg-navy-900">
      <img
        src={`/eda_charts/${chart.file}`}
        alt={chart.title}
        className="w-full h-52 object-cover object-top group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
        <span className="text-white text-xs font-medium bg-black/40 px-3 py-1 rounded-full">
          🔍 Click để xem lớn
        </span>
      </div>
    </div>

    {/* Nội dung card */}
    <div className="p-4 flex flex-col gap-2 flex-1">
      <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wide">
        {chart.section}
      </p>
      <h4 className="text-sm font-bold text-navy-700 dark:text-white leading-snug line-clamp-2">
        {chart.title}
      </h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3 flex-1">
        {chart.insight}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mt-auto pt-2">
        {chart.tags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-navy-700 text-gray-500 dark:text-gray-400"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const NotebookCharts = () => {
  const [modalChart, setModalChart] = useState(null);
  const [activeSection, setActiveSection] = useState("all");

  const filteredCharts =
    activeSection === "all"
      ? CHARTS
      : CHARTS.filter((c) =>
          SECTIONS.find((s) => s.key === activeSection)?.ids.includes(c.id)
        );

  return (
    <>
      {/* Modal xem ảnh phóng to */}
      {modalChart && (
        <ImageModal chart={modalChart} onClose={() => setModalChart(null)} />
      )}

      <div className="mt-5 flex flex-col gap-6 w-full">
        {/* Header + bộ lọc section */}
        <div className="rounded-[20px] bg-white p-6 shadow-3xl dark:!bg-navy-800 dark:text-white">
          <h2 className="text-lg font-bold mb-1">
            Phân tích Khám phá Dữ liệu
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            {CHARTS.length} biểu đồ được trích xuất trực tiếp từ notebook EDA. Click vào biểu đồ để xem phóng to và đọc nhận xét chi tiết.
          </p>

          {/* Bộ lọc */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveSection("all")}
              className={`text-xs font-medium px-4 py-2 rounded-full border transition-all ${
                activeSection === "all"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white dark:bg-navy-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-indigo-300"
              }`}
            >
              🗂️ Tất cả ({CHARTS.length})
            </button>
            {SECTIONS.map((sec) => (
              <button
                key={sec.key}
                onClick={() => setActiveSection(sec.key)}
                className={`text-xs font-medium px-4 py-2 rounded-full border transition-all ${
                  activeSection === sec.key
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white dark:bg-navy-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-indigo-300"
                }`}
              >
                {sec.emoji} {sec.label.split(" (")[0]} ({sec.ids.length})
              </button>
            ))}
          </div>
        </div>

        {/* Grid biểu đồ theo section */}
        {activeSection === "all" ? (
          SECTIONS.map((sec) => (
            <div key={sec.key} className={`rounded-[20px] border-2 p-5 ${sec.color} dark:border-white/10`}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{sec.emoji}</span>
                <h3 className="text-base font-bold text-navy-700 dark:text-white">
                  {sec.label}
                </h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sec.badge}`}>
                  {sec.ids.length} biểu đồ
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {CHARTS.filter((c) => sec.ids.includes(c.id)).map((chart) => (
                  <ChartCard key={chart.id} chart={chart} onOpen={setModalChart} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCharts.map((chart) => (
              <ChartCard key={chart.id} chart={chart} onOpen={setModalChart} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default NotebookCharts;
