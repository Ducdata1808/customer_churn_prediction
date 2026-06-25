# 🖥️ Frontend – Customer Churn Prediction Dashboard

Giao diện Web Dashboard cho dự án **Customer Churn Prediction** được xây dựng trên nền tảng **Horizon UI (React + Tailwind CSS)** và kết nối trực tiếp với **FastAPI Backend** để hiển thị phân tích dữ liệu, chạy dự đoán và so sánh các mô hình học máy.

---

## 📁 Cấu trúc thư mục chi tiết

```text
frontend/
├── public/                      # Các tài nguyên tĩnh (images, favicon, manifest...)
├── src/
│   ├── assets/                  # CSS, font chữ và hình ảnh giao diện chính
│   ├── components/              # Các UI components dùng chung (Thẻ thông số, biểu đồ ApexCharts, lịch, widget...)
│   ├── layouts/                 # Giao diện khung layout (Admin Layout, Auth Layout)
│   ├── routes.js                # Khai báo cấu hình định tuyến và thanh Sidebar menu
│   ├── variables/               # Dữ liệu tĩnh hoặc các cấu hình màu sắc chung
│   ├── utils/
│   │   └── api.js               # Cấu hình Axios instance thiết lập kết nối base URL tới Backend API
│   │
│   └── views/                   # Các trang chức năng chính của Dashboard
│       └── admin/
│           ├── default/         # Dashboard tổng quan mặc định (mẫu template Horizon)
│           │
│           ├── eda/             # 🌟 Phân tích Khám phá Dữ liệu (EDA Dashboard)
│           │   ├── index.jsx    # Component cha gọi API và phân chia các tab phân tích
│           │   ├── EdaTabs.jsx  # Định nghĩa cấu trúc các Tabs hiển thị
│           │   └── components/  # Các component con chứa các đồ thị chuyên biệt
│           │       ├── OverviewCards.jsx       # Hiển thị thẻ KPI số dòng, số cột, missing values...
│           │       ├── DescriptiveStats.jsx    # Bảng số liệu thống kê mô tả 9 chỉ số
│           │       ├── UnivariateAnalysis.jsx  # Vẽ biểu đồ phân phối Histogram/Donut tự động theo loại cột
│           │       └── BivariateAnalysis.jsx   # Vẽ ma trận tương quan và biểu đồ so sánh Churn
│           │
│           ├── predict/         # 🔮 Tính năng Dự đoán Churn đơn lẻ
│           │   ├── index.jsx    # Trang chứa Form nhập dữ liệu khách hàng và gọi API dự báo
│           │   └── components/  # Component hỗ trợ nhập liệu hoặc hiển thị xác suất
│           │
│           └── comparison/      # ⚖️ Tính năng Huấn luyện & So sánh Mô hình
│               ├── index.jsx    # Thiết lập siêu tham số, kích hoạt huấn luyện và so sánh mô hình
│               └── components/  # Component biểu diễn ma trận nhầm lẫn (Confusion Matrix)
│
├── package.json                 # Khai báo thư viện phụ thuộc (React 19, Tailwind, ApexCharts, Axios...)
├── tailwind.config.js           # File cấu hình CSS Tailwind
└── README.md                    # Tài liệu hướng dẫn Frontend (File này)
```

---

## 🌟 Các Tính năng chính của Dashboard

### 1. Dashboard EDA (`/admin/eda`)
*   **Overview Cards:** Hiển thị nhanh các thông tin chất lượng dữ liệu bao gồm số lượng mẫu, trùng lặp và giá trị trống.
*   **Descriptive Statistics:** Bảng thông tin mô tả chi tiết cho các cột số (bao gồm cả các đặc trưng phái sinh mới được xây dựng).
*   **Phân phối đơn biến (Univariate):** Tự động nhận diện loại cột (số hay chữ) để vẽ đồ thị Histogram hay Donut tương ứng kèm theo các nhận xét phân tích (`insight`) tự động.
*   **Ma trận tương quan & Phân tích đa biến (Bivariate):** Biểu diễn ma trận hệ số tương quan Pearson dưới dạng Heatmap màu sắc sinh động, đồng thời hỗ trợ vẽ biểu đồ chồng so sánh tương tác giữa đặc trưng chọn với biến mục tiêu `Churn`.

### 2. Dự đoán Churn đơn lẻ (`/admin/predict`)
*   Cung cấp Form nhập liệu hoàn chỉnh chia làm 3 nhóm (Nhân khẩu học, Dịch vụ mạng, Thông tin tài chính).
*   Gửi yêu cầu dự đoán lên Backend và trả về kết quả nhị phân (Yes/No) dạng thẻ màu cảnh báo, kèm theo thước đo phần trăm xác suất rời bỏ (Probability Gauge).

### 3. Huấn luyện & So sánh mô hình (`/admin/comparison`)
*   Cho phép người dùng lựa chọn thuật toán (Logistic Regression, Random Forest, XGBoost, LightGBM) và tinh chỉnh các tham số (max_depth, n_estimators, learning_rate...).
*   Huấn luyện mô hình trực tiếp qua API và hiển thị kết quả đánh giá (Accuracy, Precision, Recall, F1, AUC), vẽ Ma trận nhầm lẫn (Confusion Matrix) và lưu trữ lịch sử so sánh hiệu suất giữa các mô hình đã chạy.
