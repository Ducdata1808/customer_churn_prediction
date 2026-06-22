import React from "react";
import Chart from "react-apexcharts";
import Card from "components/card";
import { SectionLabel, getChartBase, BRAND, NotebookChart } from "./common";

// ─── Feature ranking từ notebook (cell 177) ────────────────────────────────────
const FEATURE_RANKING = [
  { name: "Siêu cờ Tổ hợp rủi ro",       type: "Engineered", corr: 0.54, color: "#ef4444" },
  { name: "Log Tỷ lệ Áp lực chi phí",     type: "Engineered", corr: 0.53, color: "#f97316" },
  { name: "Điểm Khiên Bảo vệ",            type: "Engineered", corr: 0.49, color: "#eab308" },
  { name: "Mức độ gắn bó (loyalty_tier)", type: "Engineered", corr: 0.43, color: "#a855f7" },
  { name: "MonthlyCharges (gốc)",          type: "Original",   corr: 0.27, color: "#6366f1" },
  { name: "tenure (gốc)",                  type: "Original",   corr: 0.42, color: "#14b8a6" },
];

const CorrelationPanel = ({ cor, isDark }) => {
  const { ax, chartBase } = getChartBase(isDark);

  const heatOpt = {
    ...chartBase,
    chart: { ...chartBase.chart, type: "heatmap" },
    dataLabels: { enabled: true, style: { colors: ["#fff"], fontSize: "9px" } },
    colors: [BRAND],
    xaxis: { labels: { style: { colors: ax, fontSize: "9px" }, rotate: -45 } },
    yaxis: { labels: { style: { colors: ax, fontSize: "9px" } } },
  };

  const series = cor
    ? cor.index.map((r, ri) => ({ name: r, data: cor.columns.map((c, ci) => ({ x: c, y: +cor.values[ri][ci].toFixed(2) })) }))
    : [];

  // Horizontal bar chart cho feature ranking
  const rankingOpt = {
    ...chartBase,
    chart: { ...chartBase.chart, type: "bar" },
    plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
    xaxis: { labels: { style: { colors: ax }, formatter: (v) => v.toFixed(2) }, min: 0, max: 0.6 },
    yaxis: { labels: { style: { colors: ax, fontSize: "11px" } } },
    colors: FEATURE_RANKING.map(f => f.color),
    dataLabels: { enabled: true, formatter: (val) => val.toFixed(2), style: { fontSize: "10px" } },
    tooltip: { y: { formatter: (val) => `|r| = ${val.toFixed(2)}` } },
    legend: { show: false },
  };
  const rankingSeries = [{
    name: "Tương quan tuyệt đối",
    data: FEATURE_RANKING.map(f => ({ x: f.name, y: f.corr }))
  }];

  return (
    <div className="space-y-5">
      {/* ── Heatmap từ API ── */}
      <Card extra="p-6">
        <SectionLabel text="Correlation Matrix" />
        <h3 className="mb-1 text-lg font-bold text-navy-700 dark:text-white">Ma trận tương quan</h3>
        <p className="mb-4 text-xs text-gray-500">Độ tương quan tuyến tính giữa các biến định lượng gốc</p>
        <div className="h-[400px]">
          <Chart options={heatOpt} series={series} type="heatmap" height="100%" />
        </div>
        {cor?.insight && (
          <div className="mt-4 rounded-xl bg-lightPrimary p-4 dark:bg-navy-700">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-semibold text-brand-500">Tương quan: </span>{cor.insight}
            </p>
          </div>
        )}
      </Card>

      {/* ── Notebook chart 08: Log Áp lực Chi phí (Feature Engineering) ── */}
      <NotebookChart
        src="/eda_charts/08_financial_features_dist.png"
        label="Đặc trưng kỹ thuật tài chính — KDE phân tách (notebook cell 125)"
        title="Log Tỷ lệ Áp lực Chi phí: phân tách hoàn hảo giữa hai nhóm Churn"
        color="orange"
        maxH="380px"
        points={[
          "Ở biểu đồ Log Tỷ lệ Áp lực chi phí, phân phối của hai nhóm tách rời một cách hoàn hảo. Nhóm tiếp tục sử dụng (xanh) tập trung ở vùng giá trị thấp, nhóm rời bỏ (cam) tập trung ở vùng giá trị cao.",
          "Log transformation đã chuyển đổi phân phối từ lệch phải mạnh thành dạng gần chuẩn, giúp mô hình học hiệu quả hơn và giảm nhiễu do outlier.",
          "Hệ số tương quan tăng từ r = 0.27 (MonthlyCharges gốc) lên r = 0.53 (Log Áp lực Chi phí) — bằng chứng rõ ràng cho giá trị của Feature Engineering. Khách hàng không rời bỏ vì cước phí cao mà là vì áp lực tài chính quá lớn so với thời gian gắn bó.",
        ]}
      />

      {/* ── Notebook chart 09: Security Score & Loyalty Tier ── */}
      <NotebookChart
        src="/eda_charts/09_security_loyalty_dist.png"
        label="Điểm Bảo mật & Mức độ Gắn bó — Churn rate (notebook cell 135)"
        title="Security Score và Loyalty Tier: hai đặc trưng kỹ thuật phân tách rủi ro hiệu quả"
        color="blue"
        maxH="380px"
        points={[
          "Việc thiết lập mốc cơ sở -1 đã phân tách thành công yếu tố gây nhiễu Không sử dụng Internet, là nhóm có rủi ro rời bỏ thấp tự nhiên, qua đó thể hiện nguy cơ rời bỏ dịch vụ của từng phân khúc dịch vụ bổ trợ một cách trung thực hơn.",
          "Security Score = 0 (không có bất kỳ dịch vụ bảo vệ nào) có tỷ lệ churn cao nhất. Mỗi điểm tăng thêm tương ứng giảm rủi ro rời bỏ đáng kể — chứng minh rằng gói bảo mật toàn diện là công cụ giữ chân hiệu quả nhất.",
          "Loyalty Tier thể hiện quy luật rõ ràng: nhóm Onboarding (0–6 tháng) có churn cao nhất ~50%, giảm dần đến nhóm Champion (48+ tháng) chỉ còn ~6%. Binning liên tục thành tier giúp mô hình nắm bắt ngưỡng phi tuyến tự nhiên.",
        ]}
      />

      {/* ── Notebook chart 10: Pearson Correlation Heatmap ── */}
      <NotebookChart
        src="/eda_charts/10_pearson_correlation.png"
        label="Ma trận tương quan Pearson — Engineered vs Original (notebook cell 160)"
        title="Pearson correlation: phát hiện đa cộng tuyến và xếp hạng tín hiệu"
        color="teal"
        maxH="420px"
        points={[
          "Log Tỷ lệ Áp lực chi phí thể hiện năng lực khoanh vùng rủi ro xuất sắc với r = 0.53, vượt trội hoàn toàn so với đặc trưng gốc Cước phí hàng tháng r = 0.27.",
          "tenure có tương quan âm r = -0.35 với Churn — gắn bó lâu hơn đồng nghĩa rủi ro rời bỏ thấp hơn. Đây là đặc trưng quan trọng nhất trong nhóm Original Features.",
          "TotalCharges và tenure có tương quan rất cao r = 0.83, dẫn tới đa cộng tuyến — loại bỏ TotalCharges khỏi tập đặc trưng đầu vào ML để tránh nhiễu trọng số.",
        ]}
      />

      {/* ── Notebook chart 11: Risk Flags ── */}
      <NotebookChart
        src="/eda_charts/11_risk_flags.png"
        label="Cờ rủi ro hành vi — Churn Triggers (notebook cell 137)"
        title="Ba cờ rủi ro khoanh vùng điểm gãy khiến khách hàng rời bỏ dịch vụ"
        color="red"
        maxH="360px"
        points={[
          "Cờ Không có dịch vụ Bảo vệ & Hỗ trợ (zero_supportive_service): khách hàng không đăng ký bất kỳ dịch vụ bảo vệ nào — churn tăng vọt so với nhóm có ít nhất 1 dịch vụ.",
          "Thanh toán thủ công (manual_payment — Electronic check): nhóm này không ràng buộc bằng tự động trừ tiền, dễ hủy dịch vụ bất kỳ lúc nào — churn ~48% vs ~7.3% nhóm thanh toán tự động.",
          "Tổ hợp rủi ro (composite_risk_profile — Fiber optic + Month-to-month): đây là trigger mạnh nhất — churn gần 70%, gấp ~3 lần trung bình toàn tập. Đây là phân khúc cần ưu tiên can thiệp giữ chân khẩn cấp.",
        ]}
      />

      {/* ── Feature Superiority Ranking (ApexCharts interactive + notebook chart 12) ── */}
      <Card extra="p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-purple-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-purple-500">Xếp hạng sức mạnh đặc trưng</span>
        </div>
        <div className="h-[280px]">
          <Chart options={rankingOpt} series={rankingSeries} type="bar" height="100%" />
        </div>
        <div className="mt-4 space-y-2 rounded-xl bg-purple-50 p-4 dark:bg-purple-950/20">
          <ul className="space-y-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500" />
              <span><strong className="text-navy-700 dark:text-white">Log Tỷ lệ Áp lực chi phí</strong> — hệ số tương quan <strong>r = 0.53</strong>, vượt trội hoàn toàn so với <em>MonthlyCharges</em> gốc chỉ <strong>r = 0.27</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500" />
              <span><strong className="text-navy-700 dark:text-white">Siêu cờ Tổ hợp rủi ro</strong> — đạt <strong>V = 0.54</strong>, khẳng định việc kết hợp tín hiệu <em>Cáp quang + Hợp đồng ngắn hạn</em> là thao tác Feature Engineering đúng đắn.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500" />
              <span>Các đặc trưng phái sinh <strong className="text-navy-700 dark:text-white">Engineered</strong> áp đảo hoàn toàn so với dải dữ liệu nguyên bản <em>Original</em> ở tất cả các vị trí đầu bảng xếp hạng.</span>
            </li>
          </ul>
        </div>
      </Card>

      {/* ── Notebook chart 12: Feature Ranking PNG ── */}
      <NotebookChart
        src="/eda_charts/12_feature_ranking.png"
        label="Feature Superiority Ranking — Engineered vs Original (notebook cell 176)"
        title="Bảng xếp hạng sức mạnh đặc trưng: 9 đặc trưng tối ưu cho ML Pipeline"
        color="purple"
        maxH="400px"
        points={[
          "Bảng xếp hạng cường độ tương quan tuyệt đối đã trực quan hóa sự áp đảo hoàn toàn của nhóm đặc trưng phái sinh Engineered Features so với dải dữ liệu nguyên bản Original Features.",
          "Siêu cờ Tổ hợp rủi ro (V = 0.54) và Log Áp lực Chi phí (r = 0.53) chiếm hai vị trí đầu bảng — cả hai đều là đặc trưng kỹ thuật, không phải dữ liệu gốc.",
          "Không gian đặc trưng sau quá trình thực nghiệm được cô đọng thành bộ 9 đặc trưng tối ưu nhất, đảm bảo tính độc lập tối đa giữa các vector đầu vào, mang lại hiệu suất cao nhất cho Modeling Pipeline mà không lo rủi ro Overfitting.",
        ]}
      />
    </div>
  );
};

export default CorrelationPanel;
