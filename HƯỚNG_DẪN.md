# 📚 HƯỚNG DẪN CHI TIẾT FILE MAIN.IPYNB

> **Dành cho người mới bắt đầu** - Giải thích từng bước xử lý dữ liệu và huấn luyện mô hình dự đoán ung thư vú

---

## 🎯 MỤC ĐÍCH DỰ ÁN

Dự án này xây dựng một mô hình AI để **dự đoán loại ung thư vú chi tiết** của bệnh nhân dựa trên các thông tin lâm sàng như:

- Loại phẫu thuật đã thực hiện
- Các chỉ số y tế (HER2, PR status...)
- Phương pháp điều trị (hóa trị, xạ trị...)
- Các thông số sinh học khác

**Kết quả dự đoán:** 5 loại ung thư vú chi tiết

- 0: Breast (Ung thư vú chung)
- 1: Breast Invasive Ductal Carcinoma (Ung thư biểu mô ống xâm lấn)
- 2: Breast Invasive Lobular Carcinoma (Ung thư tiểu thùy xâm lấn)
- 3: Breast Invasive Mixed Mucinous Carcinoma (Ung thư nhầy hỗn hợp xâm lấn)
- 4: Breast Mixed Ductal and Lobular Carcinoma (Ung thư ống và tiểu thùy hỗn hợp)

---

## 📂 DỮ LIỆU: METABRIC Dataset

### Thông tin dataset

- **Tên file:** `dataset/METABRIC_RNA_Mutation.csv`
- **Nguồn:** METABRIC (Molecular Taxonomy of Breast Cancer International Consortium)
- **Kích thước:** 1,906 bệnh nhân (dòng) × hơn 700 cột thông tin
- **Nội dung:** Thông tin lâm sàng + dữ liệu gene expression + đột biến gen

### Cấu trúc dữ liệu gốc

```
┌─────────────────────────────────────────────────────────────────┐
│ METABRIC Dataset (1906 patients × 700+ columns)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. THÔNG TIN BỆNH NHÂN                                         │
│    • patient_id                    : Mã bệnh nhân              │
│    • age_at_diagnosis              : Tuổi khi chẩn đoán        │
│    • type_of_breast_surgery        : Loại phẫu thuật           │
│    • cancer_type                   : Loại ung thư chung        │
│    • cancer_type_detailed          : Loại ung thư chi tiết ⭐  │
│                                                                 │
│ 2. THÔNG SỐ LÂM SÀNG                                           │
│    • cellularity                   : Mật độ tế bào             │
│    • neoplasm_histologic_grade     : Độ mô học (1-3)           │
│    • lymph_nodes_examined_positive : Số hạch bạch huyết (+)    │
│    • nottingham_prognostic_index   : Chỉ số tiên lượng         │
│    • tumor_size                    : Kích thước khối u         │
│    • tumor_stage                   : Giai đoạn ung thư         │
│                                                                 │
│ 3. THÔNG SỐ SINH HỌC                                           │
│    • pam50_+_claudin-low_subtype   : Phân loại PAM50           │
│    • her2_status                   : Trạng thái HER2           │
│    • pr_status                     : Trạng thái PR             │
│    • er_status                     : Trạng thái ER             │
│                                                                 │
│ 4. PHƯƠNG PHÁP ĐIỀU TRỊ                                        │
│    • chemotherapy                  : Hóa trị (0=No, 1=Yes)    │
│    • hormone_therapy               : Liệu pháp hormone         │
│    • radio_therapy                 : Xạ trị                    │
│                                                                 │
│ 5. DỮ LIỆU GENE (600+ cột)                                     │
│    • brca1, brca2, tp53, pik3ca, ...                          │
│    • Expression levels của hàng trăm gene                      │
│    • Mutation data (có/không đột biến)                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

⭐ = TARGET (Biến cần dự đoán)
```

### Ví dụ dữ liệu thực tế

| patient_id | age   | surgery           | cancer_type   | **cancer_type_detailed**             | cellularity | her2     | pr       |
| ---------- | ----- | ----------------- | ------------- | ------------------------------------ | ----------- | -------- | -------- |
| 0          | 75.65 | MASTECTOMY        | Breast Cancer | **Breast Invasive Ductal Carcinoma** | High        | Negative | Negative |
| 2          | 43.19 | BREAST CONSERVING | Breast Cancer | **Breast Invasive Ductal Carcinoma** | High        | Negative | Positive |
| 5          | 48.87 | MASTECTOMY        | Breast Cancer | **Breast Invasive Ductal Carcinoma** | High        | Negative | Positive |

---

## 🔄 QUY TRÌNH XỬ LÝ DỮ LIỆU (10 BƯỚC)

