# QUY TRÌNH TRAINING MODELS

## Tổng Quan

Sau khi chia dữ liệu thành tập train (70%) và test (30%), hệ thống thực hiện training 3 models khác nhau với các quy trình tối ưu hóa độc lập.

---

## 1. SUPPORT VECTOR MACHINE (SVM)

### Bước 1: Xây Dựng Pipeline
```python
pipe = ImbPipeline([
    ("scaler", StandardScaler()),
    ("svc", SVC(class_weight="balanced", probability=True, random_state=42))
])
```

**Giải thích:**
- **StandardScaler**: Chuẩn hóa dữ liệu về mean=0, std=1 (bắt buộc với SVM)
- **SVC**: Support Vector Classifier với:
  - `class_weight="balanced"`: Tự động cân bằng trọng số cho các class
  - `probability=True`: Cho phép predict probabilities
  - `random_state=42`: Đảm bảo kết quả reproducible

### Bước 2: Định Nghĩa Grid Search Parameters
```python
param_grid = {
    "svc__C": [0.1, 1, 10],
    "svc__kernel": ["linear", "rbf"],
    "svc__gamma": ["scale", "auto"]
}
```

**Tham số tối ưu hóa:**
- **C (Regularization)**: [0.1, 1, 10] - Kiểm soát trade-off giữa margin và classification error
- **kernel**: ["linear", "rbf"] - Loại kernel function
- **gamma**: ["scale", "auto"] - Hệ số cho RBF kernel

**Tổng số combinations**: 3 × 2 × 2 = 12 models

### Bước 3: GridSearchCV với Cross-Validation
```python
grid = GridSearchCV(
    pipe, param_grid,
    cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
    scoring="f1_macro",
    n_jobs=-1,
    verbose=2
)
grid.fit(X_train, y_train)
```

**Chi tiết:**
- **StratifiedKFold (5-fold)**: Đảm bảo tỷ lệ classes giống nhau trong mỗi fold
- **scoring="f1_macro"**: Tối ưu hóa theo F1-Score macro (trung bình không trọng số)
- **n_jobs=-1**: Sử dụng tất cả CPU cores
- **Process**: Mỗi combination được train 5 lần (5 folds) → Tổng 12 × 5 = 60 trainings

### Bước 4: Lấy Best Model và Đánh Giá
```python
best_pipe = grid.best_estimator_
y_pred = best_pipe.predict(X_test)
```

**Kết quả:**
- Best parameters được chọn dựa trên F1-macro score cao nhất
- Model được đánh giá trên test set chưa từng thấy

---

## 2. RANDOM FOREST

### Bước 1: Xây Dựng Pipeline
```python
rf_pipe = ImbPipeline([
    ("scaler", StandardScaler()),
    ("rf", RandomForestClassifier(random_state=42, class_weight="balanced"))
])
```

**Giải thích:**
- **StandardScaler**: Chuẩn hóa (optional cho RF nhưng giúp consistency)
- **RandomForestClassifier**: Ensemble của nhiều decision trees

### Bước 2: Định Nghĩa Grid Search Parameters
```python
rf_param_grid = {
    "rf__n_estimators": [100, 200],
    "rf__max_depth": [None, 10, 20],
    "rf__min_samples_leaf": [1, 2]
}
```

**Tham số tối ưu hóa:**
- **n_estimators**: [100, 200] - Số lượng cây trong forest
- **max_depth**: [None, 10, 20] - Độ sâu tối đa của mỗi cây (None = unlimited)
- **min_samples_leaf**: [1, 2] - Số mẫu tối thiểu tại leaf node

**Tổng số combinations**: 2 × 3 × 2 = 12 models

### Bước 3: GridSearchCV với Cross-Validation
```python
rf_grid = GridSearchCV(
    rf_pipe,
    rf_param_grid,
    cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
    scoring="f1_macro",
    n_jobs=-1,
    verbose=1
)
rf_grid.fit(X_train, y_train)
```

**Process**: 12 combinations × 5 folds = 60 trainings

### Bước 4: Lấy Best Model và Đánh Giá
```python
best_rf_pipe = rf_grid.best_estimator_
y_pred_rf = best_rf_pipe.predict(X_test)
```

