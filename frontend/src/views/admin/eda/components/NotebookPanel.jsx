import React, { useState } from "react";
import Card from "components/card";

// ─── Dữ liệu chart + nhận xét từ notebook trocungDucLevan.ipynb ─────────────
const NOTEBOOK_CHARTS = [
  {
    id: "num-dist",
    file: "/eda_charts/01_numerical_distribution.png",
    section: "Phân bố biến định lượng",
    color: "teal",
    insight: [
      "tenure có dạng phân phối hai đỉnh (Bimodal Distribution). Khách hàng tập trung rất cao ở hai biên — nhóm mới (1–6 tháng) và nhóm trung thành lâu năm (60–72 tháng). Đây là tín hiệu mạnh để phân đoạn khách hàng theo vòng đời.",
      "MonthlyCharges có phân phối lệch phải nhẹ với hai cụm mật độ: nhóm cước thấp (~20$) và nhóm cước cao (70–105$), phản ánh sự phân tầng rõ rệt giữa gói dịch vụ DSL và Fiber optic.",
      "TotalCharges có phân phối lệch phải mạnh. Nhóm churn tập trung quanh mốc 0 vì phần lớn hủy dịch vụ trong những tháng đầu nên tổng cước tích lũy còn thấp.",
    ],
  },
  {
    id: "cat-dist",
    file: "/eda_charts/02_categorical_distribution.png",
    section: "Phân bố biến định tính",
    color: "blue",
    insight: [
      "Tập dữ liệu có tính phân nhánh khá đồng đều. Phần lớn đặc trưng chỉ xoay quanh 2 đến 3 nhãn phân biệt, đặc trưng có độ phức tạp cao nhất PaymentMethod cũng chỉ mang 4 giá trị.",
      "Không xuất hiện tình trạng nhãn hiếm (Rare Labels) — tất cả nhóm giá trị đều chiếm tỷ trọng đáng kể, thấp nhất là 6.1% ở PhoneService.",
      "PhoneService có nhãn Yes chiếm ưu thế tuyệt đối 93.89%; chỉ 6.1% khách hàng không sử dụng điện thoại.",
    ],
  },
  {
    id: "churn-target",
    file: "/eda_charts/03_churn_target_distribution.png",
    section: "Phân bố biến mục tiêu — Churn",
    color: "orange",
    insight: [
      "Tập dữ liệu thể hiện sự mất cân bằng mẫu ở mức độ vừa phải với tỷ lệ xấp xỉ 3.5 : 1, với nhóm khách hàng tiếp tục sử dụng dịch vụ chiếm 77.5%.",
      "Nhóm khách hàng rời bỏ dịch vụ — nhóm mục tiêu cốt lõi cần dự đoán — chiếm phần thiểu số với 22.5% trên tổng số khách hàng.",
      "Mức mất cân bằng này ở ngưỡng vừa phải, có thể xử lý bằng SMOTE hoặc class_weight mà không cần oversampling quá mức.",
    ],
  },
  {
    id: "num-churn",
    file: "/eda_charts/04_numerical_vs_churn.png",
    section: "Biến định lượng vs Churn (KDE + Boxplot)",
    color: "amber",
    insight: [
      "tenure: nhóm rời bỏ tập trung chủ yếu ở 1–6 tháng đầu; nhóm tiếp tục chiếm ưu thế trên 48 tháng. Trung vị nhóm rời đi khoảng 10 tháng — rõ ràng là cửa sổ rủi ro quan trọng nhất.",
      "MonthlyCharges: nhóm tiếp tục dồn mật độ cao ở ~20$; nhóm rời bỏ tập trung ở phân khúc 70$–105$. Fiber optic users có cước cao tương ứng với churn cao.",
      "TotalCharges: nhóm churn chiếm ưu thế quanh mốc $0 vì phần lớn hủy dịch vụ ngay trong những tháng đầu, chưa kịp tích lũy tổng cước.",
    ],
  },
  {
    id: "cat-churn",
    file: "/eda_charts/05_categorical_vs_churn.png",
    section: "Tỷ lệ Churn theo biến định tính",
    color: "red",
    insight: [
      "PaymentMethod sở hữu mức phân hóa mạnh nhất với 41.97%. Khách hàng sử dụng Electronic check có tỷ lệ rời bỏ dịch vụ đạt mốc 48.91%, trong khi nhóm thanh toán tự động thẻ tín dụng chỉ 6.93%.",
      "Contract — chênh lệch 41.06%. Month-to-month rủi ro hủy 42.05%; Two year gần như triệt tiêu với chỉ 1.00%. Hợp đồng dài hạn là rào cản hiệu quả nhất giúp giữ chân khách hàng.",
      "InternetService — Fiber optic churn 41.54%; No internet service chỉ 1.4%. Nhóm dùng cáp quang chịu mức cước cao và kỳ vọng chất lượng cao hơn, dẫn đến churn cao hơn khi kỳ vọng không được đáp ứng.",
    ],
  },
  {
    id: "expected-churn",
    file: "/eda_charts/06_expected_churn_segments.png",
    section: "Phân khúc rủi ro dự kiến (Expected Churn)",
    color: "orange",
    insight: [
      "Với việc tính toán Tỷ lệ rời bỏ dự kiến bằng tích của Quy mô tệp khách hàng × Tỷ lệ rời bỏ, những phân khúc rủi ro thực sự được phát hiện.",
      "Contract = Month-to-month (47.7% KH) — dự kiến 21.16% khách hàng rời bỏ. Đây là phân khúc ưu tiên số 1 để tác động giữ chân.",
      "InternetService = Fiber optic (45.9% KH) — 19.04%; PaymentMethod = Electronic check (36.3% KH) — 17.73%. Cứ 5 khách hàng sẽ có 1 người thuộc nhóm hợp đồng ngắn hạn và rời bỏ dịch vụ.",
    ],
  },
  {
    id: "risk-gap",
    file: "/eda_charts/07_risk_gap_services.png",
    section: "Risk Gap — Dịch vụ bổ trợ",
    color: "teal",
    insight: [
      "OnlineSecurity và TechSupport dẫn đầu về khả năng giữ chân — giảm churn từ ~40% xuống chỉ còn 8.7% và 9.6%. Mức chênh lệch hơn 30% — đây là hai dịch vụ có tác động bảo vệ mạnh nhất.",
      "OnlineBackup và DeviceProtection duy trì hiệu quả ấn tượng với mức chênh lệch xấp xỉ 20%. Cả hai dịch vụ này đều nên được đưa vào gói khuyến khích giữ chân.",
      "StreamingMovies và StreamingTV gần như không có hiệu quả giữ chân — độ chênh lệch chỉ 1.3%–1.6%. Dịch vụ streaming của nhà mạng rất dễ bị thay thế bởi các nền tảng bên thứ ba.",
    ],
  },
  {
    id: "financial-feat",
    file: "/eda_charts/08_financial_features_dist.png",
    section: "Đặc trưng kỹ thuật — Log Áp lực Chi phí",
    color: "purple",
    insight: [
      "Ở biểu đồ Log Tỷ lệ Áp lực chi phí, phân phối của hai nhóm tách rời một cách hoàn hảo. Nhóm tiếp tục sử dụng tập trung ở vùng giá trị thấp, nhóm rời bỏ tập trung ở vùng giá trị cao.",
      "Log transformation đã chuyển đổi phân phối từ lệch phải mạnh thành dạng gần chuẩn, giúp mô hình học hiệu quả hơn.",
      "Hệ số tương quan tăng từ r = 0.27 (MonthlyCharges gốc) lên r = 0.53 (Log Áp lực Chi phí) — bằng chứng rõ ràng cho giá trị của Feature Engineering.",
    ],
  },
  {
    id: "security-loyalty",
    file: "/eda_charts/09_security_loyalty_dist.png",
    section: "Điểm Bảo mật & Mức độ Gắn bó",
    color: "blue",
    insight: [
      "Security Score = 0 (không có bất kỳ dịch vụ bảo vệ nào) có tỷ lệ churn cao nhất. Mỗi điểm tăng thêm tương ứng giảm rủi ro rời bỏ đáng kể.",
      "Loyalty Tier thể hiện quy luật rõ ràng: nhóm Onboarding (0–6 tháng) có churn cao nhất ~50%, giảm dần đến nhóm Champion (48+ tháng) chỉ còn ~6%.",
      "Binning liên tục thành tier không chỉ đơn giản hóa không gian đặc trưng mà còn giúp mô hình nắm bắt ngưỡng phi tuyến tự nhiên trong dữ liệu.",
    ],
  },
  {
    id: "pearson",
    file: "/eda_charts/10_pearson_correlation.png",
    section: "Ma trận tương quan Pearson",
    color: "teal",
    insight: [
      "Log Tỷ lệ Áp lực chi phí thể hiện năng lực khoanh vùng rủi ro xuất sắc với hệ số tương quan r = 0.53, vượt trội hoàn toàn so với MonthlyCharges gốc chỉ r = 0.27.",
      "tenure có tương quan âm r = -0.35 với Churn — gắn bó lâu hơn đồng nghĩa rủi ro rời bỏ thấp hơn. Đây là đặc trưng quan trọng nhất trong nhóm Original Features.",
      "TotalCharges và tenure có tương quan rất cao r = 0.83, dẫn tới đa cộng tuyến — cần xử lý trước khi đưa vào mô hình tuyến tính.",
    ],
  },
  {
    id: "risk-flags",
    file: "/eda_charts/11_risk_flags.png",
    section: "Cờ rủi ro hành vi — Churn Triggers",
    color: "red",
    insight: [
      "Cờ Không có dịch vụ Bảo vệ & Hỗ trợ (zero_supportive_service): khách hàng không đăng ký bất kỳ dịch vụ bảo vệ nào có churn cao hơn đáng kể.",
      "Thanh toán thủ công (Electronic check): nhóm này không ràng buộc bằng tự động trừ tiền, dễ hủy dịch vụ bất kỳ lúc nào — churn ~48%.",
      "Tổ hợp rủi ro (Fiber optic + Month-to-month): đây là trigger mạnh nhất — khách hàng trong nhóm này có churn gần 70%, gấp ~3 lần trung bình toàn tập.",
    ],
  },
  {
    id: "feature-rank",
    file: "/eda_charts/12_feature_ranking.png",
    section: "Xếp hạng sức mạnh đặc trưng",
    color: "purple",
    insight: [
      "Bảng xếp hạng cường độ tương quan tuyệt đối thể hiện sự áp đảo hoàn toàn của nhóm đặc trưng phái sinh Engineered Features so với Original Features.",
      "Siêu cờ Tổ hợp rủi ro (V = 0.54) và Log Áp lực Chi phí (r = 0.53) chiếm hai vị trí đầu bảng — cả hai đều là đặc trưng kỹ thuật, không phải dữ liệu gốc.",
      "Điểm Khiên Bảo vệ (r = 0.49) và Mức độ gắn bó (r = 0.43) cho thấy việc Binning và tổng hợp điểm số đã tạo ra tín hiệu mạnh hơn nhiều so với các cột thô.",
    ],
  },
];