### **BƯỚC 1: Import thư viện và đọc dữ liệu**

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from imblearn.over_sampling import SMOTENC
```

**Giải thích:**

- `pandas`: Xử lý bảng dữ liệu (giống Excel)
- `numpy`: Tính toán số học
- `matplotlib, seaborn`: Vẽ biểu đồ
- `sklearn`: Thư viện machine learning
- `imblearn`: Xử lý dữ liệu mất cân bằng

```python
df = pd.read_csv("dataset/METABRIC_RNA_Mutation.csv")
```

**Kết quả:** Đọc file CSV vào biến `df` (DataFrame)

---

### **BƯỚC 2: Kiểm tra dữ liệu thiếu (Missing Values)**

```python
na_counts = df.isna().sum()
na_counts = na_counts[na_counts > 0]
print(na_counts)
```

**Tại sao quan trọng?**

- Giống như khảo sát: một số người không điền đủ thông tin
- Ví dụ: Bệnh nhân A không đo HER2 → ô "her2_status" bị trống
- Machine learning không thể xử lý ô trống → cần xử lý

**Ví dụ output:**

```
cellularity                      67  ← 67 bệnh nhân thiếu thông tin này
her2_status                     184  ← 184 bệnh nhân thiếu
nottingham_prognostic_index     189
```

---

### **BƯỚC 3: Lựa chọn đặc trưng quan trọng (Feature Selection)**

#### ❓ Vấn đề

Dataset gốc có hơn 700 cột, nhưng:

- Nhiều cột là gene expression (không cần thiết cho dự đoán lâm sàng)
- Quá nhiều thông tin → model phức tạp, khó train, dễ overfitting

#### ✅ Giải pháp: Chỉ giữ lại 13 cột quan trọng nhất

```python
KEEP = [
    "type_of_breast_surgery",           # Loại phẫu thuật
    "cancer_type",                       # Loại ung thư chung
    "cancer_type_detailed",              # ⭐ TARGET - Cần dự đoán
    "cellularity",                       # Mật độ tế bào
    "chemotherapy",                      # Có hóa trị không (0/1)
    "pam50_+_claudin-low_subtype",      # Phân loại PAM50
    "neoplasm_histologic_grade",        # Độ mô học (1/2/3)
    "her2_status",                       # Trạng thái HER2
    "hormone_therapy",                   # Có liệu pháp hormone không
    "lymph_nodes_examined_positive",    # Số hạch bạch huyết dương tính
    "nottingham_prognostic_index",      # Chỉ số tiên lượng
    "pr_status",                         # Trạng thái PR
    "radio_therapy",                     # Có xạ trị không
]

df_features = df[KEEP]  # Chỉ lấy 13 cột này
```

**Kết quả:**

- Từ 1906 × 700+ → 1906 × 13 (giảm 98% số cột!)
- Giữ lại đủ thông tin y khoa quan trọng để dự đoán

---

### **BƯỚC 4: Phân loại loại dữ liệu**

Trong 13 cột đã chọn, có 2 loại dữ liệu:

#### 1️⃣ **Categorical (Dạng chữ/phân loại)**

```python
Categorical = [
    "type_of_breast_surgery",      # MASTECTOMY hoặc BREAST CONSERVING
    "cancer_type",                  # Breast Cancer hoặc Breast Sarcoma
    "cancer_type_detailed",         # 5 loại khác nhau
    "cellularity",                  # High, Moderate, Low
    "pam50_+_claudin-low_subtype",  # Basal, Her2, LumA, LumB, ...
    "her2_status",                  # Positive, Negative
    "pr_status"                     # Positive, Negative
]
```

**Ví dụ giá trị:**

- `her2_status`: "Positive" hoặc "Negative" (không phải số)
- `cellularity`: "High", "Moderate", "Low" (không có thứ tự số)

#### 2️⃣ **Numerical (Dạng số)**

```python
Numerical = [
    "chemotherapy",                     # 0 hoặc 1
    "neoplasm_histologic_grade",        # 1, 2, hoặc 3
    "hormone_therapy",                  # 0 hoặc 1
    "lymph_nodes_examined_positive",    # 0, 1, 2, 3, ...
    "nottingham_prognostic_index",      # 2.04, 3.58, 5.4, ...
    "radio_therapy"                     # 0 hoặc 1
]
```

---

### **BƯỚC 5: Trực quan hóa dữ liệu (Visualization)**

```python
for col in Categorical:
    sns.countplot(data=df, x=col)
    plt.show()
```

**Mục đích:** Xem phân bố dữ liệu qua biểu đồ cột

**Ví dụ biểu đồ cho `cancer_type_detailed`:**

```
Breast Invasive Ductal Carcinoma     ████████████████████ 1200
Breast Invasive Lobular Carcinoma    ████████ 400
Breast                               ███ 150
Breast Mixed Ductal and Lobular      ██ 100
Breast Invasive Mixed Mucinous       █ 56
```

**Phát hiện vấn đề:**

- ⚠️ **Class Imbalance** (Mất cân bằng nhãn)
- Class 1 có 1200 mẫu, Class 4 chỉ có 56 mẫu
- → Model sẽ thiên về class đông người hơn

---

### **BƯỚC 6: Xóa dữ liệu thiếu (Handle Missing Values)**

```python
df_features = df_features.dropna()
print("Shape sau khi xóa:", df_features.shape)
```

**Trước:** 1906 dòng  
**Sau:** ~1600 dòng (xóa ~300 dòng có ô trống)

#### ❓ Tại sao xóa thay vì điền giá trị?

**Các phương pháp điền thường thấy:**

1. Điền giá trị trung bình (mean/median)
2. Điền giá trị xuất hiện nhiều nhất (mode)
3. Điền bằng thuật toán dự đoán

**Vấn đề với dữ liệu y khoa:**

```
Ví dụ: Bệnh nhân A không đo HER2
❌ Điền "Positive" → Sai lệch thông tin
❌ Điền "Negative" → Cũng sai lệch
✅ Xóa bệnh nhân này → An toàn hơn
```

**Nguyên tắc:** Trong y tế, tốt hơn là mất mẫu thật còn hơn mẫu giả!

---

### **BƯỚC 7: Mã hóa dữ liệu (Label Encoding)**

#### ❓ Vấn đề: Máy tính không hiểu chữ!

```
Machine Learning không đọc được:
❌ "Positive", "Negative"
❌ "High", "Moderate", "Low"
✅ Chỉ hiểu: 0, 1, 2, 3, ...
```

#### ✅ Giải pháp: Chuyển chữ → số

```python
from sklearn.preprocessing import LabelEncoder

