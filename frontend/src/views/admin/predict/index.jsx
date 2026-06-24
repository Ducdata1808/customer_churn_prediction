import React, { useState } from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import Card from "components/card";
import Widget from "components/widget/Widget";
import {
  MdPerson,
  MdSettings,
  MdAttachMoney,
  MdCheckCircle,
  MdWarning,
  MdErrorOutline,
  MdInfoOutline,
  MdPercent,
  MdBarChart,
  MdSend,
} from "react-icons/md";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

// ── Shared input styles (Horizon UI pattern) ──────────────────────────────────
const labelCls =
  "block text-xs font-semibold text-navy-700 dark:text-white mb-1";
const selectCls =
  "w-full rounded-xl border border-gray-200 bg-white/0 p-2.5 text-sm text-navy-700 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-800 dark:text-white transition-all cursor-pointer";
const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white/0 p-2.5 text-sm text-navy-700 placeholder-gray-400 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-800 dark:text-white transition-all";

const ChurnPrediction = () => {
  const [formData, setFormData] = useState({
    gender: "Female",
    SeniorCitizen: 0,
    Partner: "No",
    Dependents: "No",
    tenure: 12,
    PhoneService: "Yes",
    MultipleLines: "No",
    InternetService: "Fiber optic",
    OnlineSecurity: "No",
    OnlineBackup: "Yes",
    DeviceProtection: "No",
    TechSupport: "No",
    StreamingTV: "Yes",
    StreamingMovies: "Yes",
    Contract: "Month-to-month",
    PaperlessBilling: "Yes",
    PaymentMethod: "Electronic check",
    MonthlyCharges: 89.5,
    TotalCharges: 1074.0,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...formData };

    if (name === "SeniorCitizen" || name === "tenure") {
      updated[name] = parseInt(value) || 0;
    } else if (name === "MonthlyCharges" || name === "TotalCharges") {
      updated[name] = parseFloat(value) || 0.0;
    } else {
      updated[name] = value;
    }

    if (name === "InternetService" && value === "No") {
      updated.OnlineSecurity = "No internet service";
      updated.OnlineBackup = "No internet service";
      updated.DeviceProtection = "No internet service";
      updated.TechSupport = "No internet service";
      updated.StreamingTV = "No internet service";
      updated.StreamingMovies = "No internet service";
    } else if (
      name === "InternetService" &&
      formData.InternetService === "No" &&
      value !== "No"
    ) {
      updated.OnlineSecurity = "No";
      updated.OnlineBackup = "No";
      updated.DeviceProtection = "No";
      updated.TechSupport = "No";
      updated.StreamingTV = "No";
      updated.StreamingMovies = "No";
    }

    if (name === "PhoneService" && value === "No") {
      updated.MultipleLines = "No phone service";
    } else if (
      name === "PhoneService" &&
      formData.PhoneService === "No" &&
      value !== "No"
    ) {
      updated.MultipleLines = "No";
    }

    // Auto-calculate TotalCharges
    if (name === "MonthlyCharges" || name === "tenure") {
      const t = name === "tenure" ? parseInt(value) || 0 : parseInt(updated.tenure) || 0;
      const m =
        name === "MonthlyCharges"
          ? parseFloat(value) || 0.0
          : parseFloat(updated.MonthlyCharges) || 0.0;
      updated.TotalCharges = parseFloat((t * m).toFixed(2));
    }

    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await axios.post(`${API_BASE}/api/predict`, formData);
      setResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Dự đoán thất bại. Hãy chắc chắn Backend đang hoạt động."
      );
    } finally {
      setLoading(false);
    }
  };

  const getRisk = (prob) => {
    const p = prob * 100;
    if (p < 40)
      return {
        label: "Rủi ro thấp",
        color: "#05cd99",
        bg: "bg-green-50 dark:bg-green-950/20",
        border: "border-green-200 dark:border-green-900/40",
        text: "text-green-600 dark:text-green-400",
        action:
          "Khách hàng ổn định. Tiếp tục duy trì các ưu đãi và chiến dịch CSKH tiêu chuẩn.",
      };
    if (p < 70)
      return {
        label: "Rủi ro trung bình",
        color: "#f97316",
        bg: "bg-orange-50 dark:bg-orange-950/20",
        border: "border-orange-200 dark:border-orange-900/40",
        text: "text-orange-600 dark:text-orange-400",
        action:
          "Khách hàng có dấu hiệu dao động. Đề xuất khảo sát ý kiến hoặc gửi ưu đãi cá nhân hóa.",
      };
    return {
      label: "Rủi ro cao",
      color: "#EE5D50",
      bg: "bg-red-50 dark:bg-red-950/20",
      border: "border-red-200 dark:border-red-900/40",
      text: "text-red-600 dark:text-red-400",
      action:
        "Nguy cơ rời mạng lớn! CSKH cần liên hệ trực tiếp, tặng gói ưu đãi hoặc chiết khấu đặc biệt.",
    };
  };

  const risk = result ? getRisk(result.churn_probability) : null;
  const gaugeSeries = result ? [Math.round(result.churn_probability * 100)] : [];
  const gaugeOptions = {
    chart: { type: "radialBar", sparkline: { enabled: true }, background: "transparent" },
    theme: { mode: "dark" },
    plotOptions: {
      radialBar: {
        startAngle: -95,
        endAngle: 95,
        track: { background: "rgba(255,255,255,0.08)", strokeWidth: "90%", margin: 5 },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: -3,
            fontSize: "28px",
            fontWeight: "bold",
            color: "#ffffff",
            formatter: (val) => `${val}%`,
          },
        },
      },
    },
    grid: { padding: { top: -10, bottom: -10 } },
    fill: {
      colors: [
        result
          ? result.churn_probability * 100 < 40
            ? "#05cd99"
            : result.churn_probability * 100 < 70
            ? "#f97316"
            : "#EE5D50"
          : "#422AFB",
      ],
    },
    labels: ["Xác suất"],
  };

  const hasInternet = formData.InternetService !== "No";
  const hasPhone = formData.PhoneService === "Yes";

  return (
    <div className="space-y-5 pt-5 pb-10">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
          Dự báo rủi ro rời mạng
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Nhập hồ sơ khách hàng để nhận kết quả phân tích xác suất rời mạng theo thời gian thực
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* ── Form Panel (spans 2 cols) ── */}
        <Card extra="p-6 lg:col-span-2">
          <div className="mb-5 border-b border-gray-200 pb-4 dark:border-white/10">
            <h4 className="text-lg font-bold text-navy-700 dark:text-white">
              Thông tin khách hàng
            </h4>
            <p className="text-xs text-gray-500">
              Nhân khẩu học · Dịch vụ đăng ký · Tài chính &amp; Hợp đồng
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-3">

              {/* Column 1: Demographics */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2 dark:border-white/10">
                  <MdPerson className="h-5 w-5 text-brand-500" />
                  <h5 className="text-sm font-bold text-navy-700 dark:text-white">
                    Nhân khẩu học
                  </h5>
                </div>

                <div>
                  <label className={labelCls}>Giới tính</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className={selectCls}>
                    <option value="Male">Nam (Male)</option>
                    <option value="Female">Nữ (Female)</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Người cao tuổi</label>
                  <select name="SeniorCitizen" value={formData.SeniorCitizen} onChange={handleChange} className={selectCls}>
                    <option value={0}>Không (No)</option>
                    <option value={1}>Có (Yes)</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Có bạn đời (Partner)</label>
                  <select name="Partner" value={formData.Partner} onChange={handleChange} className={selectCls}>
                    <option value="No">Không (No)</option>
                    <option value="Yes">Có (Yes)</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Người phụ thuộc</label>
                  <select name="Dependents" value={formData.Dependents} onChange={handleChange} className={selectCls}>
                    <option value="No">Không (No)</option>
                    <option value="Yes">Có (Yes)</option>
                  </select>
                </div>
              </div>

              {/* Column 2: Services */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2 dark:border-white/10">
                  <MdSettings className="h-5 w-5 text-green-500" />
                  <h5 className="text-sm font-bold text-navy-700 dark:text-white">
                    Dịch vụ sử dụng
                  </h5>
                </div>

                <div>
                  <label className={labelCls}>Dịch vụ thoại (Phone)</label>
                  <select name="PhoneService" value={formData.PhoneService} onChange={handleChange} className={selectCls}>
                    <option value="No">Không (No)</option>
                    <option value="Yes">Có (Yes)</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Nhiều đường dây</label>
                  <select name="MultipleLines" value={formData.MultipleLines} onChange={handleChange} disabled={!hasPhone} className={`${selectCls} disabled:opacity-40 disabled:cursor-not-allowed`}>
                    {!hasPhone && <option value="No phone service">Không có dịch vụ thoại</option>}
                    {hasPhone && (
                      <>
                        <option value="No">Không (No)</option>
                        <option value="Yes">Có (Yes)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Dịch vụ Internet</label>
                  <select name="InternetService" value={formData.InternetService} onChange={handleChange} className={selectCls}>
                    <option value="DSL">Cáp đồng (DSL)</option>
                    <option value="Fiber optic">Cáp quang (Fiber optic)</option>
                    <option value="No">Không sử dụng (No)</option>
                  </select>
                </div>

                {[
                  { name: "OnlineSecurity", label: "Bảo mật (OnlineSecurity)" },
                  { name: "OnlineBackup", label: "Sao lưu (OnlineBackup)" },
                  { name: "DeviceProtection", label: "Bảo hiểm thiết bị" },
                  { name: "TechSupport", label: "Kỹ thuật (TechSupport)" },
                  { name: "StreamingTV", label: "Xem TV (StreamingTV)" },
                  { name: "StreamingMovies", label: "Xem Phim (StreamingMovies)" },
                ].map(({ name, label }) => (
                  <div key={name}>
                    <label className={labelCls}>{label}</label>
                    <select
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      disabled={!hasInternet}
                      className={`${selectCls} disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {!hasInternet && <option value="No internet service">Không có Internet</option>}
                      {hasInternet && (
                        <>
                          <option value="No">Không (No)</option>
                          <option value="Yes">Có (Yes)</option>
                        </>
                      )}
                    </select>
                  </div>
                ))}
              </div>

              {/* Column 3: Financials */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2 dark:border-white/10">
                  <MdAttachMoney className="h-5 w-5 text-orange-400" />
                  <h5 className="text-sm font-bold text-navy-700 dark:text-white">
                    Tài chính &amp; Hợp đồng
                  </h5>
                </div>

                <div>
                  <label className={labelCls}>Loại hợp đồng</label>
                  <select name="Contract" value={formData.Contract} onChange={handleChange} className={selectCls}>
                    <option value="Month-to-month">Từng tháng (Month-to-month)</option>
                    <option value="One year">Một năm (One year)</option>
                    <option value="Two year">Hai năm (Two year)</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Hóa đơn điện tử</label>
                  <select name="PaperlessBilling" value={formData.PaperlessBilling} onChange={handleChange} className={selectCls}>
                    <option value="No">Không (No)</option>
                    <option value="Yes">Có (Yes)</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Thanh toán</label>
                  <select name="PaymentMethod" value={formData.PaymentMethod} onChange={handleChange} className={selectCls}>
                    <option value="Electronic check">Electronic check</option>
                    <option value="Mailed check">Mailed check</option>
                    <option value="Bank transfer (automatic)">Bank transfer (automatic)</option>
                    <option value="Credit card (automatic)">Credit card (automatic)</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Thời gian sử dụng (Tháng)</label>
                  <input
                    type="number"
                    name="tenure"
                    value={formData.tenure}
                    onChange={handleChange}
                    min="0"
                    placeholder="Nhập số tháng"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Cước hàng tháng ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="MonthlyCharges"
                    value={formData.MonthlyCharges}
                    onChange={handleChange}
                    min="0"
                    placeholder="Cước hàng tháng"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Cước tích lũy ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="TotalCharges"
                    value={formData.TotalCharges}
                    onChange={handleChange}
                    min="0"
                    placeholder="Tổng cước tích lũy"
                    className={inputCls}
                  />
                  <p className="mt-1 text-[10px] italic text-gray-400">
                    * Tự động cập nhật = tenure × MonthlyCharges
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end border-t border-gray-100 pt-4 dark:border-white/10">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-brand-500 px-8 py-3 text-sm font-bold text-white transition-all hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <MdSend className="h-4 w-4" />
                    Thực hiện dự báo
                  </>
                )}
              </button>
            </div>
          </form>
        </Card>

        {/* ── Result Panel ── */}
        <Card extra="p-6 flex flex-col justify-between min-h-[480px]">
          <div>
            <div className="mb-5 border-b border-gray-200 pb-4 dark:border-white/10">
              <h4 className="text-lg font-bold text-navy-700 dark:text-white">
                Kết quả đánh giá rủi ro
              </h4>
              <p className="text-xs text-gray-500">
                Xác suất rời mạng từ mô hình dự báo tối ưu
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className={`mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm dark:border-red-900/40 dark:bg-red-950/20`}>
                <MdErrorOutline className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                <div>
                  <p className="font-bold text-navy-700 dark:text-white mb-0.5">Lỗi xử lý</p>
                  <p className="text-red-600 dark:text-red-400 text-xs">{error}</p>
                </div>
              </div>
            )}

            {/* Idle state */}
            {!result && !error && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <MdInfoOutline className="h-16 w-16 mb-4 text-gray-300 dark:text-gray-600 animate-pulse" />
                <p className="text-sm font-semibold text-navy-700 dark:text-white">
                  Chưa có kết quả dự đoán
                </p>
                <p className="mt-2 max-w-[200px] text-xs text-gray-500 leading-relaxed">
                  Điền form bên trái và chọn "Thực hiện dự báo" để bắt đầu
                </p>
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="space-y-5">
                {/* Gauge chart */}
                <div className="flex flex-col items-center">
                  <div className="w-full max-w-[220px]">
                    <Chart
                      options={gaugeOptions}
                      series={gaugeSeries}
                      type="radialBar"
                      width="100%"
                    />
                  </div>
                  <p className={`text-xl font-black uppercase tracking-tight mt-[-20px] ${risk.text}`}>
                    {risk.label}
                  </p>
                </div>

                {/* Action card */}
                <div className={`rounded-2xl border p-4 ${risk.bg} ${risk.border}`}>
                  <div className="flex gap-3">
                    {result.churn_prediction === "Yes" ? (
                      <MdWarning className={`h-6 w-6 shrink-0 ${risk.text}`} />
                    ) : (
                      <MdCheckCircle className={`h-6 w-6 shrink-0 ${risk.text}`} />
                    )}
                    <div>
                      <p className="text-sm font-bold text-navy-700 dark:text-white">
                        Hành động đề xuất:
                      </p>
                      <p className={`mt-1 text-xs leading-relaxed ${risk.text}`}>
                        {risk.action}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metric widgets */}
                <div className="grid grid-cols-2 gap-3">
                  <Widget
                    icon={<MdBarChart className="h-5 w-5" />}
                    title="Quyết định Churn"
                    subtitle={result.churn_prediction === "Yes" ? "Rời bỏ ⚠️" : "Ở lại ✅"}
                  />
                  <Widget
                    icon={<MdPercent className="h-5 w-5" />}
                    title="Xác suất rời mạng"
                    subtitle={`${(result.churn_probability * 100).toFixed(2)}%`}
                  />
                </div>
              </div>
            )}
          </div>

          {result && (
            <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3 text-xs text-gray-400 dark:border-white/10">
              <span>Model: LightGBM</span>
              <span>POST /api/predict</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ChurnPrediction;
