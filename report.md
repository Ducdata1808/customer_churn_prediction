# BÁO CÁO DỰ ÁN
## Dự đoán Khách hàng Rời bỏ Dịch vụ (Customer Churn Prediction)

**Môn học:** Nhập môn Khoa học Dữ liệu (Intro2DS)
**Nguồn dữ liệu:** [Kaggle Playground Series S6E3](https://www.kaggle.com/competitions/playground-series-s6e3)  
**Nhóm:** 14
**Năm học:** 2025–2026

---

## Thành viên nhóm 14

| STT | Họ và tên | MSSV | Vai trò |
|-----|-----------|------|---------|
| 1 | Nguyễn Lan Anh | 24280006 | Thành viên |
| 2 | **Lê Văn Đức** | **24280010** | **Trưởng nhóm** |
| 3 | Trần Quang Huy | 24280015 | Thành viên |
| 4 | Phạm Tiến Phát | 24280018 | Thành viên |
| 5 | Hoàng Gia Bảo | 24280049 | Thành viên |
| 6 | Đặng Hoàng Khang | 24280076 | Thành viên |
| 7 | Nguyễn Tiến Phát | 24280093 | Thành viên |

---

## Mục lục

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Mô tả dữ liệu](#2-mô-tả-dữ-liệu)
3. [Phân tích khám phá dữ liệu (EDA)](#3-phân-tích-khám-phá-dữ-liệu-eda)
4. [Kỹ thuật đặc trưng (Feature Engineering)](#4-kỹ-thuật-đặc-trưng-feature-engineering)
5. [Xây dựng Pipeline Machine Learning](#5-xây-dựng-pipeline-machine-learning)
6. [Kết quả mô hình](#6-kết-quả-mô-hình)
7. [Kết luận và hướng phát triển](#7-kết-luận-và-hướng-phát-triển)

---

## 1. Tổng quan dự án

### 1.1. Bối cảnh

Đối với lĩnh vực viễn thông và dịch vụ số nói chung, việc giữ chân khách hàng có ý nghĩa chiến lược quan trọng, khi chi phí bỏ ra để thu hút khách hàng mới thường cao gấp nhiều lần so với chi phí giữ chân khách hàng hiện tại. Dự án **Customer Churn Prediction** xây dựng một hệ thống học máy **Machine Learning** nhằm dự báo khả năng khách hàng rời bỏ dịch vụ nhằm hỗ trợ doanh nghiệp kịp thời khi xuất hiện rủi ro rời bỏ dịch vụ.

### 1.2. Mục tiêu

- **Phân tích khám phá dữ liệu (EDA):** Khảo sát chất lượng dữ liệu, phân phối các đặc trưng và động cơ rời bỏ của khách hàng — thông qua các khảo sát sơ bộ để đưa ra các quyết định cụ thể về encoding, sampling.
- **Kỹ thuật đặc trưng:** Biến đổi dữ liệu thô thành không gian vector tinh gọn, giảm đa cộng tuyến và tăng mật độ thông tin cho các mô hình.
- **Xây dựng pipeline MLOps:** Triển khai quy trình tự động hóa 6 giai đoạn từ thu thập dữ liệu đến dự đoán, đảm bảo khả năng vận hành end-to-end hoặc từng stage riêng lẻ.
- **Huấn luyện và đánh giá mô hình:** So sánh LightGBM và XGBoost qua GridSearchCV, chọn mô hình tốt nhất dựa trên ROC AUC và theo dõi bằng MLflow.

### 1.3. Phạm vi dự án

| Hạng mục | Chi tiết |
|----------|----------|
| Tập huấn luyện | 594.194 mẫu, 21 cột |
| Tập kiểm tra (Kaggle) | 254.655 mẫu |
| Số đặc trưng sau xử lý | 23 features |
| Thuật toán | LightGBM, XGBoost |
| Metric chính | ROC AUC, F1-Score |

### 1.4. Phương pháp tiếp cận

Dự án được triển khai theo luồng **EDA → Feature Engineering → Pipeline → Modeling**, trong đó mỗi insight từ EDA đều dẫn đến những quyết định kỹ thuật cụ thể:

| Giai đoạn | Vấn đề cần giải quyết | Kết quả đầu ra |
|-----------|-----------------|--------|
| Data Quality | Tính nhất quán và toàn vẹn dữ liệu | Quy tắc lọc dòng, loại bỏ biến nhiễu |
| Univariate | Quan sát, đánh giá phân phối và sự mất cân bằng biến mục tiêu | Stratified split, SMOTE |
| Bivariate | Khảo sát ảnh hưởng các đặc trưng lên biến mục tiêu | Các đặc trưng Kỹ thuật hóa |
| Correlation | Khảo sát mức độ ảnh hưởng và rà soát đa cộng tuyến giữa các đặc trưng | Tinh gọn không gian vector |
| Pipeline | Tái lập quy trình huấn luyện và đánh giá mô hình | Các stage tự động, artifact chuẩn hóa |
| Modeling | Đánh giá hiệu năng của các mô hình | Mô hình tốt nhất, được ưu tiên sử dụng cho quá trình mô phỏng sau này |

---

## 2. Mô tả dữ liệu

### 2.1. Nguồn dữ liệu

Dữ liệu được lấy từ cuộc thi **Kaggle Playground Series Season 6 Episode 3**, mô phỏng bài toán dự đoán churn của một nhà cung cấp dịch vụ viễn thông/Internet.

### 2.2. Cấu trúc đặc trưng

Dữ liệu gồm **21 cột**, được phân loại như sau:

| Nhóm | Số lượng | Ví dụ |
|------|----------|-------|
| Định danh | 1 | `id` |
| Định lượng | 3 | `tenure`, `MonthlyCharges`, `TotalCharges` |
| Định tính | 16 | `Contract`, `InternetService`, `PaymentMethod`, ... |
| Mục tiêu | 1 | `Churn` (Yes/No) |

**Các đặc trưng gốc:**

| Cột | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | int64 | Mã định danh của khách hàng |
| `gender` | object | Giới tính |
| `SeniorCitizen` | int64 | Khách hàng có là người cao tuổi **$\geqslant 65$ tuổi**? (*1*: *Có*, *0*: *Không*)|
| `Partner` | object | Khách hàng có sống chung với vợ/chồng?|
| `Dependents` | object | Khách hàng có cần được chăm sóc?|
| `tenure` | int64 | `Thời gian sử dụng dịch vụ`: Thời gian khách hàng đã gắn bó và sử dụng dịch vụ, tính theo tháng|
| `PhoneService` | object | Khách hàng có đăng ký dịch vụ điện thoại?|
| `MultipleLines` | object | Khách hàng có sử dụng nhiều đường dây điện thoại cùng lúc?|
| `InternetService` | object | Loại dịch vụ Internet mà khách hàng đang dùng|
| `OnlineSecurity` | object | Khách hàng có đăng ký gói bảo mật mạng trực tuyến?|
| `OnlineBackup` | object | Khách hàng có đăng ký gói sao lưu dữ liệu đám mây?|
| `DeviceProtection` | object | Khách hàng có mua gói bảo vệ thiết bị?|
| `TechSupport` | object | Khách hàng có đăng ký dịch vụ hỗ trợ kỹ thuật?|
| `StreamingTV` | object | Khách hàng có sử dụng Internet để xem truyền hình?|
| `StreamingMovies` | object | Khách hàng có sử dụng Internet để xem phim trực tuyến?|
| `Contract`| object | Loại hợp đồng thanh toán khách hàng đã ký?|
| `PaperlessBilling` | object | Khách hàng có nhận hóa đơn điện tử?|
| `PaymentMethod` | object | Phương thức thanh toán|
| `MonthlyCharges` | float64 | `Cước phí theo tháng`, ghi nhận vào tháng cuối cùng khảo sát được|
| `TotalCharges` | float64 | `Tổng cước phí`, ghi nhận trong suốt quá trình khảo sát|
| `Churn` | object | `Biến mục tiêu (Target)`: Đến thời điểm kết thúc khảo sát, khách hàng có rời bỏ dịch vụ không?|

### 2.3. Tiền xử lý dữ liệu

Quá trình làm sạch dữ liệu trong notebook EDA và pipeline tuân theo nguyên tắc bảo đảm tính toàn vẹn dữ liệu:

1. **Chuyển đổi kiểu dữ liệu:** `TotalCharges` được ép sang kiểu số thực vì file gốc có thể chứa khoảng trắng hoặc giá trị không hợp lệ.
2. **Chuẩn hóa nhãn:** `SeniorCitizen` chuyển từ 0/1 sang Yes/No để đồng nhất với các biến nhị phân khác trong quá trình phân tích; khi huấn luyện mô hình sẽ map lại về 0/1.
3. **Kiểm tra logic nghiệp vụ:** Không phát hiện mâu thuẫn giữa `InternetService = No` và các dịch vụ phụ thuộc Internet hiển thị *Yes* — dữ liệu nhất quán về mặt nghiệp vụ.
4. **Xử lí dữ liệu lỗi:** Loại bỏ các khách hàng ma **không dùng cả Internet lẫn điện thoại** `InternetService = No` AND `PhoneService = No`, vì sự thiếu trực quan trong khả năng phản ánh hành vi tiêu dùng của khách hàng.

### 2.4. Ý nghĩa nghiệp vụ

Mỗi bản ghi tương ứng với một hồ sơ khách hàng đăng kí sử dụng dịch vụ viễn thông, với các thông tin cơ bản về:

- **Cam kết hợp đồng** (`Contract`): ràng buộc pháp lý và thời hạn gắn bó.
- **Hạ tầng dịch vụ** (`InternetService`, `PhoneService`, các gói bổ trợ): các dịch vụ được sử dụng tương ứng.
- **Hành vi thanh toán** (`PaymentMethod`, `PaperlessBilling`): phương thức và hình thức thanh toán.
- **Bối cảnh cá nhân** (`SeniorCitizen`, `Partner`, `Dependents`): hồ sơ nhân khẩu học của khách hàng bao gồm độ tuổi, tình trạng hôn nhân và tình hình phụ thuộc tài chính.
- **Chi phí** (`MonthlyCharges`, `TotalCharges`, `tenure`): áp lực tài chính của khách hàng, được thể hiện thông qua các mức phí theo tháng, tổng cước phí và thời gian sử dụng dịch vụ.

Biến mục tiêu `Churn` trả lời câu hỏi *Khách hàng này có rời bỏ dịch vụ trong kỳ quan sát không?*

---

## 3. Phân tích khám phá dữ liệu (EDA)

Các insight từ bước này sẽ cho ta góc nhìn trực quan để đưa ra các quyết định kỹ thuật ở các bước sau, có thể kể đến như chiến lược mã hóa, metric đánh giá, feature selection và feature engineering. Các bước encoding, SMOTE và stratified sampling sẽ không được thực hiện trong notebook EDA mà sẽ được quản lý tập trung trong pipeline.

### 3.1. Kiểm định chất lượng dữ liệu (Data Quality Assessment)

#### 3.1.1. Biến định lượng

**Note:** Mục tiêu là kiểm chứng tính hợp lệ toán học và logic nghiệp vụ — `tenure` phải là số nguyên dương, `MonthlyCharges` và `TotalCharges` không âm.

| Các trường hợp kiểm tra logic nghiệp vụ | Số lỗi phát hiện tương ứng |
|:---|:---:|
| **Số tháng sử dụng dịch vụ không nguyên dương** | 0 |
| **Giá cước hàng tháng không dương** | 0 |
| **Tổng cước không dương** | 0 |

**Nhận xét:** Kết quả đồng loạt bằng **0** lỗi logic chứng minh các biến định lượng hoàn toàn hợp lệ. Vì vậy, **không** ép kiểu, xóa dòng lỗi hay imputation trước khi phân tích. Quá trình Feature Engineering sau đó cũng được thiết kế để tránh `ZeroDivisionError` và giá trị `Inf`.

![Boxplot biến định lượng](eda/eda_numeric_boxplot.png)

Qua Boxplot và kiểm định chéo: `tenure`, `MonthlyCharges`, `TotalCharges` **không có outlier bất thường** — các thao tác imputation, dropping hay capping được **lược bỏ hoàn toàn**.

#### 3.1.2. Biến định tính

**Note:** Rà soát nhất quán nhãn và logic phân lớp giữa dịch vụ cốt lõi và dịch vụ bổ trợ.

| Các trường hợp kiểm tra logic nghiệp vụ | Số lỗi phát hiện tương ứng |
|:---|:---:|
| **Sử dụng dịch vụ Internet nhưng không có Internet** | 0 |
| **Sử dụng Internet nhưng không có dịch vụ Internet** | 0 |
| **Sử dụng dịch vụ điện thoại nhưng không có điện thoại** | 0 |
| **Sử dụng điện thoại nhưng không có dịch vụ điện thoại** | 0 |
| **Không đăng ký bất kỳ dịch vụ nào** | **7** |

Phát hiện **7 khách hàng** có `PhoneService = No` **đồng thời** `InternetService = No` — hợp đồng không sử dụng bất kì hạ tầng kết nối cơ bản nào, là lỗi logic trong quá trình nhập liệu. Sau khi loại bỏ hoàn toàn 7 quan sát này (594.194 → **594.187** dòng), tập dữ liệu đã được đồng bộ logic tuyệt đối. Sự trùng khớp giữa nhóm *No internet service / No phone service* với trạng thái dịch vụ tạo điều kiện thuận lợi cho One-Hot Encoding, tránh các nhiễu nội tại khi phân tích chuyên sâu hơn.

### 3.2. Phân tích đơn biến — Biến định lượng

![Phân phối biến định lượng](eda/eda_numeric_hist.png)

**Nhận xét về phân phối:**

- **`tenure`:** Phân phối **hai đỉnh (Bimodal)** — khách hàng tập trung phần lớn ở nhóm bắt đầu tiếp xúc với dịch vụ (< **6** tháng) và nhóm khách hàng gắn bó lâu dài (≥ **60** tháng); giữa hai đỉnh phân bố tương đối đồng đều.
- **`MonthlyCharges`:** Mật độ khách hàng rất cao ở mức phí thấp; phần còn lại trải từ **40$** đến **115$** với các đỉnh nhỏ, không có mức cước áp đảo.
- **`TotalCharges`:** **Lệch phải mạnh** — đa số tập trung **0–2.000$**, đuôi kéo đến hơn **8.000$**, phân bố này khá hợp lý khi nhóm khách hàng mới và nhóm khách hàng sử dụng gói cơ bản chiếm tỷ trọng lớn.

**Kết luận:**

- `tenure` nên được chia theo thời gian gắn bó (khách mới 1–6 tháng / tiêu chuẩn 7–48 tháng / lâu năm > 48 tháng) — ưu tiên **Ordinal Encoding** để giữ tính thứ bậc của biến này.
- `MonthlyCharges` và `TotalCharges` chênh lệch biên độ lớn → cần chuẩn hóa (**StandardScaler / Min-Max**) khi áp dụng các mô hình nhạy với khoảng cách.
- `TotalCharges` lệch phải nhưng không có outlier bất thường trên Boxplot — thực hiện kiểm tra tính đa cộng tuyến với các đặc trưng định lượng khác, loại bỏ nếu cần thiết.



### 3.3. Phân tích đơn biến — Biến định tính

![Phân phối biến định tính](eda/eda_categorical_dist.png)

**Nhận xét:**

- Đa số đặc trưng mang **2–3** nhãn; `PaymentMethod` mang nhiều nhãn nhất cũng có độ phân hóa thấp với chỉ **4** giá trị.
- Không xuất hiện **Rare Labels** — nhóm nhỏ nhất chiếm **6,1%** (`No phone service` trong `PhoneService` và `MultipleLines`).
- **`PhoneService`:** *Yes* chiếm **93,89%**, mất cân bằng lớn, tính phân hóa thấp, khả năng gây nhiễu cao.
- Các dịch vụ Internet có nhóm *No internet service* cố định **23,7%**; `MultipleLines` có *No phone service* **6,1%**. Ta **không gộp** các nhãn này với *No*, vì đây là các nhóm quan trọng, mang lại nhiều thông tin trong quá trình phân tích.

**Kết luận:**

- Có thể áp dụng **One-Hot Encoding** đồng loạt vì số nhãn thấp, không tiềm ẩn rủi ro bùng nổ chiều dữ liệu.
- `PhoneService` mang tính nhiễu, kỳ vọng đóng góp dự báo ở mức thấp.

### 3.4. Phân tích đơn biến — Biến mục tiêu `Churn`

![Phân phối biến mục tiêu Churn](eda/eda_churn_distribution.png)

**Nhận xét:** Dữ liệu mất cân bằng ở mức vừa phải, tỷ lệ **3,5 : 1** — *Tiếp tục sử dụng* **77,5%**, *Rời bỏ* **22,5%**.

**Định hướng:**

- Thực hiện **Stratified Sampling** khi chia tập huấn luyện — giữ tỷ lệ **22,5%** churn trên mọi fold.
- Sử dụng các metric **F1-Score**, **Precision-Recall AUC** và **ROC-AUC** thay vì Accuracy.
- Cân bằng lớp: **SMOTE** trên tập huấn luyện; có thể dùng `scale_pos_weight` với XGBoost.



### 3.5. Phân tích song biến — Biến định lượng vs `Churn`

**Note:** Trực quan hóa bằng Histplot/KDE và Boxplot để phát hiện điểm gãy phân phối và ngưỡng giá trị.
![Biến định lượng theo Churn](eda/eda_numeric_vs_churn.png)

**Nhận xét:**

- **`tenure`:** Nhóm *Rời bỏ dịch vụ* tập trung ở khoảng **1–6 tháng** đầu; nhóm *Tiếp tục sử dụng dịch vụ* chiếm ưu thế khi thời gian sử dụng dịch vụ trên **48** tháng. Trung vị tenure nhóm rời đi khá thấp với khoảng **10** tháng.
- **`MonthlyCharges`:** Nhóm *Tiếp tục sử dụng dịch vụ* có mật độ cao ở **~20$**; nhóm *Rời bỏ* tập trung phân khúc cao **70$–105$**. Trung vị cước nhóm rời đi cao hơn hẳn so với nhóm tiếp tục sử dụng dịch vụ, cho thấy **nhóm khách hàng sử dụng dịch vụ với chi phí cao** có xu hướng **rời bỏ dịch vụ**.
- **`TotalCharges`:** Cả hai nhóm đều có phân phối lệch phải; tuy nhiên nhóm rời đi tập trung chiếm phần **áp đảo** ở mốc **~0$**, điều này khá hợp lý khi họ hủy hợp đồng sớm, tổng chi phí tích lũy chưa cao.



### 3.6. Phân tích song biến — Risk Spread (biến định tính)

**Note:** Đánh giá **Risk Spread** giữa nhãn rủi ro cao nhất và thấp nhất trong cùng một đặc trưng.

![Risk Spread — top 6 đặc trưng](eda/eda_risk_spread_top6.png)

**Nhận xét — các đặc trưng phân hóa mạnh:**

| Đặc trưng | Risk Spread | Chi tiết |
|-----------|-------------|----------|
| `PaymentMethod` | **41,97%** | *Electronic check* **48,91%** vs *Credit card automatic* **6,93%** |
| `Contract` | **41,06%** | *Month-to-month* **42,05%** vs *Two year* **1,00%** |
| `InternetService` | **40,11%** | *Fiber optic* **41,54%** vs *No internet* **1,4%** |
| `OnlineSecurity`, `TechSupport` | > **40%** | Không đăng ký → churn > **40%**; có dịch vụ → < **10%** |
| `SeniorCitizen` | **31,05%** | *Yes* **50,03%** (quy mô nhỏ **11,41%**) |

**Nhóm nhiễu (Risk Spread < 10%):** `gender` chỉ **0,57%**; `PhoneService`, `MultipleLines` có mức phân hóa rất thấp.



### 3.7. Tỷ lệ rời bỏ dự kiến — Toxic traits

**Note:** Chuyển tiếp từ quan sát Risk Spread sang **Churn Rate** theo phân khúc để nhận diện **đặc điểm hành vi độc hại (Toxic traits)**.

| Đặc trưng | Ý nghĩa đặc trưng | Giá trị mang rủi ro cao nhất | Quy mô tệp KH rủi ro | Tỷ lệ rời bỏ nhóm rủi ro | Tỷ lệ rời bỏ dự kiến |
|:---|:---|:---:|:---:|:---:|:---:|
| **PhoneService** | Dịch vụ điện thoại | Yes | 93.89% | 22.89% | 21.49% |
| **Contract** | Loại hợp đồng | Month-to-month | 50.31% | 42.05% | 21.16% |
| **Dependents** | Tiêu chí người chăm sóc | No | 69.74% | 29.14% | 20.32% |
| **OnlineSecurity** | Dịch vụ bảo mật trực tuyến | No | 48.72% | 40.61% | 19.79% |
| **PaperlessBilling** | Dịch vụ hóa đơn điện tử | Yes | 61.53% | 31.94% | 19.65% |
| **TechSupport** | Dịch vụ hỗ trợ kỹ thuật | No | 48.57% | 40.16% | 19.50% |
| **InternetService** | Loại dịch vụ Internet | Fiber optic | 45.84% | 41.54% | 19.04% |
| **PaymentMethod** | Phương thức thanh toán | Electronic check | 36.25% | 48.91% | 17.73% |
| **SeniorCitizen** | Tiêu chí người cao tuổi | No | 88.59% | 18.98% | 16.81% |
| **OnlineBackup** | Dịch vụ sao lưu trực tuyến | No | 42.09% | 39.10% | 16.46% |

**Nhận xét:**

- `SeniorCitizen = Yes` có tỷ lệ rời bỏ dịch vụ đạt **50%** nhưng quy mô chỉ **11,41%** nên không lọt top *tỷ lệ rời bỏ dự kiến*.
- `PhoneService = Yes` có tỷ lệ rời bỏ dịch vụ dự kiến là **21,49%** và `Dependents = No` đạt **20,32%**, phần lớn là do quy mô tệp lớn (**93,89%** và **69,74%**), phản ánh tỷ lệ rời bỏ dịch vụ tự nhiên của hệ sinh thái.

**Phân khúc ảnh hưởng lớn nhất với quy mô lớn và tỷ lệ rời bỏ ở mức báo động:**

1. `Contract = Month-to-month` — **21,16%**, cứ **5** khách hàng sẽ có **1** người rời đi
2. `InternetService = Fiber optic` — **19,04%**
3. `PaymentMethod = Electronic check` — **17,73%**

### 3.8. Risk Gap — Sức giữ chân hệ sinh thái dịch vụ

**Note:** Khi tính sức giữ chân, ta loại trừ nhóm khách hàng không sử dụng Internet và điện thoại để tính sự chênh lệch tỷ lệ rời bỏ dịch vụ giữa nhóm *có* và *không* sử dụng dịch vụ bổ trợ.

![Risk Gap — sức giữ chân dịch vụ bổ trợ](eda/eda_risk_gap_services.png)

**Nhận xét:**

- **Security & Support** có sức giữ chân hiệu quả nhất khi `OnlineSecurity` và `TechSupport` kéo tỷ lệ rời bỏ dịch vụ từ ~**40%** xuống **8,7%** và **9,6%** (chênh lệch > **30%**). `OnlineBackup`, `DeviceProtection` cũng thể hiện sự hấp dẫn với mức giữ chân **20%**.
- **Streaming** trái với kỳ vọng ban đầu khi mức chênh lệch chỉ đạt **1,3%–1,6%**, cho thấy dịch vụ này có xu hướng dễ bị thay thế bởi nền tảng bên thứ ba, chưa tạo được sự gắn kết với khách hàng.

→ Phân tích này là cơ sở để gom 4 dịch vụ bảo vệ vào hệ thống đặc trưng `security_score`, 2 dịch vụ streaming vào nhóm `streaming_score`.



### 3.9. Tổng kết EDA

- **Yếu tố rủi ro đỉnh:** hợp đồng ngắn, Fiber optic, thanh toán thủ công, thiếu bảo mật/hỗ trợ.
- **Yếu tố giữ chân:** hợp đồng dài hạn, Security/Support, thanh toán tự động, gia đình (rào cản chuyển đổi).
- **Biến loại bỏ sớm:** `gender`, `TotalCharges`.
- **Metric & sampling:** Ưu tiên sử dụng stratified split, ROC-AUC/F1, SMOTE.

---

## 4. Kỹ thuật đặc trưng (Feature Engineering)

**Note:** Feature Engineering cô đọng mật độ thông tin rủi ro, tối ưu không gian biểu diễn để **LightGBM** và **XGBoost** rẽ nhánh hiệu quả.

### 4.1. Rời rạc hóa phi tuyến — `loyalty_tier` và `charge_segment`

| Feature | Bins | Nhãn |
|---------|------|------|
| `loyalty_tier` | [0, 6, 12, 24, 48, ∞] | Onboarding → First Year → Second Year → Familiar → Loyal |
| `charge_segment` | [0, 35, 70, ∞] | Budget → Standard → Premium |

**Interaction Validation (Heatmap):**
![Heatmap loyalty_tier × charge_segment](eda/fe_heatmap_loyalty_charge.png)

**Nhận xét — Compounding Risk Effect:**

- *Onboarding + Premium:* có tỷ lệ rời bỏ đáng báo động **77,4%**, cho thấy áp lực chi phí cao khi mới sử dụng dịch vụ là rủi ro lớn khiến khách hàng rời bỏ dịch vụ.
- Rủi ro rời bỏ dịch vụ của nhóm *Premium* giảm dần, từ **77,4%** đến **48,1%** và cuối cùng là **8,2%** khi thời gian gắn bó tăng, cho thấy phần lớn áp lực đến từ việc tiếp xúc với gói cước đắt đỏ khi chưa trải nghiệm hoàn toàn giá trị dịch vụ.
- Nhóm *Budget* có tỷ lệ rời bỏ giảm dần từ **16,5%** đến mức **0,4%** ở nhóm trung thành, cho thấy sự gắn bó tự nhiên xuất phát từ gói cước phù hợp với khả năng chi trả.

**Kết luận:** Phân hóa rủi ro trên Heatmap chứng minh mật độ **Information Density** của hai đặc trưng mới này ở mức cao; `loyalty_tier` và `charge_segment` mang tính bổ trợ cho nhau rất tốt, không bị trùng lặp thông tin đầu vào.


### 4.2. Chỉ số tài chính phái sinh

![KDE các biến tài chính phái sinh](eda/fe_kde_financial.png)

| Feature | Công thức | Kết quả | 
|---------|-----------|---------|
| `charge_to_tenure_ratio_log` | `log1p(MonthlyCharges / tenure)` | KDE phân tách một cách hoàn hảo, cho thấy khách hàng bị áp lực về giá so với thời gian sử dụng dịch vụ có xu hướng rời bỏ dịch vụ hơn nhóm gắn bó lâu dài hay nhóm có mức phí thấp|
| `average_cost_per_service` | `MonthlyCharges / total_active_services` | Khách hàng có xu hướng rời bỏ dịch vụ do số tiền bỏ ra cho mỗi dịch vụ cao hơn mức thông thường hơn là do cước tháng cao |
| `bill_shock_ratio` | `MonthlyCharges / (TotalCharges/tenure)` | Trực quan hóa cho thấy phân phối của hai nhóm rời bỏ và gắn bó không có sự khác biệt rõ rệt khi đồ thị của hai nhóm gần như chồng khít lên nhau. Đây không phải là đặc trưng dự báo rủi ro tốt và cần được loại bỏ khỏi mô hình|


**Kết luận:** Giữ `charge_to_tenure_ratio_log`, `average_cost_per_service`; loại `bill_shock_ratio` (không **Information Gain**).




### 4.3. Hệ thống điểm số hệ sinh thái

**Note:** Ta thực hiện gán điểm **-1** cho nhóm khách hàng không đăng kí dịch vụ cơ bản, tức `InternetService = No` hoặc `PhoneService` = No để loại bỏ **Confounding Bias**.


![security_score và streaming_score](eda/fe_ecosystem_scores.png)

| Feature | Thang | Nhận xét |
|---------|-------|----------|
| `security_score` | -1 → 4 | Nhóm 0 điểm có tỷ lệ rời bỏ dịch vụ lên đến **52,7%**, phân hóa rất mạnh so với nhóm đăng kí đủ 4 dịch vụ với tỷ lệ rời bỏ chỉ **1,4%** |
| `streaming_score` | -1 → 2 | Nhóm 1 điểm có tỷ lệ rời bỏ dịch vụ lên đến **32,8%**, kể cả khi đăng kí cả 2 dịch vụ hay không đăng kí dịch vụ nào, mức này vẫn không có sự chênh lệch rõ rệt với mức tương ứng là **27,2%** và **28,9%** | 



### 4.4. Cờ rủi ro hành vi (Churn triggers)

![Cờ rủi ro hành vi](eda/fe_churn_triggers.png)

| Đặc trưng | Rủi ro rời bỏ dịch vụ |
|---------|---------------|
| `zero_supportive_service` | **52,7%** |
| `manual_payment` | **34,0%** vs **7,3%** |
| `composite_risk_profile` | **55,0%** |



### 4.5. `demographic_profile` — Domain-Driven Interaction

![demographic_profile](eda/fe_demographic_profile.png)

| Persona | Rủi ro rời bỏ dịch vụ | Quy mô |
|---------|-------------------------|--------|
| Nuclear Family | **10,6%** | **48,8%** |
| Isolated Senior | **60,3%** | **5,9%** |
| Supported Senior | **39,1%** | **3,5%** |

**Nhận xét:** Có sự dịch chuyển của rủi ro dời bỏ dịch vụ và quy mô theo chiều hướng đối nghịch, nhóm có tỷ lệ rời bỏ dịch vụ cao nhất lại có quy mô nhỏ nhất và ngược lại.



### 4.6. Tương quan và Feature Superiority Ranking

![Feature Superiority Ranking](eda/fe_feature_ranking.png)

- Pearson/Spearman: loại `TotalCharges` (**r = 0,77** với tenure); thay `tenure`/`MonthlyCharges` bằng `loyalty_tier`/`charge_segment`.
- Cramer's V: giữ `composite_risk_profile`, `security_score`, `manual_payment`, `demographic_profile`.

| Hạng | Feature | Hệ số |
|------|---------|--------|
| 1 | Siêu cờ Tổ hợp rủi ro | **0,54** |
| 2 | Log Áp lực chi phí | **0,53** |
| 3 | Điểm Khiên Bảo vệ | **0,49** |
| 4 | Mức độ gắn bó | **0,43** |
| 5 | Phân khúc Vòng đời | **0,33** |
| 6 | Phân khúc Cước phí | **0,31** |

**Kết luận:** Engineered Features **áp đảo** Original Features.



### 4.7. Thanh lọc và Model Schema

Nguyên tắc **Winner-takes-all** + **Noise Removal** — loại **11** biến (`TotalCharges`, `zero_supportive_service`, `tenure`, `MonthlyCharges`, nhân khẩu học gốc, `gender`, `bill_shock_ratio`, `id`, `Churn` text).

**Kết quả:** 34 → **23** features (22 input + `churn_flag`). Sẵn sàng chuyển giao **Modeling Pipeline** (mục 5).

---

## 5. Xây dựng Pipeline Machine Learning

### 5.1. Kiến trúc tổng thể

Dự án triển khai pipeline MLOps gồm **6 giai đoạn**, điều phối bởi `main.py`. Mỗi stage là module độc lập — chạy riêng để debug hoặc chạy liên tiếp qua `python main.py`.

| Stage | Tên | Input | Output chính |
|-------|-----|-------|--------------|
| 01 | Data Ingestion | `data/*.zip` | `train.csv`, `test.csv` |
| 02 | Data Validation | CSV + `schema.yaml` | `status.txt` (True/False) |
| 03 | Data Transformation | CSV thô | `.npz` đã transform, `preprocessor.joblib` |
| 04 | Model Training | `.npz` | `model.joblib`, `metrics.json` |
| 05 | Model Evaluation | Model + test data | Predictions, biểu đồ, MLflow logs |
| 06 | Prediction | Model + test CSV | `submission.csv` |

**Luồng dữ liệu:** Zip → CSV → Validate → Feature Engineering + SMOTE → Train/Compare → Evaluate → Predict → Submit.

### 5.2. Chi tiết từng giai đoạn

#### Stage 01 — Data Ingestion

Giải nén `playground-series-s6e3.zip` → `artifacts/data_ingestion/train.csv` (594.194 dòng) và `test.csv` (254.655 dòng).

#### Stage 02 — Data Validation

So khớp cột và kiểu dữ liệu với `config/schema.yaml`. Schema sai → pipeline dừng sớm, tránh train trên dữ liệu lỗi cấu trúc.

#### Stage 03 — Data Transformation

| Nhóm cột | Xử lý |
|----------|-------|
| Numeric (5 feature phái sinh) | Imputer (median) → Winsorizer (P1–P99) → StandardScaler |
| Categorical (10 biến gốc) | Imputer (mode) → OneHotEncoder (drop='first') |
| Binary (PhoneService, PaperlessBilling) | Imputer → OneHotEncoder |
| Ordinal (loyalty_tier, charge_segment, demographic_profile) | Imputer |
| Engineered binary (manual_payment, composite_risk_profile) | Imputer |

**Chống leakage:** Pipeline **chỉ fit trên train**, transform test bằng cùng tham số đã học.

**SMOTE:** Chỉ trên train sau transform → **920.754** mẫu (50:50). Test **không** oversample.

#### Stage 04 — Model Training

| Mô hình | Tổ hợp | Tham số |
|---------|--------|---------|
| LightGBM | 6 | n_estimators [100,200], max_depth [3,5,7], lr=0.1 |
| XGBoost | 6 | n_estimators [100,200], max_depth [3,5,6], lr=0.1 |

Chia 80/20 stratified, CV 3-fold, scoring = ROC AUC, log MLflow, lưu model tốt nhất.

#### Stage 05 — Model Evaluation

Dự đoán validation, tính metrics, xuất Confusion Matrix và ROC Curve (trong `docs/`).

#### Stage 06 — Prediction

Load model + preprocessor → transform test Kaggle → `submission.csv` (cột `id`, `Churn`).

### 5.3. Cấu hình và quản lý

| File | Vai trò |
|------|---------|
| `config/config.yaml` | Đường dẫn artifact, MLflow URI |
| `config/schema.yaml` | Kiểu dữ liệu, cột target |
| `config/params.yaml` | Lưới tham số GridSearchCV |
| `config/logging.yaml` | Ghi log vào `logs/` |

`ConfigurationManager` đọc YAML và cung cấp config type-safe cho từng stage — tách cấu hình khỏi logic xử lý.

### 5.4. Đồng bộ EDA → Feature Engineering → Pipeline

Notebook EDA (mục 3–4) và code production (Stage 03–04) **cùng một logic**, chỉ khác môi trường thực thi: notebook khám phá và ghi **Note / Nhận xét / Kết luận**; pipeline đóng gói quyết định đã chốt trong `ChurnFeatureEngineer` và `DataTransformation`.

#### Bảng ánh xạ quyết định EDA → Stage 03

| Insight từ EDA (mục 3) | Quyết định trong pipeline |
|------------------------|---------------------------|
| 7 khách Phone+Internet = No (mục 3.1.2) | Làm sạch trước transform; `total_active_services` không gặp nhóm 0 |
| `gender` Risk Spread 0,57% (mục 3.6) | `COLS_TO_DROP` — Zero-Signal |
| `TotalCharges` đa cộng tuyến tenure (mục 3.2, 4.6) | `COLS_TO_DROP`; thay bằng `charge_to_tenure_ratio_log` |
| `tenure` bimodal → `loyalty_tier` (mục 3.2, 4.1) | Ordinal trong `ORDINAL_COLS`; `tenure` gốc bị drop |
| `MonthlyCharges` → `charge_segment` (mục 3.5, 4.1) | Ordinal; `MonthlyCharges` gốc bị drop |
| Risk Gap Security/Support (mục 3.8) | `security_score` (−1…4) trong `NUMERIC_COLS` |
| Streaming yếu giữ chân (mục 3.8) | `streaming_score` — giữ để mô hình tự học trọng số thấp |
| Toxic traits: Contract, Fiber, E-check (mục 3.7) | Giữ nguyên categorical + `composite_risk_profile` |
| Thanh toán thủ công (mục 3.6) | `manual_payment` trong `ENGINEERED_BINARY_COLS` |
| Senior + Partner + Dependents (mục 4.5) | Gộp `demographic_profile`; drop 3 biến gốc |
| `bill_shock_ratio` không phân tách (mục 4.2) | Tạo trong engineer nhưng `COLS_TO_DROP` |
| `zero_supportive_service` V=1,00 với `security_score` (mục 4.4) | `COLS_TO_DROP` — Winner-takes-all |
| Churn 77,5% / 22,5% (mục 3.4) | SMOTE trên train → 920.754 mẫu (50:50) |
| Không dùng Accuracy (mục 3.4) | GridSearchCV `scoring='roc_auc'`; stratified 80/20 + 3-fold CV |

#### Luồng Stage 03 (khớp mục 4.7)

1. **ChurnFeatureEngineer** — tạo 10 feature phái sinh từ insight mục 3.5–3.8 và 4.1–4.5.
2. **ColumnTransformer** — 5 nhóm cột (numeric / categorical / binary / ordinal / engineered binary) như bảng mục 5.2; `remainder="drop"` loại cột gốc đã thay thế.
3. **Fit chỉ trên train** — transform validation và test Kaggle bằng cùng tham số (chống leakage).
4. **SMOTE** — chỉ sau transform trên train; test không oversample.

#### Đồng bộ với Stage 04

- **Stratified** train/validation và CV — đáp ứng kết luận mục 3.4 (giữ ~22,5% churn mỗi fold).
- **ROC-AUC** làm metric chọn mô hình — phù hợp imbalance và mục tiêu phân loại churn.
- LightGBM/XGBoost hưởng lợi từ ordinal engineered features và siêu cờ `composite_risk_profile` (V = 0,54) — khớp **Feature Superiority Ranking** mục 4.6.


---

## 6. Kết quả mô hình

### 6.1. So sánh mô hình

| Mô hình | ROC AUC | F1-Score | Kết quả |
|---------|---------|----------|---------|
| **LightGBM** | **93,39%** | **86,55%** | ✅ **Tốt nhất** |
| XGBoost | 93,01% | 86,63% | — |

**Mô hình được chọn:** LightGBM với ROC AUC = **0,9339**.

### 6.2. Metrics chi tiết (Validation Set — LightGBM)

| Metric | Giá trị | Diễn giải trong bài toán Churn |
|--------|---------|--------------------------------|
| Accuracy | 85,95% | Tổng thể dự đoán đúng, nhưng không phải metric ưu tiên |
| Precision | 83,00% | 83% cảnh báo churn là đúng — hạn chế "báo động giả" |
| Recall | 90,40% | Bắt được ~9/10 khách sắp rời bỏ — quan trọng để can thiệp kịp thời |
| F1-Score | 86,55% | Cân bằng Precision–Recall trên lớp thiểu số |
| **ROC AUC** | **93,10%** | Khả năng phân tách rủi ro tổng thể rất tốt |

**Tại sao ưu tiên Recall?** Trong bài toán churn, **bỏ sót khách sắp rời bỏ (False Negative)** thường tốn kém hơn **cảnh báo nhầm (False Positive)** — vì doanh nghiệp vẫn có thể gửi ưu đãi giữ chân cho khách được cảnh báo nhầm, nhưng mất khách thật thì không thu hồi được.

### 6.3. Ma trận nhầm lẫn (Confusion Matrix)

![Confusion Matrix](validation_confusion_matrix.png)

**Phân tích Confusion Matrix (184.151 mẫu validation):**

| | Dự đoán: No (0) | Dự đoán: Yes (1) |
|---|---|---|
| **Thực tế: No (0)** | 75.489 (TN) | 16.587 (FP) |
| **Thực tế: Yes (1)** | 7.969 (FN) | 84.106 (TP) |

| Chỉ số | Giá trị | Ý nghĩa |
|--------|---------|---------|
| Recall (Churn) | **91,35%** | Phát hiện 91% khách sắp rời bỏ — chỉ bỏ sót ~8.000 trên 92.000 |
| Precision (Churn) | **83,53%** | Cảnh báo churn đáng tin cậy |
| Specificity | **81,98%** | Nhận diện tốt nhóm khách trung thành |
| False Negative Rate | **8,65%** | Tỷ lệ bỏ sót khách churn — chấp nhận được cho retention campaign |

**Đọc ma trận theo góc kinh doanh:** 16.587 False Positive nghĩa là ~16.000 khách trung thành bị gắn nhãn rủi ro — chi phí marketing retention cho nhóm này là "phí bảo hiểm" chấp nhận được so với 7.969 khách churn bị bỏ sót.

### 6.4. Đường cong ROC (ROC Curve)

![ROC Curve](validation_roc_curve.png)

- **AUC = 0,9339** — mô hình có khả năng phân tách rủi ro rất tốt.
- Đường cong ROC nằm sát góc trên-trái, vượt xa đường Random Classifier (AUC = 0,5).

### 6.5. Artifacts được tạo ra

| Thư mục / File | Nội dung |
|----------------|----------|
| `artifacts/data_ingestion/` | train.csv (594.194), test.csv (254.655) |
| `artifacts/data_validation/` | status.txt = True |
| `artifacts/data_transformation/` | train_transformed.npz (920.754 × 23), test_transformed.npz, preprocessor.joblib |
| `artifacts/model_trainer/` | model.joblib (LightGBM), metrics.json |
| `artifacts/model_evaluation/` | predictions.npz |
| `submission.csv` (thư mục gốc) | File nộp Kaggle: cột `id`, `Churn` |
| `mlruns/` | Lịch sử experiment MLflow |

---

## 7. Kết luận và hướng phát triển

### 7.1. Kết luận

Dự án **Customer Churn Prediction** đã hoàn thành đầy đủ quy trình từ phân tích dữ liệu đến triển khai mô hình:

1. **EDA chuyên sâu** đã xác định rõ các yếu tố rủi ro: hợp đồng ngắn hạn, Fiber optic, thiếu dịch vụ bảo mật, thanh toán thủ công và phân khúc nhân khẩu học.

2. **Feature Engineering** tạo ra 10 đặc trưng phái sinh có mật độ thông tin cao, đặc biệt `composite_risk_profile` (55% churn) và `demographic_profile` (Risk Spread 49,7%).

3. **Pipeline MLOps** 6 giai đoạn tự động hóa toàn bộ quy trình, tích hợp MLflow tracking và có thể chạy từng stage độc lập.

4. **Mô hình LightGBM** đạt **ROC AUC 93,39%** với Recall 91,35% trên nhóm churn — phù hợp cho bài toán cần phát hiện sớm khách hàng có nguy cơ rời bỏ.

### 7.2. Ý nghĩa thực tiễn

Dựa trên EDA và kết quả mô hình, doanh nghiệp có thể ưu tiên can thiệp theo thứ tự:

| Ưu tiên | Phân khúc | Hành động đề xuất |
|---------|-----------|-------------------|
| 1 | `composite_risk_profile = 1` (Fiber + Month-to-month) | Ưu đãi chuyển hợp đồng dài hạn, giảm cước gói bảo mật |
| 2 | `manual_payment = 1` | Khuyến khích chuyển sang auto-pay (credit card, bank transfer) |
| 3 | `security_score` thấp | Cross-sell OnlineSecurity, TechSupport |
| 4 | `demographic_profile = 2` (Isolated Senior) | Hỗ trợ kỹ thuật chủ động, hotline ưu tiên |
| 5 | `loyalty_tier` 0–1 + `charge_segment` Premium | Giảm "bill shock" cho khách mới cước cao |

### 7.3. Hạn chế

- Dữ liệu là bộ synthetic từ Kaggle Playground, có thể khác phân phối so với dữ liệu thực tế.
- Chưa triển khai giải thích mô hình (SHAP/LIME) để hiểu từng dự đoán cụ thể.
- Chưa đánh giá trên tập test có nhãn (Kaggle chỉ chấm điểm qua leaderboard).

### 7.4. Hướng phát triển

- Tích hợp **SHAP values** để giải thích feature importance từng dự đoán.
- Mở rộng sang **web application** (frontend + backend API) cho phép nhập thông tin khách hàng và nhận dự đoán real-time.
- Thử nghiệm thêm mô hình **CatBoost**, **Stacking Ensemble**.
- Triển khai **model monitoring** để phát hiện data drift trên production.

---

## Tài liệu tham khảo

1. Kaggle Playground Series S6E3 — Customer Churn Prediction Competition
2. Notebook EDA: `EDA/trocungDucLevan.ipynb`
3. Source code pipeline: `main.py`, `src/components/`, `src/pipeline/`
4. Cấu hình: `config/config.yaml`, `config/schema.yaml`, `config/params.yaml`
5. Documentation: `README.md`