encoding_maps = {}

for col in categorical_cols:
    le = LabelEncoder()
    df_features[col] = le.fit_transform(df_features[col])

    # Lưu bảng chuyển đổi
    encoding_maps[col] = {
        cls: int(code)
        for cls, code in zip(le.classes_, le.transform(le.classes_))
    }

# Lưu ra file JSON để dùng sau
import json
with open("encoding_maps.json", "w") as f:
    json.dump(encoding_maps, f, indent=4)
```

**Ví dụ bảng mã hóa:**

| Cột             | Giá trị gốc | Giá trị sau mã hóa |
| --------------- | ----------- | ------------------ |
| `her2_status`   | "Negative"  | 0                  |
| `her2_status`   | "Positive"  | 1                  |
| `cellularity`   | "High"      | 0                  |
| `cellularity`   | "Low"       | 1                  |
| `cellularity`   | "Moderate"  | 2                  |
| `pam50_subtype` | "Basal"     | 0                  |
| `pam50_subtype` | "Her2"      | 1                  |
| `pam50_subtype` | "LumA"      | 2                  |
| `pam50_subtype` | "LumB"      | 3                  |

**Kết quả:**

```python
# Trước mã hóa
her2_status: ["Positive", "Negative", "Positive"]

# Sau mã hóa
her2_status: [1, 0, 1]
```

**Tại sao lưu `encoding_maps.json`?**

- Khi dự đoán mẫu mới, cần chuyển "Positive" → 1
- Backend API sẽ dùng file này để encode input

---

### **BƯỚC 8: Cân bằng dữ liệu (SMOTENC)**

#### ❓ Vấn đề: Class Imbalance

```
Phân bố thực tế:
Class 0: ███ 150 mẫu (7%)
Class 1: ████████████████████ 1200 mẫu (75%)  ← Đông nhất!
Class 2: ████████ 400 mẫu (25%)
Class 3: █ 56 mẫu (3%)
Class 4: ██ 100 mẫu (6%)
```

**Hệ quả:**

- Model học thiên về Class 1 (vì có nhiều mẫu nhất)
- Với Class 3, 4 (ít mẫu) → Model dự đoán kém

**Ví dụ thực tế:**

```
Model "lười": "Mọi bệnh nhân đều là Class 1!"
→ Accuracy: 75% (đúng 1200/1600)
→ Nhưng không dự đoán đúng được Class 3, 4!
```

#### ✅ Giải pháp: SMOTENC

**SMOTE = Synthetic Minority Over-sampling Technique**

- Tạo thêm mẫu "giả" cho các class thiểu số
- **SMOTENC**: Phiên bản đặc biệt cho dữ liệu **có cả categorical + numerical**

```python
from imblearn.over_sampling import SMOTENC
from collections import Counter

# Xác định cột categorical (dạng chữ)
X = df_features.drop(columns=["cancer_type_detailed"])  # Features
y = df_features["cancer_type_detailed"]                 # Target

categorical_feature_indices = [
    X.columns.get_loc(c) for c in categorical_cols
]

# Tính k_neighbors (số láng giềng để tạo mẫu mới)
counts = Counter(y)
min_count = min(counts.values())  # Class ít mẫu nhất có bao nhiêu
k_neighbors = min(5, max(1, min_count - 1))

print(f"Trước SMOTENC: {counts}")
# Output: {0: 150, 1: 1200, 2: 400, 3: 56, 4: 100}

# Áp dụng SMOTENC
sampler = SMOTENC(
    categorical_features=categorical_feature_indices,
    k_neighbors=k_neighbors,
    random_state=42
)
X_res, y_res = sampler.fit_resample(X.values, y)

# Ghi đè lại df_features
X_res_df = pd.DataFrame(X_res, columns=X.columns)
y_res_series = pd.Series(y_res, name="cancer_type_detailed")
df_features = pd.concat([X_res_df, y_res_series], axis=1)

print(f"Sau SMOTENC: {Counter(y_res)}")
# Output: {0: 1200, 1: 1200, 2: 1200, 3: 1200, 4: 1200}
```

**Cách hoạt động của SMOTENC:**

```
1. Chọn 1 mẫu từ class thiểu số (ví dụ Class 3)
2. Tìm k láng giềng gần nhất (k=5)
3. Tạo mẫu mới nằm giữa mẫu gốc và láng giềng

