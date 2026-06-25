# 🚀 FastAPI Backend – Hướng dẫn Vận hành & Tài liệu tích hợp API

Thư mục này chứa mã nguồn của Backend API dự án **Customer Churn Prediction** được xây dựng bằng **FastAPI** và chạy trên máy chủ **Uvicorn**.

---

## 📁 Cấu trúc thư mục chi tiết

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # Khởi chạy FastAPI, cấu hình CORS và đăng ký các router
│   ├── config.py                # Cấu hình các hằng số đường dẫn chung (models, data...)
│   │
│   ├── schemas/                 # Pydantic Schemas - Xác thực dữ liệu đầu vào và đầu ra
│   │   ├── __init__.py
│   │   ├── eda_schema.py        # Schema response cho các API phân tích EDA
│   │   ├── predict_schema.py    # Schema request/response cho API dự đoán Churn đơn lẻ
│   │   └── train_schema.py      # Schema request/response cho API huấn luyện nhanh mô hình
│   │
│   ├── routes/                  # API Endpoints (Định tuyến dịch vụ)
│   │   ├── __init__.py
│   │   ├── eda_route.py         # Routes cho phân tích EDA (Prefix: /api/v1/eda)
│   │   ├── predict_route.py     # Routes cho dự đoán Churn (Prefix: /api)
│   │   └── train_route.py       # Routes cho so sánh & huấn luyện (Prefix: /api/train)
│   │
│   ├── services/                # Business Logic (Xử lý nghiệp vụ chính)
│   │   ├── __init__.py
│   │   ├── eda_service.py       # Logic tính toán EDA, sanity checks, ma trận tương quan...
│   │   ├── predict_service.py   # Logic load model offline, tiền xử lý và suy luận dự đoán
│   │   └── train_service.py     # Logic lấy mẫu, chia tập, huấn luyện nhanh với GridSearchCV
│   │
│   └── ml_artifacts/            # Chứa file mô hình và preprocessor tốt nhất đã lưu sẵn
│       ├── model.joblib          # File mô hình học máy LightGBM
│       └── preprocessor.joblib   # Pipeline tiền xử lý của sklearn
│
├── data/                        # Dữ liệu phục vụ phân tích EDA và huấn luyện nhanh
│   └── train.csv
├── tests/                       # Unit tests cho các thành phần
│   ├── __init__.py
│   ├── test_eda.py
│   ├── test_predict.py
│   └── test_train.py
│
├── requirements.txt             # Khai báo các thư viện Python
└── README.md                    # Tài liệu hướng dẫn Backend (File này)
```

---

## 1. Hướng dẫn khởi chạy & Xem thử API trực quan (Swagger UI)

### 💻 Khởi chạy Server Backend
Đảm bảo bạn đã cài đặt các thư viện cần thiết trong file [requirements.txt](file:///c:/Users/Admin/Documents/viet_code/python/NMKHDL/customer_churn_prediction/requirements.txt):
```bash
pip install -r requirements.txt
```

Khởi chạy máy chủ phát triển cục bộ từ thư mục `backend/`:
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
*   **Địa chỉ Server:** `http://127.0.0.1:8000`
*   **Kiểm tra hoạt động:** Truy cập `http://127.0.0.1:8000/` (Trả về trạng thái hoạt động JSON thành công).

### 🔍 Cách kiểm tra và xem thử API trực quan
FastAPI tự động sinh tài liệu tương tác giúp chạy thử trực tiếp:
1. Mở trình duyệt và truy cập: **`http://127.0.0.1:8000/docs`**
2. Click vào API bất kỳ -> Chọn **Try it out** -> Nhập tham số nếu có -> Click **Execute** để xem kết quả trả về thực tế.

---

## 2. Tài liệu chi tiết các API (Endpoints) được tạo ra

### 📊 Nhóm 1: API Phân tích Khám phá Dữ liệu (EDA) – Tag: `Exploratory Data Analysis`
*Mọi response đều đi kèm một trường `"insight"` chứa nhận xét chuyên sâu từ EDA để Frontend hiển thị kèm biểu đồ.*

#### 1. `GET /api/v1/eda/overview` (Tổng quan tập dữ liệu)
*   **Chức năng:** Trả về số lượng mẫu, trùng lặp, missing values và vai trò của các biến (numerical, categorical, identifiers, target).
*   **Sử dụng ở Frontend:** Hiển thị thẻ KPI nhanh (Cards) và danh mục lọc tự động.

