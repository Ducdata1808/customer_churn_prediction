# Frontend – Customer Churn Prediction Dashboard

Giao diện Web Dashboard cho dự án **Customer Churn Prediction**, được xây dựng trên nền tảng [Horizon UI (React + Tailwind CSS)](https://horizon-ui.com/horizon-tailwind-react) và kết nối trực tiếp với **FastAPI Backend**.

---

## 🎯 Mục đích

Cung cấp một giao diện trực quan, tương tác để khám phá và phân tích bộ dữ liệu Customer Churn thông qua các biểu đồ động, thống kê mô tả và nhận xét tự động từ kết quả EDA đã nghiên cứu.

---

## 📁 Cấu trúc thư mục

```
frontend/
├── public/
│   └── eda_charts/              # 16 biểu đồ PNG trích xuất từ notebook trocungDucLevan.ipynb
│       ├── chart_00.png ~ chart_15.png
│       └── manifest.json        # Metadata (tiêu đề, nhận xét) cho từng biểu đồ
├── src/
│   ├── components/              # Các component UI dùng chung (Widget, Calendar, Charts...)
│   ├── routes.js                # Định nghĩa toàn bộ đường dẫn của ứng dụng
│   ├── utils/
│   │   └── api.js               # Axios instance – cấu hình base URL kết nối Backend
│   └── views/
│       └── admin/
│           ├── default/         # Dashboard tổng quan mặc định (Horizon UI template)
│           └── eda/             # 🌟 EDA Dashboard – Tính năng chính của dự án
│               ├── index.jsx    # Orchestrator: fetch dữ liệu và phân phối xuống component con
│               └── components/
│                   ├── OverviewCards.jsx             # Thẻ KPI tổng quan bộ dữ liệu
│                   ├── ChurnDistribution.jsx         # Donut chart phân bố Churn Yes/No
│                   ├── DescriptiveStats.jsx          # Bảng thống kê mô tả biến định lượng
│                   ├── NotebookCharts.jsx            # 16 biểu đồ thực từ notebook EDA
│                   ├── UnivariateAnalysis.jsx        # Biểu đồ phân phối đơn biến (Histogram / Donut)
│                   ├── BivariateAnalysis.jsx         # Heatmap tương quan & phân tích đa biến vs Churn
│                   └── FeatureEngineeringSummary.jsx # Tóm tắt Feature Engineering & Risk Flags
├── package.json
└── README.md
```

---

## 🌟 Tính năng EDA Dashboard (`/admin/eda`) – v2.0

### 1. Overview Cards (Thẻ KPI)
- Hiển thị tổng quan nhanh: **số dòng, số cột, giá trị thiếu, dòng trùng lặp**.
- Nhận xét kiểm định dữ liệu (Sanity Check) từ Mục 3 notebook.
- Dữ liệu lấy từ API: `GET /api/v1/eda/overview`

### 2. Churn Distribution (Phân bố Biến mục tiêu)
- **Donut Chart** tỷ lệ Churn Yes (22.5%) / No (77.5%).
- Thẻ thống kê số lượng khách hàng từng nhóm + tỷ lệ mất cân bằng 3.5:1.
- Dữ liệu lấy từ API: `GET /api/v1/eda/distribution/categorical/Churn`

### 3. Descriptive Statistics (Thống kê Mô tả)
- Bảng chi tiết: **Mean, Min, Max, Q1, Q3, Skewness** cho các biến định lượng.
- Nhận xét phân phối Bimodal (tenure), Right-skewed (TotalCharges).
- Dữ liệu lấy từ API: `GET /api/v1/eda/numerical-stats`

### 4. Phân tích Khám phá Dữ liệu – 16 Biểu đồ từ Notebook ⭐ MỚI
- Hiển thị **16 biểu đồ matplotlib/seaborn** được trích xuất trực tiếp từ `trocungDucLevan.ipynb`.
- Được nhóm thành 4 section với bộ lọc tab:
  - 📊 **Phân tích Đơn biến** (3 biểu đồ): Histogram, Categorical Distribution, Churn Target
  - 🔍 **Phân tích Song biến** (4 biểu đồ): KDE vs Churn, Risk Gap, Service Retention
  - ⚙️ **Feature Engineering** (5 biểu đồ): Risk Matrix Heatmap, Financial Ratios, Security Score, Risk Flags, Demographics
  - 🔗 **Tương quan Toàn cục** (4 biểu đồ): Pearson, Spearman, Cramér's V, Feature Ranking
- **Click vào biểu đồ** → Modal phóng to kèm nhận xét chi tiết đầy đủ từ notebook.
- Ảnh được lưu tại `public/eda_charts/`, không phụ thuộc Backend.

### 5. Univariate Analysis (Phân tích Đơn biến – Tương tác)
- Dropdown chọn biến → tự động nhận diện loại biến:
  - **Biến định lượng** → Histogram (ApexCharts)
  - **Biến định tính** → Donut Chart (ApexCharts)
- Kèm **Nhận xét tự động** từ notebook EDA.
- Dữ liệu lấy từ API: `GET /api/v1/eda/distribution/{type}/{column_name}`

### 6. Bivariate & Correlation Analysis (Phân tích Đa biến)
- **Correlation Heatmap**: Ma trận tương quan Pearson giữa các đặc trưng định lượng và phái sinh.
- **So sánh vs Churn**: Dropdown → Grouped Bar (định tính) hoặc Boxplot (định lượng).
- **Bảng Điểm chính**: 6 thẻ nhận xét nhanh về Contract, PaymentMethod, InternetService, SeniorCitizen, Gender, Streaming.
- Dữ liệu lấy từ API: `GET /api/v1/eda/correlation` và `GET /api/v1/eda/bivariate/{feature}`

### 7. Feature Engineering & Risk Analysis (Phân tích Rủi ro)
- **4 thẻ Cờ rủi ro hành vi**: composite_risk_profile (55%), zero_supportive_service (52.7%), manual_payment (34%), security_score.
- **2 biểu đồ Bar Chart** tương tác: Tỷ lệ Churn theo `loyalty_tier` và `charge_segment`.
- **Bảng 3 cột** nhận xét Ma trận Rủi ro (Onboarding+Premium=77.4%, Loyal+Budget=0.4%).
- Dữ liệu lấy từ API: `GET /api/v1/eda/bivariate/loyalty_tier` và `GET /api/v1/eda/bivariate/charge_segment`

---

## ⚙️ Thiết kế kỹ thuật

| Kỹ thuật | Chi tiết |
|---|---|
| **Framework** | React 18 + Tailwind CSS |
| **Template gốc** | Horizon UI (React Tailwind) |
| **Biểu đồ tương tác** | `react-apexcharts` |
| **Biểu đồ notebook** | PNG trích xuất từ `.ipynb` (base64 decode) |
| **HTTP Client** | `axios` – cấu hình tập trung tại `src/utils/api.js` |
| **State Management** | React Hooks (`useState`, `useEffect`) |
| **Tránh memory leak** | `AbortController` trong mọi `useEffect` |
| **Props Lifting** | `index.jsx` fetch `overview` 1 lần, truyền xuống các component con |

---

## 🚀 Hướng dẫn chạy

### Yêu cầu
- Node.js (LTS version)
- Backend FastAPI đang chạy tại cổng `8000`

### Các bước

```bash
# 1. Cài đặt thư viện (chỉ cần chạy lần đầu)
npm install

# 2. Khởi động môi trường development
npm start
```

Ứng dụng sẽ mở tại: **http://localhost:3000**

Truy cập EDA Dashboard tại: **http://localhost:3000/admin/eda**

---

## 🔗 Kết nối Backend API

File cấu hình: `src/utils/api.js`

```js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
});

export default api;
```

Để thay đổi địa chỉ Backend, tạo file `.env` trong thư mục `frontend/`:

```
REACT_APP_API_URL=http://your-backend-url:8000
```

---

## 📦 Dependencies chính

| Package | Mục đích |
|---|---|
| `react` | Core framework |
| `react-apexcharts` | Vẽ biểu đồ tương tác |
| `axios` | HTTP requests đến Backend API |
| `react-icons` | Icon library |
| `tailwindcss` | CSS utility framework |

---

## 🏷️ Giấy phép giao diện gốc

Giao diện này được xây dựng dựa trên template mã nguồn mở [Horizon UI (React Tailwind CSS)](https://horizon-ui.com/horizon-tailwind-react) được cấp phép theo [MIT License](https://www.simmmple.com/licenses).