Mẫu gốc:    ●
Láng giềng: ○ ○ ○ ○ ○
Mẫu mới:    ◆ ◆ ◆ (nằm giữa khoảng)

→ Tạo đến khi Class 3 = Class 1 (cân bằng)
```

**So sánh SMOTE vs SMOTENC:**

| Đặc điểm                | SMOTE | SMOTENC |
| ----------------------- | ----- | ------- |
| Xử lý số (numerical)    | ✅    | ✅      |
| Xử lý chữ (categorical) | ❌    | ✅      |
| Dùng cho dự án này      | ❌    | ✅      |

**Kết quả:**

- Tăng từ ~1600 mẫu → ~6000 mẫu
- Mỗi class có 1200 mẫu (cân bằng hoàn toàn)

---

### **BƯỚC 9: Chia dữ liệu Train/Test**

```python
X = df_features.drop("cancer_type_detailed", axis=1)  # 12 cột features
y = df_features["cancer_type_detailed"]                # 1 cột target

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.3,        # 30% dùng để test
    random_state=42,      # Seed để kết quả giống nhau mỗi lần chạy
    stratify=y            # Giữ tỷ lệ classes trong train và test
)

print(f"Train: {X_train.shape[0]} mẫu")  # ~4200 mẫu
print(f"Test: {X_test.shape[0]} mẫu")    # ~1800 mẫu
```

#### ❓ Tại sao chia dữ liệu?

**Ví dụ thực tế: Học và thi**

```
📚 Học (Train Set):
- Học sinh học từ sách giáo khoa
- Làm bài tập trong sách
→ X_train, y_train

📝 Thi (Test Set):
- Đề thi KHÁC với bài tập đã làm
- Đo khả năng áp dụng kiến thức
→ X_test, y_test (Model chưa thấy bao giờ!)
```

**Nếu không chia:**

```
❌ Học sinh thuộc lòng đáp án
❌ Thi đúng đề đã học → 100 điểm
❌ Nhưng gặp đề mới → 0 điểm
→ Overfitting!
```

**Tỷ lệ 70/30:**

- 70% train: Đủ dữ liệu để học
- 30% test: Đủ mẫu để đánh giá tin cậy

**Stratify:**

```python
stratify=y  # Giữ tỷ lệ classes

# Train set:
Class 0: 840 mẫu (70% của 1200)
Class 1: 840 mẫu
Class 2: 840 mẫu
...

# Test set:
Class 0: 360 mẫu (30% của 1200)
Class 1: 360 mẫu
Class 2: 360 mẫu
...
```

---

### **BƯỚC 10: Huấn luyện mô hình (Training)**

#### 🏗️ Kiến trúc Model: Pipeline

```python
from imblearn.pipeline import Pipeline as ImbPipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

pipe = ImbPipeline([
    ("scaler", StandardScaler()),  # Bước 1: Chuẩn hóa
    ("svc", SVC(                   # Bước 2: Phân loại
        class_weight="balanced",
        random_state=42
    ))
])
```

**Pipeline = Dây chuyền sản xuất:**

```
Input → [Chuẩn hóa] → [Phân loại SVM] → Output
  X   →   Scaler    →       SVC        →   ŷ
```

#### 📊 Bước 1: StandardScaler (Chuẩn hóa)

**Vấn đề:** Các features có scale khác nhau

```python
lymph_nodes_examined_positive: 0, 1, 2, 3, ...    (0-30)
nottingham_prognostic_index:   2.04, 5.8, ...     (2-7)
```

**Hệ quả:**

- Feature có giá trị lớn → ảnh hưởng nhiều đến model
- Feature có giá trị nhỏ → bị "át tiếng"

**Giải pháp: Standardization**

```python
Công thức: z = (x - μ) / σ

Trong đó:
- x: Giá trị gốc
- μ (mu): Giá trị trung bình (mean)
- σ (sigma): Độ lệch chuẩn (standard deviation)
```

**Ví dụ:**

```python
# Trước chuẩn hóa
lymph_nodes: [0, 1, 5, 3, 2]    mean=2.2, std=1.8
nottingham:  [2.04, 5.8, 3.2]   mean=3.68, std=1.6

# Sau chuẩn hóa (StandardScaler)
lymph_nodes: [-1.22, -0.67, 1.56, 0.44, -0.11]  mean≈0, std≈1
nottingham:  [-1.02, 1.32, -0.30]                mean≈0, std≈1
```

**Kết quả:**

- Tất cả features có mean = 0, std = 1
- Các features ngang bằng nhau về scale
- Model học tốt hơn!

#### 🤖 Bước 2: SVC (Support Vector Classifier)

**SVM là gì?**

Tưởng tượng bạn có 2 nhóm điểm trên giấy (● và ○):

```
          |
    ●  ●  |  ○  ○
    ●  ●  | ○  ○
  ●    ●  |   ○
          |
     Đường phân cách
```

**Mục tiêu SVM:** Tìm đường thẳng (hay mặt phẳng) phân tách 2 nhóm tốt nhất

**Với nhiều classes (multiclass):**

```
SVM dùng chiến lược "One-vs-Rest":
- Class 0 vs (Class 1,2,3,4)
- Class 1 vs (Class 0,2,3,4)
- Class 2 vs (Class 0,1,3,4)
- Class 3 vs (Class 0,1,2,4)
- Class 4 vs (Class 0,1,2,3)

