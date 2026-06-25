# Tài liệu Thư mục EDA (Exploratory Data Analysis)

Thư mục này chứa toàn bộ tài nguyên, Jupyter Notebook và các script bổ trợ liên quan đến quá trình Phân tích Khám phá Dữ liệu (EDA) và thiết kế đặc trưng (Feature Engineering) cho dự án dự đoán rời bỏ dịch vụ của khách hàng (Customer Churn).

---

## Danh sách các tệp tin và mô tả chi tiết

### 1. [notebook.ipynb](file:///c:/Users/Admin/Documents/viet_code/python/NMKHDL/customer_churn_prediction/EDA/notebook.ipynb)
- **Mô tả:** Đây là tệp Jupyter Notebook chính thực hiện toàn bộ nghiên cứu và phân tích sâu của dự án.
- **Nội dung chính:**
  - Thiết lập môi trường làm việc, import thư viện và cấu hình đồ thị.
  - Phân tích đơn biến (Univariate Analysis) và phân tích song biến (Bivariate Analysis) để tìm kiếm các mối liên hệ của các thuộc tính đến tỷ lệ rời bỏ dịch vụ.
  - Kiểm tra chất lượng dữ liệu (Data Quality Check) và xử lý ngoại lai (Outliers).
  - Phác thảo 10 đặc trưng phái sinh mới nâng cấp chất lượng phân tích (Feature Engineering).
  - Tính toán mức độ tương quan thông qua các hệ số tương quan Pearson, Spearman và hệ số Cramer's V cho biến phân loại.
  - Sàng lọc đa cộng tuyến và lượng hóa sức mạnh phân tách để xuất bộ Model Schema chuẩn.

### 2. [export_eda_charts.py](file:///c:/Users/Admin/Documents/viet_code/python/NMKHDL/customer_churn_prediction/EDA/export_eda_charts.py)
- **Mô tả:** Script Python tự động hóa việc xuất tất cả các biểu đồ phân tích thống kê chuyên sâu từ dữ liệu EDA ra tệp hình ảnh PNG tĩnh.
- **Mục đích:** Cung cấp tài nguyên hình ảnh chất lượng cao phục vụ việc lưu trữ, viết báo cáo PDF hoặc tích hợp hiển thị tĩnh vào dashboard.

### 3. [extract_notebook_images.py](file:///c:/Users/Admin/Documents/viet_code/python/NMKHDL/customer_churn_prediction/EDA/extract_notebook_images.py)
- **Mô tả:** Tiện ích nhỏ giúp đọc tệp JSON của `notebook.ipynb`, tìm các kết quả đầu ra chứa hình ảnh được đính kèm trực tiếp trong Notebook và trích xuất chúng thành các file ảnh PNG riêng biệt.

### 4. [generate_boxplot.py](file:///c:/Users/Admin/Documents/viet_code/python/NMKHDL/customer_churn_prediction/EDA/generate_boxplot.py)
- **Mô tả:** Script chuyên biệt dùng để sinh các biểu đồ hộp (Box plots) cho các thuộc tính số (như `tenure`, `MonthlyCharges`, `TotalCharges`).
- **Mục đích:** Phát hiện trực quan các giá trị ngoại lai (outliers) và khảo sát độ phân tán dữ liệu theo nhóm khách hàng rời đi hoặc ở lại.

### 5. [generate_overview_stats_charts.py](file:///c:/Users/Admin/Documents/viet_code/python/NMKHDL/customer_churn_prediction/EDA/generate_overview_stats_charts.py)
- **Mô tả:** Script sinh các biểu đồ phân phối và thống kê tổng quan (phân phối biến mục tiêu Churn, tỷ lệ dữ liệu khuyết thiếu, các biểu đồ cột đơn giản của các thuộc tính định tính).

---

## Hướng dẫn chạy các Script
Để chạy các script sinh biểu đồ trong thư mục này, đảm bảo bạn đã cài đặt các thư viện được yêu cầu trong `requirements.txt` và đã kích hoạt môi trường ảo Python:

```bash
# Kích hoạt môi trường ảo (Windows)
venv\Scripts\activate

# Di chuyển vào thư mục EDA
cd EDA

# Chạy script xuất biểu đồ
python export_eda_charts.py
```
Các ảnh biểu đồ kết quả sẽ được tạo trực tiếp tại thư mục đầu ra được thiết lập trong mã nguồn (ví dụ: thư mục `images/` hoặc `reports/`).