**Đặc điểm:**
- Random Forest có thể extract feature importances
- Robust hơn với overfitting so với single decision tree

---

## 3. DECISION TREE

### Bước 1: Baseline Model
```python
dt_base = DecisionTreeClassifier(
    criterion='entropy',
    max_depth=None,
    min_samples_split=2,
    min_samples_leaf=1,
    random_state=42
)
dt_base.fit(X_train, y_train)
```

**Baseline model** được train trước để làm benchmark

### Bước 2: Cross-Validation Baseline
```python
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_val_score(dt_base, X_train, y_train, cv=cv, scoring='f1_macro')
```

**Mục đích**: Đánh giá baseline performance trước khi tối ưu hóa

### Bước 3: Định Nghĩa Grid Search Parameters
```python
param_grid = {
    "criterion": ["gini", "entropy"],
    "max_depth": [5, 8, 10, 15, None],
    "min_samples_split": [2, 5, 10, 20],
    "min_samples_leaf": [1, 2, 5, 10]
}
```

**Tham số tối ưu hóa:**
- **criterion**: ["gini", "entropy"] - Hàm đo độ hỗn loạn
- **max_depth**: [5, 8, 10, 15, None] - Giới hạn độ sâu (prevent overfitting)
- **min_samples_split**: [2, 5, 10, 20] - Số mẫu tối thiểu để split node
- **min_samples_leaf**: [1, 2, 5, 10] - Số mẫu tối thiểu tại leaf

**Tổng số combinations**: 2 × 5 × 4 × 4 = 160 models

### Bước 4: GridSearchCV với Cross-Validation
```python
grid = GridSearchCV(
    estimator=DecisionTreeClassifier(random_state=42),
    param_grid=param_grid,
    cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
    scoring="f1_macro",
    n_jobs=-1,
    verbose=2
)
grid.fit(X_train, y_train)
best_dt = grid.best_estimator_
```

**Process**: 160 combinations × 5 folds = 800 trainings (nhiều nhất trong 3 models)

### Bước 5: Lấy Best Model và Đánh Giá
```python
y_pred_dt = best_dt.predict(X_test)
```

**Đặc điểm:**
- Decision Tree có thể visualize được cây quyết định
- Dễ interpret và explain predictions
- Có thể extract rules dạng text

---

## SO SÁNH QUY TRÌNH

| Aspect | SVM | Random Forest | Decision Tree |
|--------|-----|---------------|---------------|
| **Pipeline** | Có (Scaler + SVC) | Có (Scaler + RF) | Không |
| **Số combinations** | 12 | 12 | 160 |
| **Tổng trainings** | 60 | 60 | 800 |
| **Thời gian** | Trung bình | Lâu | Nhanh |
| **Interpretability** | Thấp | Trung bình | Cao |
| **Feature Scaling** | Bắt buộc | Optional | Không cần |

---

## EVALUATION METRICS

Cả 3 models đều được đánh giá bằng:

1. **Accuracy**: Tỷ lệ dự đoán đúng tổng thể
2. **F1-Score (Macro)**: Trung bình F1 của tất cả classes (không trọng số)
3. **Precision (Macro)**: Độ chính xác trung bình
4. **Recall (Macro)**: Độ bao phủ trung bình
5. **Confusion Matrix**: Ma trận nhầm lẫn
6. **Classification Report**: Báo cáo chi tiết từng class

---

## LƯU MODEL

Sau khi training và đánh giá, tất cả best models được lưu vào thư mục `model_v2/`:

```python
# SVM
joblib.dump(best_pipe, "model_v2/svm.pkl")

# Random Forest
joblib.dump(best_rf_pipe, "model_v2/best_model_random_forest.pkl")

# Decision Tree
joblib.dump(best_dt, "model_v2/decision_tree_best.pkl")
```

---

## KẾT LUẬN

- **SVM**: Tốt nhất cho classification với boundary phức tạp
- **Random Forest**: Robust, ít overfitting, có feature importance
- **Decision Tree**: Nhanh, dễ interpret, nhưng dễ overfit nếu không tune cẩn thận

Tất cả 3 models sử dụng **StratifiedKFold 5-fold Cross-Validation** và tối ưu hóa theo **F1-Macro Score** để đảm bảo hiệu suất tốt trên cả 5 classes.