→ 5 bộ phân loại nhị phân
→ Dự đoán: Class nào có "confidence" cao nhất
```

**Tham số `class_weight="balanced"`:**

```python
# Tự động điều chỉnh weight theo số lượng mẫu
weight_class_i = n_samples / (n_classes * n_samples_class_i)

→ Class ít mẫu → weight cao → model chú ý hơn
```

#### 🔧 Hyperparameter Tuning (GridSearchCV)

**Vấn đề:** SVM có nhiều tham số, giá trị nào tốt nhất?

```python
param_grid = {
    "svc__C": [0.1, 1, 10],              # Regularization
    "svc__kernel": ["linear", "rbf"],     # Loại kernel
    "svc__gamma": ["scale", "auto"]       # Kernel coefficient
}
```

**Ý nghĩa tham số:**

1. **C (Regularization parameter):**

```
C nhỏ (0.1): Đường phân cách "mềm", cho phép sai số
           → Tránh overfitting

C lớn (10):  Đường phân cách "cứng", phải chính xác
           → Có thể overfitting
```

2. **Kernel:**

```
linear: Đường thẳng phân tách
        ● ● | ○ ○  (đơn giản)

rbf:    Đường cong phức tạp
        ●   ●
          ○○
        ●   ●  (linh hoạt hơn)
```

3. **Gamma:**

```
gamma nhỏ: Ảnh hưởng xa (smooth)
gamma lớn: Ảnh hưởng gần (chi tiết)
```

**GridSearchCV = Thử tất cả combinations:**

```python
from sklearn.model_selection import GridSearchCV, StratifiedKFold

grid = GridSearchCV(
    pipe,
    param_grid,
    cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
    scoring="f1_macro",
    n_jobs=-1,      # Dùng tất cả CPU cores
    verbose=2        # Hiển thị tiến độ
)

grid.fit(X_train, y_train)
best_pipe = grid.best_estimator_
```

**Quá trình:**

```
Tổng số combinations: 3 × 2 × 2 = 12 models

Với mỗi combination, test qua 5 folds:
┌─────────────────────────────────────────┐
│ Fold 1: Train[1,2,3,4] → Test[5]      │
│ Fold 2: Train[1,2,3,5] → Test[4]      │
│ Fold 3: Train[1,2,4,5] → Test[3]      │
│ Fold 4: Train[1,3,4,5] → Test[2]      │
│ Fold 5: Train[2,3,4,5] → Test[1]      │
└─────────────────────────────────────────┘
→ Tính F1-score trung bình

Tổng cộng: 12 models × 5 folds = 60 lần train!
→ Chọn combination có F1-score cao nhất
```

**Ví dụ kết quả:**

```
Best params: {
    'svc__C': 1,
    'svc__kernel': 'rbf',
    'svc__gamma': 'scale'
}
→ Đây là model tốt nhất!
```

---

## 📈 ĐÁNH GIÁ MODEL (EVALUATION)

### 1️⃣ Accuracy (Độ chính xác tổng thể)

```python
y_pred = best_pipe.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy: {accuracy:.4f}")  # Ví dụ: 0.8523 (85.23%)
```

**Ý nghĩa:**

```
Accuracy = Số dự đoán đúng / Tổng số mẫu

Ví dụ:
- Test set: 1800 mẫu
- Dự đoán đúng: 1534 mẫu
→ Accuracy = 1534/1800 = 85.23%
```

**⚠️ Giới hạn của Accuracy:**

```
Nếu có class imbalance:
Class 1: 1500 mẫu
Class 2: 300 mẫu

Model "lười": "Tất cả là Class 1!"
→ Accuracy = 1500/1800 = 83.3%
→ Nhưng Class 2 hoàn toàn sai!
```

### 2️⃣ Classification Report (Chi tiết từng class)

```python
from sklearn.metrics import classification_report

print(classification_report(y_test, y_pred, digits=4))
```

**Output ví dụ:**

```
                              precision  recall  f1-score  support

                      Breast     0.7500  0.8182  0.7826      360
Breast Invasive Ductal Ca...     0.9012  0.8944  0.8978      360
Breast Invasive Lobular C...     0.8235  0.8500  0.8366      360
Breast Invasive Mixed Muc...     0.8000  0.7778  0.7887      360
Breast Mixed Ductal and L...     0.8571  0.8333  0.8451      360

                  accuracy                        0.8347     1800
                 macro avg     0.8264  0.8347  0.8302     1800
              weighted avg     0.8264  0.8347  0.8302     1800
```

**Giải thích metrics:**

#### Precision (Độ chính xác dự đoán)

```
Precision = True Positive / (True Positive + False Positive)

Ví dụ Class 1:
- Model dự đoán 100 mẫu là Class 1
- Trong đó 90 mẫu đúng thật
→ Precision = 90/100 = 0.90 (90%)

Ý nghĩa: "Khi model nói Class 1, có 90% khả năng đúng"
```

#### Recall (Độ bao phủ)

```
Recall = True Positive / (True Positive + False Negative)

Ví dụ Class 1:
- Thực tế có 120 mẫu là Class 1
- Model tìm ra được 90 mẫu
→ Recall = 90/120 = 0.75 (75%)

