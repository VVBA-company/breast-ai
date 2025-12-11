# 🎗️ Breast Cancer Prediction System

Hệ thống dự đoán loại ung thư vú chi tiết sử dụng Machine Learning với 3 models: SVM, Random Forest, và Decision Tree.

## 📋 Yêu Cầu Hệ Thống

- **Python**: 3.12
- **Node.js**: 18+
- **uv**: Package manager cho Python

## 🚀 Hướng Dẫn Cài Đặt (Windows)

### 1️⃣ Cài đặt uv

Mở **PowerShell** và chạy:
```powershell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### 2️⃣ Clone Repository

```bash
git clone https://github.com/VVBA-company/breast-ai.git
cd breast-ai
```

### 3️⃣ Cài Đặt Backend (Python)

```bash
# Tạo virtual environment với Python 3.12
uv venv --python 3.12

# Kích hoạt virtual environment
.venv\Scripts\activate

# Cài đặt dependencies
uv sync
```

### 4️⃣ Cài Đặt Frontend (React)

```bash
cd frontend
npm install
cd ..
```

## ▶️ Chạy Ứng Dụng

### Chạy Backend (Terminal 1)

```bash
cd backend
uvicorn app:app --reload --port 8000
```

Backend sẽ chạy tại: http://localhost:8000

### Chạy Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Frontend sẽ chạy tại: http://localhost:5173

## 📁 Cấu Trúc Thư Mục

```
breast-ai/
├── backend/              # FastAPI backend
│   ├── app.py           # Main API server
│   └── services/        # Business logic
├── frontend/            # React frontend
│   └── src/            # Source code
├── model_v2/           # Trained models
│   ├── best_model.pkl              # SVM model
│   ├── random_forest.pkl           # Random Forest model
│   └── decision_tree_best.pkl      # Decision Tree model
├── dataset/            # Training data
├── main.ipynb         # Jupyter notebook để train models
└── pyproject.toml     # Python dependencies
```

## 🔧 Troubleshooting

### Lỗi: Module not found
```bash
# Đảm bảo đã activate virtual environment và chạy uv sync
uv sync
```

### Lỗi: Port đã được sử dụng
```bash
# Thay đổi port cho backend
uvicorn app:app --reload --port 8001

# Thay đổi port cho frontend (sửa trong vite.config.ts)
```

### Lỗi: Models không load được
```bash
# Kiểm tra models có tồn tại trong thư mục model_v2/
ls -la model_v2/
```

## 📊 Train Models Mới

Nếu muốn train lại models:

```bash
# Mở Jupyter notebook
jupyter notebook main.ipynb

# Hoặc dùng VS Code với Jupyter extension
```

## 🌐 API Endpoints

- `GET /` - Health check
- `POST /predict` - Dự đoán với SVM model
- `POST /predict-all` - Dự đoán với tất cả models

## 📝 License

MIT License

## 👥 Contributors

VVBA Company