const COLOR_MAP = {
  teal:   { dot: "bg-teal-400",   label: "text-teal-400",   card: "bg-teal-950/20 border-teal-900/40" },
  blue:   { dot: "bg-blue-400",   label: "text-blue-400",   card: "bg-blue-950/20 border-blue-900/40" },
  orange: { dot: "bg-orange-400", label: "text-orange-400", card: "bg-orange-950/20 border-orange-900/40" },
  amber:  { dot: "bg-amber-400",  label: "text-amber-400",  card: "bg-amber-950/20 border-amber-900/40" },
  red:    { dot: "bg-red-400",    label: "text-red-400",    card: "bg-red-950/20 border-red-900/40" },
  purple: { dot: "bg-purple-400", label: "text-purple-400", card: "bg-purple-950/20 border-purple-900/40" },
};

const NotebookPanel = () => {
  const [expanded, setExpanded] = useState({});

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card extra="p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-xl">
            📓
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500">Notebook EDA</p>
            <h2 className="text-base font-bold text-navy-700 dark:text-white">
              Toàn bộ biểu đồ phân tích — trocungDucLevan.ipynb
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {NOTEBOOK_CHARTS.length} biểu đồ được tái tạo trực tiếp từ dữ liệu gốc với nhận xét đầy đủ từ notebook.
            </p>
          </div>
        </div>
      </Card>

      {/* Charts */}
      {NOTEBOOK_CHARTS.map((chart, idx) => {
        const c = COLOR_MAP[chart.color] || COLOR_MAP.blue;
        const isOpen = expanded[chart.id] !== false; // mặc định mở

        return (
          <Card key={chart.id} extra="overflow-hidden">
            {/* Header toggle */}
            <button
              className="flex w-full items-center justify-between p-5 text-left"
              onClick={() => toggle(chart.id)}
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${c.dot.replace("bg-", "bg-").replace("-400", "-500")}`}>
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div>
                  <span className={`text-[10px] font-semibold uppercase tracking-widest ${c.label}`}>
                    Biểu đồ {idx + 1}
                  </span>
                  <h3 className="text-sm font-bold text-navy-700 dark:text-white">
                    {chart.section}
                  </h3>
                </div>
              </div>
              <span className={`text-lg transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                ▾
              </span>
            </button>

            {/* Content */}
            {isOpen && (
              <div className="border-t border-gray-100 dark:border-white/10">
                {/* Chart image */}
                <div className="bg-[#0F172A] p-4">
                  <img
                    src={chart.file}
                    alt={chart.section}
                    className="mx-auto w-full max-w-5xl rounded-xl"
                    style={{ maxHeight: "520px", objectFit: "contain" }}
                    loading="lazy"
                  />
                </div>

                {/* Insights */}
                <div className={`mx-5 mb-5 mt-4 rounded-xl border p-4 ${c.card}`}>
                  <p className={`mb-2 text-[10px] font-semibold uppercase tracking-widest ${c.label}`}>
                    📝 Nhận xét
                  </p>
                  <ul className="space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    {chart.insight.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${c.dot}`} />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default NotebookPanel;