Ý nghĩa: "Model tìm được 75% mẫu Class 1"
```

#### F1-Score (Trung bình điều hòa)

```
F1 = 2 × (Precision × Recall) / (Precision + Recall)

Ví dụ:
- Precision = 0.90
- Recall = 0.75
→ F1 = 2 × (0.90 × 0.75) / (0.90 + 0.75) = 0.8182

Ý nghĩa: Cân bằng giữa Precision và Recall
```

**Ví dụ thực tế:**

```
👨‍⚕️ Bác sĩ A (High Precision, Low Recall):
- Chẩn đoán: 10 người bị ung thư
- Kết quả: 10/10 đúng (Precision=100%)
- Thực tế: Còn 20 người khác cũng bị nhưng bỏ sót
→ Recall = 10/30 = 33%
→ "Nói đúng nhưng sót nhiều"

👨‍⚕️ Bác sĩ B (Low Precision, High Recall):
- Chẩn đoán: 50 người bị ung thư
- Kết quả: 30/50 đúng (Precision=60%)
- Thực tế: Tìm được 30/30 người bị (Recall=100%)
→ "Tìm hết nhưng báo sai nhiều"

✅ Tốt nhất: F1-Score cao (cân bằng cả 2)
```

#### Support (Số lượng mẫu)

```
support = Số mẫu thực tế của class đó trong test set

Ví dụ:
- Class 0: 360 mẫu
- Class 1: 360 mẫu
→ Stratified split hoạt động tốt!
```

#### Macro avg vs Weighted avg

```python
# Macro average (không quan tâm số lượng)
macro_f1 = (f1_class0 + f1_class1 + ... + f1_class4) / 5

# Weighted average (có trọng số theo số lượng)
weighted_f1 = (f1_class0×360 + f1_class1×360 + ...) / 1800
```

### 3️⃣ Confusion Matrix (Ma trận nhầm lẫn)

```python
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay

cm = confusion_matrix(y_test, y_pred)
disp = ConfusionMatrixDisplay(confusion_matrix=cm)
disp.plot()
plt.show()
```

**Ví dụ Confusion Matrix:**

```
                    Predicted
                0    1    2    3    4
Actual    0  [294  30   18   10    8]   ← 294 đúng, 66 sai
          1  [ 20 322   12    4    2]   ← 322 đúng, 38 sai
          2  [ 15  10 306   18   11]   ← 306 đúng, 54 sai
          3  [  8   5   20 280   47]   ← 280 đúng, 80 sai
          4  [  6   3   14   48 289]   ← 289 đúng, 71 sai
```

**Cách đọc:**

```
Hàng 0, Cột 1: 30
→ 30 mẫu Class 0 bị nhầm thành Class 1

Hàng 3, Cột 4: 47
→ 47 mẫu Class 3 bị nhầm thành Class 4

Đường chéo chính (294, 322, 306, 280, 289):
→ Dự đoán đúng!
```

**Phân tích:**

- Class 1 dự đoán tốt nhất (322/360 = 89%)
- Class 0 thường bị nhầm với Class 1
- Class 3 ↔ Class 4 dễ nhầm lẫn (có thể do đặc điểm tương tự)

### 4️⃣ ROC-AUC Curves (Đường cong ROC)

```python
from sklearn.metrics import roc_curve, auc
from sklearn.preprocessing import label_binarize

# Binarize y_test cho multiclass
y_test_bin = label_binarize(y_test, classes=[0,1,2,3,4])

# Lấy probability scores
y_score = best_pipe.decision_function(X_test)

# Tính ROC cho từng class
for i in range(5):
    fpr, tpr, _ = roc_curve(y_test_bin[:, i], y_score[:, i])
    roc_auc = auc(fpr, tpr)
    plt.plot(fpr, tpr, label=f'Class {i} (AUC = {roc_auc:.3f})')

plt.plot([0,1], [0,1], 'k--', label='Random')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.legend()
plt.show()
```

**Giải thích:**

```
ROC Curve: Đồ thị giữa TPR vs FPR

TPR (True Positive Rate) = Recall
FPR (False Positive Rate) = FP / (FP + TN)

Đường chéo (k--): Model ngẫu nhiên (AUC=0.5)
Đường cong càng cao → Model càng tốt
AUC = 1.0: Perfect classifier
AUC = 0.5: Random guess
```

**Ví dụ output:**

```
Class 0 (AUC = 0.923)  ← Tốt
Class 1 (AUC = 0.965)  ← Rất tốt!
Class 2 (AUC = 0.901)  ← Tốt
Class 3 (AUC = 0.878)  ← Khá tốt
Class 4 (AUC = 0.887)  ← Khá tốt
```

---

## 💾 LƯU MODEL

```python
import joblib

