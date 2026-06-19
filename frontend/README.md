# Frontend – Customer Churn Prediction Dashboard

Giao diện Web Dashboard cho dự án **Customer Churn Prediction**, được xây dựng trên nền tảng [Horizon UI (React + Tailwind CSS)](https://horizon-ui.com/horizon-tailwind-react) và kết nối trực tiếp với **FastAPI Backend**.

---

## 🎯 Mục đích

Cung cấp một giao diện trực quan, tương tác để khám phá và phân tích bộ dữ liệu Customer Churn thông qua các biểu đồ động, thống kê mô tả và nhận xét tự động từ kết quả EDA đã nghiên cứu.

---

## 📁 Cấu trúc thư mục

```
frontend/
├── public/                      # Static files
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
│                   ├── OverviewCards.jsx       # Thẻ KPI tổng quan bộ dữ liệu
│                   ├── DescriptiveStats.jsx    # Bảng thống kê mô tả biến định lượng
│                   ├── UnivariateAnalysis.jsx  # Biểu đồ phân phối đơn biến (Histogram / Donut)
│                   └── BivariateAnalysis.jsx   # Heatmap tương quan & phân tích đa biến vs Churn
├── package.json
└── README.md
```

---

## 🌟 Tính năng EDA Dashboard (`/admin/eda`)

### 1. Overview Cards (Thẻ KPI)
- Hiển thị tổng quan nhanh: **số dòng, số cột, giá trị thiếu, dòng trùng lặp**.
- Dữ liệu lấy từ API: `GET /api/v1/eda/overview`

### 2. Descriptive Statistics (Thống kê Mô tả)
- Bảng chi tiết các chỉ số thống kê: **Mean, Min, Max, Q1, Q3, Skewness** cho các biến định lượng.
- Dữ liệu lấy từ API: `GET /api/v1/eda/numerical-stats`

### 3. Univariate Analysis (Phân tích Đơn biến)
- Dropdown chọn biến → tự động nhận diện loại biến:
  - **Biến định lượng** → Histogram (biểu đồ cột tần suất)
  - **Biến định tính** → Donut Chart (biểu đồ tròn)
- Kèm theo **Nhận xét tự động** từ phân tích EDA của notebook `trocungDucLevan.ipynb`.
- Dữ liệu lấy từ API: `GET /api/v1/eda/distribution/{column_name}`

### 4. Bivariate Analysis (Phân tích Đa biến)
- **Correlation Heatmap**: Ma trận tương quan Pearson giữa các đặc trưng định lượng.
- **So sánh vs Churn**: Dropdown chọn đặc trưng → biểu đồ Grouped Bar (định tính) hoặc Boxplot (định lượng) so sánh nhóm Churn = Yes vs No.
- Kèm theo **Nhận xét tự động** từ notebook EDA.
- Dữ liệu lấy từ API: `GET /api/v1/eda/correlation` và `GET /api/v1/eda/bivariate/{feature}`

---

## ⚙️ Thiết kế kỹ thuật

| Kỹ thuật | Chi tiết |
|---|---|
| **Framework** | React 18 + Tailwind CSS |
| **Template gốc** | Horizon UI (React Tailwind) |
| **Biểu đồ** | `react-apexcharts` |
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