#### 2. `GET /api/v1/eda/sanity-check` (Kiểm tra chất lượng dữ liệu)
*   **Chức năng:** Rà soát lỗi logic toán học (tenure <= 0, MonthlyCharges <= 0) và kiểm tra mâu thuẫn hệ sinh thái (như không có internet nhưng vẫn đăng ký dịch vụ bảo mật).
*   **Sử dụng ở Frontend:** Bảng báo cáo Data Quality Audit.

#### 3. `GET /api/v1/eda/numerical-stats` (Thống kê mô tả các cột số)
*   **Chức năng:** Trả về 9 thông số thống kê (mean, min, max, variance, skewness, nunique, median, q1, q3) của tất cả cột định lượng (gốc và phái sinh).
*   **Sử dụng ở Frontend:** Bảng dữ liệu thống kê (Descriptive Data Table).

#### 4. `GET /api/v1/eda/distribution/numerical/{column_name}` (Phân phối cột số)
*   **Chức năng:** Trả về bins/counts cho Histogram và 5 chỉ số cho Boxplot (`min`, `q1`, `median`, `q3`, `max`).
*   **Tham số:** `column_name` (đường dẫn), `bins` (query, mặc định 15).

#### 5. `GET /api/v1/eda/distribution/categorical/{column_name}` (Phân phối cột phân loại)
*   **Chức năng:** Trả về danh sách nhãn, số lượng và tỷ lệ % phân phối lớp.
*   **Sử dụng ở Frontend:** Vẽ đồ thị Pie Chart hoặc Donut Chart.

#### 6. `GET /api/v1/eda/bivariate/{feature_name}` (Phân tích liên kết với Churn)
*   **Chức năng:** Trả về bảng chéo tần suất (nếu là cột phân loại) hoặc thống kê phân nhóm Churn = Yes/No kèm 5 chỉ số vẽ boxplot đôi (nếu là cột số).
*   **Sử dụng ở Frontend:** Stacked Bar Chart hoặc Side-by-side Boxplot.

#### 7. `GET /api/v1/eda/correlation` (Ma trận tương quan)
*   **Chức năng:** Trả về ma trận hệ số tương quan Pearson giữa tất cả các cột số.
*   **Sử dụng ở Frontend:** Biểu diễn đồ thị nhiệt Heatmap.

---

### 🔮 Nhóm 2: API Dự đoán Churn – Tag: `Dự đoán Churn`

#### 1. `POST /api/predict` (Dự báo Churn đơn lẻ)
*   **Chức năng:** Nhận thông tin hồ sơ của 1 khách hàng, đưa qua pipeline tiền xử lý (`preprocessor.joblib`) và mô hình (`model.joblib`) để đưa ra dự đoán Churn.
*   **Request Body (`CustomerInput`):** Chứa 19 trường thuộc tính khách hàng.
*   **Response Body (`PredictionResponse`):**
    *   `churn_prediction`: Nhãn dự đoán (`Yes` hoặc `No`).
    *   `churn_probability`: Xác suất rời bỏ (số thực từ `0.0` đến `1.0`).

#### 2. `GET /api/recent-logs` (Lấy lịch sử dự đoán)
*   **Chức năng:** Trả về lịch sử các lượt dự đoán gần đây đã được lưu trữ (phục vụ mục hiển thị logs ở Frontend).
*   **Tham số:** `limit` (query, mặc định 5).

---

### ⚖️ Nhóm 3: API Huấn luyện & So sánh mô hình – Tag: `Model Comparison`

#### 1. `GET /api/train/models` (Danh sách thuật toán hỗ trợ)
*   **Chức năng:** Trả về danh sách các thuật toán được hệ thống hỗ trợ huấn luyện nhanh kèm tham số mặc định của chúng.

#### 2. `POST /api/train` (Huấn luyện nhanh & Đánh giá)
*   **Chức năng:** Lấy mẫu dữ liệu theo yêu cầu, chia tập train/val, thực hiện huấn luyện nhanh thuật toán được chọn và đánh giá metrics.
*   **Request Body (`TrainRequest`):**
    *   `model_type`: Tên thuật toán (`logistic_regression`, `decision_tree`, `random_forest`, `xgboost`, `lightgbm`).
    *   `hyperparameters`: Dictionary các siêu tham số.
    *   `test_size`: Tỷ lệ tập kiểm thử (mặc định 0.2).
    *   `sample_size`: Số dòng lấy mẫu huấn luyện nhanh (tối đa 50000).
*   **Response Body (`TrainResponse`):**
    *   `model_type`, `accuracy`, `precision`, `recall`, `f1_score`, `roc_auc`.
    *   `confusion_matrix`: Mảng 2 chiều đại diện cho Confusion Matrix `[[TN, FP], [FN, TP]]`.
    *   `training_time_seconds`: Thời gian huấn luyện.