# Lưu toàn bộ pipeline (Scaler + SVC)
joblib.dump(best_pipe, "model/best_model.pkl")
print("✅ Model đã được lưu!")
```

**File `best_model.pkl` chứa:**

1. **StandardScaler:**

   - Mean và std của mỗi feature (đã fit trên train set)
   - Để chuẩn hóa dữ liệu mới khi dự đoán

2. **SVC:**
   - Các support vectors (điểm dữ liệu quan trọng)
   - Weights và bias của decision boundaries
   - Best hyperparameters từ GridSearchCV

**Kích thước:** ~2-5 MB (tùy số lượng support vectors)

**Cách load lại:**

```python
loaded_model = joblib.load("model/best_model.pkl")
new_prediction = loaded_model.predict(new_data)
```

---

## 📊 TÓM TẮT QUY TRÌNH

```
📁 METABRIC Dataset (1906 × 700+)
         ↓
🔍 Chọn 13 features quan trọng
         ↓
🧹 Xóa missing values (→ ~1600 mẫu)
         ↓
🔢 Label Encoding (chữ → số)
         ↓
⚖️ SMOTENC (cân bằng classes → ~6000 mẫu)
         ↓
✂️ Train/Test Split (70/30)
         ↓
📈 Pipeline: StandardScaler + SVC
         ↓
🔧 GridSearchCV (12 models × 5 folds)
         ↓
✅ Best Model (C=1, kernel=rbf, gamma=scale)
         ↓
📊 Evaluation:
   • Accuracy: ~85%
   • F1-score: ~83%
   • ROC-AUC: ~0.90
         ↓
💾 Lưu model → best_model.pkl
```

---

## 🎓 KIẾN THỨC NỀN TẢNG

### 1. Machine Learning là gì?

```
🧠 Học máy = Máy tính tự học từ dữ liệu

Ví dụ:
- Con người: Xem 1000 ảnh chó → Nhận biết chó
- Machine: Xem 1000 mẫu ung thư loại 1 → Nhận biết loại 1

Quá trình:
1. Training: Học từ dữ liệu có nhãn (X_train, y_train)
2. Testing: Dự đoán dữ liệu mới (X_test) → So sánh với y_test
```

### 2. Supervised Learning (Học có giám sát)

```
📚 Dataset có nhãn sẵn:
Input (X)                  →  Output (y)
─────────────────────────────────────────
[surgery=1, her2=0, ...]   →  Class 1
[surgery=0, her2=1, ...]   →  Class 2
...

Model học mối quan hệ: X → y
Dự đoán mẫu mới: X_new → y_pred
```

### 3. Classification (Phân loại)

```
Bài toán: Dự đoán nhãn rời rạc

Ví dụ:
- Binary: [0, 1] - Ung thư/Không ung thư
- Multiclass: [0,1,2,3,4] - 5 loại ung thư (dự án này!)
- Multilabel: [0,1], [1,2], ... - 1 mẫu có nhiều nhãn
```

### 4. Overfitting vs Underfitting

```
📉 Underfitting (Học kém):
Train accuracy: 60%
Test accuracy:  58%
→ Model quá đơn giản, không học được pattern

✅ Good fit (Vừa đủ):
Train accuracy: 90%
Test accuracy:  85%
→ Model học tốt và generalize được

📈 Overfitting (Học vẹt):
Train accuracy: 99%
Test accuracy:  70%
→ Model học thuộc train set, không áp dụng được cho data mới
```

### 5. Cross-Validation (Kiểm định chéo)

```
Thay vì chia 1 lần:
Train ─────────── Test
  70%              30%

Chia 5 lần (5-fold):
Fold 1: [Train Train Train Train Test ]
Fold 2: [Train Train Train Test  Train]
Fold 3: [Train Train Test  Train Train]
Fold 4: [Train Test  Train Train Train]
Fold 5: [Test  Train Train Train Train]

→ Mỗi mẫu được test 1 lần
→ Trung bình 5 lần → Đánh giá tin cậy hơn
```

---

## 🚀 BƯỚC TIẾP THEO

Sau khi train model xong, bạn có thể:

### 1. Sử dụng model để dự đoán

```python
# Load model
import joblib
model = joblib.load("model/best_model.pkl")

# Chuẩn bị dữ liệu mới (đã encode)
new_patient = {
    'type_of_breast_surgery': 1,        # MASTECTOMY
    'cancer_type': 0,                    # Breast Cancer
    'cellularity': 0,                    # High
    'chemotherapy': 1,                   # Yes
    'pam50_+_claudin-low_subtype': 2,   # LumA
    'neoplasm_histologic_grade': 3,     # Grade 3
    'her2_status': 1,                    # Positive
    'hormone_therapy': 1,                # Yes
    'lymph_nodes_examined_positive': 5,
    'nottingham_prognostic_index': 5.4,
    'pr_status': 1,                      # Positive
    'radio_therapy': 1                   # Yes
}

# Dự đoán
import pandas as pd
X_new = pd.DataFrame([new_patient])
prediction = model.predict(X_new)[0]

# Decode kết quả
cancer_types = {
    0: "Breast",
    1: "Breast Invasive Ductal Carcinoma",
    2: "Breast Invasive Lobular Carcinoma",
    3: "Breast Invasive Mixed Mucinous Carcinoma",
    4: "Breast Mixed Ductal and Lobular Carcinoma"
}
print(f"Dự đoán: {cancer_types[prediction]}")
```

### 2. Tích hợp vào Backend API

- File `backend/app.py` đã tích hợp model này
- Tạo endpoint `/predict` nhận JSON input
- Trả về kết quả dự đoán cho Frontend

### 3. Cải thiện model

**Thử các thuật toán khác:**

- Random Forest
- XGBoost
- Neural Networks
- Ensemble methods

**Feature engineering:**

- Tạo interaction features
- Polynomial features
- Feature selection (RFE, LASSO)

**Tuning thêm:**

- Thử nhiều hyperparameters hơn
- Nested cross-validation
- Bayesian optimization

---

## ❓ CÂU HỎI THƯỜNG GẶP

### Q1: Tại sao dùng SVM mà không phải Decision Tree?

**Trả lời:**

```
SVM:
✅ Tốt cho high-dimensional data
✅ Effective với small-medium dataset
✅ Memory efficient (chỉ lưu support vectors)
❌ Slow khi training với big data
❌ Khó interpret

Decision Tree:
✅ Dễ hiểu, dễ interpret
✅ Fast training
❌ Dễ overfitting
❌ Kém stable (data thay đổi chút → tree khác hẳn)

→ Với medical data nhỏ (~1600 mẫu), SVM là lựa chọn tốt
```

### Q2: SMOTENC có tạo dữ liệu "giả" không an toàn không?

**Trả lời:**

```
✅ An toàn vì:
1. Chỉ tạo trên TRAIN set
2. TEST set giữ nguyên (dữ liệu thật)
3. Synthetic samples dựa trên láng giềng thực tế

❌ Không an toàn nếu:
- Apply SMOTE trước khi split train/test (data leakage!)
- Tạo quá nhiều synthetic samples (noise)

→ Dự án này implement đúng cách!
```

### Q3: Accuracy 85% có tốt không?

**Trả lời:**

```
Tùy context:

Medical diagnosis:
- Yêu cầu cao: >95%
- 85% là "khá tốt" nhưng chưa đủ deploy thực tế
- Cần improve hoặc dùng làm công cụ hỗ trợ (không thay thế bác sĩ)

Spam detection:
- 85% là tạm được
- Nhầm thư quan trọng thành spam → Vấn đề!

Product recommendation:
- 85% là rất tốt
- Sai 1 vài gợi ý không quá nghiêm trọng

→ Với breast cancer: Cần improve thêm!
```

### Q4: Có thể dùng Deep Learning không?

**Trả lời:**

```
Neural Networks cần:
✅ Big data (>10,000 mẫu)
✅ High computational resources
✅ Lots of hyperparameters to tune

Dự án này:
❌ Small dataset (~1600 mẫu)
❌ Limited features (13 cột)

→ SVM, Random Forest phù hợp hơn!

Nếu có thêm data:
→ Có thể thử CNN/RNN cho gene expression data
→ Hoặc Transfer Learning từ pretrained models
```

### Q5: Làm sao biết model có overfitting không?

**Kiểm tra:**

```python
# 1. So sánh train vs test accuracy
train_acc = model.score(X_train, y_train)
test_acc = model.score(X_test, y_test)

if train_acc - test_acc > 0.1:  # Chênh lệch >10%
    print("⚠️ Overfitting!")

# 2. Xem learning curve
from sklearn.model_selection import learning_curve

train_sizes, train_scores, test_scores = learning_curve(
    model, X, y, cv=5
)
# Plot: train_scores vs test_scores
# Nếu train cao mà test thấp → Overfitting

# 3. Cross-validation scores
from sklearn.model_selection import cross_val_score

scores = cross_val_score(model, X_train, y_train, cv=5)
print(f"CV scores: {scores}")
print(f"Mean: {scores.mean():.3f} (+/- {scores.std()*2:.3f})")
# Nếu std cao → Model unstable
```

---

## 📚 TÀI LIỆU THAM KHẢO

### Datasets

- [METABRIC Dataset](https://www.cbioportal.org/study/summary?id=brca_metabric)
- Kaggle: Breast Cancer Wisconsin

### Thuật toán

- [SVM Tutorial - StatQuest](https://www.youtube.com/watch?v=efR1C6CvhmE)
- [SMOTE Paper](https://arxiv.org/abs/1106.1813)
- Scikit-learn Documentation

### Books

- "Hands-On Machine Learning" - Aurélien Géron
- "Introduction to Machine Learning with Python" - Andreas Müller
- "Pattern Recognition and Machine Learning" - Christopher Bishop

---

## 🎉 KẾT LUẬN

Bạn đã hoàn thành việc xây dựng một mô hình AI dự đoán ung thư vú từ đầu đến cuối:

✅ **Xử lý dữ liệu:** Missing values, encoding, balancing  
✅ **Feature engineering:** Selection, scaling  
✅ **Model training:** SVM với hyperparameter tuning  
✅ **Evaluation:** Accuracy, F1-score, ROC-AUC, Confusion Matrix  
✅ **Deployment-ready:** Lưu model dưới dạng `.pkl`

**Next steps:**

1. Tích hợp với Backend API (FastAPI)
2. Xây dựng Frontend UI (React)
3. Deploy lên cloud (AWS/Azure/Heroku)
4. Thu thập feedback và cải thiện model

---

**📧 Nếu có thắc mắc, hãy:**

- Đọc lại phần giải thích
- Chạy từng cell trong notebook để hiểu
- Thử thay đổi tham số và xem kết quả

**Happy Learning! 🚀**
