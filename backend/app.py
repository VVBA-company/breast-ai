from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import Literal
import joblib
import numpy as np
import pandas as pd
from pathlib import Path

# ==================== CONFIGURATION ====================
MODEL_PATH = "../model/best_model.pkl"

# Encoding maps
ENCODING_MAPS = {
    "type_of_breast_surgery": {"BREAST CONSERVING": 0, "MASTECTOMY": 1},
    "cancer_type": {"Breast Cancer": 0, "Breast Sarcoma": 1},
    "cellularity": {"High": 0, "Low": 1, "Moderate": 2},
    "pam50_+_claudin-low_subtype": {
        "Basal": 0,
        "Her2": 1,
        "LumA": 2,
        "LumB": 3,
        "NC": 4,
        "Normal": 5,
        "claudin-low": 6,
    },
    "her2_status": {"Negative": 0, "Positive": 1},
    "pr_status": {"Negative": 0, "Positive": 1},
}

# Output decoding
CANCER_TYPE_DETAILED = {
    0: "Breast",
    1: "Breast Invasive Ductal Carcinoma",
    2: "Breast Invasive Lobular Carcinoma",
    3: "Breast Invasive Mixed Mucinous Carcinoma",
    4: "Breast Mixed Ductal and Lobular Carcinoma",
}

# Feature order (exclude cancer_type_detailed as it's the target)
FEATURE_ORDER = [
    "type_of_breast_surgery",
    "cancer_type",
    "cellularity",
    "chemotherapy",
    "pam50_+_claudin-low_subtype",
    "neoplasm_histologic_grade",
    "her2_status",
    "hormone_therapy",
    "lymph_nodes_examined_positive",
    "nottingham_prognostic_index",
    "pr_status",
    "radio_therapy",
]

# ==================== FASTAPI APP ====================
app = FastAPI(
    title="Breast Cancer Type Prediction API",
    description="API dự đoán loại ung thư vú dựa trên thông tin lâm sàng",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],  # React dev server
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Load model at startup
try:
    model = joblib.load(MODEL_PATH)
    print(f"✅ Model loaded successfully from {MODEL_PATH}")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None


# ==================== PYDANTIC MODELS ====================
class PatientInput(BaseModel):
    type_of_breast_surgery: Literal["BREAST CONSERVING", "MASTECTOMY"] = Field(
        ..., description="Loại phẫu thuật vú"
    )
    cancer_type: Literal["Breast Cancer", "Breast Sarcoma"] = Field(
        ..., description="Loại ung thư"
    )
    cellularity: Literal["High", "Low", "Moderate"] = Field(
        ..., description="Mật độ tế bào"
    )
    chemotherapy: Literal[0, 1] = Field(..., description="Hóa trị (0: No, 1: Yes)")
    pam50_claudin_low_subtype: Literal[
        "Basal", "Her2", "LumA", "LumB", "NC", "Normal", "claudin-low"
    ] = Field(..., alias="pam50_+_claudin-low_subtype", description="PAM50 subtype")

    neoplasm_histologic_grade: Literal[1, 2, 3] = Field(
        ..., description="Độ mô học (1-3)"
    )
    her2_status: Literal["Negative", "Positive"] = Field(
        ..., description="Trạng thái HER2"
    )
    hormone_therapy: Literal[0, 1] = Field(
        ..., description="Liệu pháp hormone (0: No, 1: Yes)"
    )
    lymph_nodes_examined_positive: int = Field(
        ..., ge=0, description="Số hạch bạch huyết dương tính"
    )
    nottingham_prognostic_index: float = Field(
        ..., ge=0, description="Chỉ số tiên lượng Nottingham"
    )
    pr_status: Literal["Negative", "Positive"] = Field(..., description="Trạng thái PR")
    radio_therapy: Literal[0, 1] = Field(..., description="Xạ trị (0: No, 1: Yes)")

    class Config:
        schema_extra = {
            "example": {
                "type_of_breast_surgery": "MASTECTOMY",
                "cancer_type": "Breast Cancer",
                "cellularity": "High",
                "chemotherapy": 1,
                "pam50_+_claudin-low_subtype": "LumA",
                "neoplasm_histologic_grade": 3,
                "her2_status": "Positive",
                "hormone_therapy": 1,
                "lymph_nodes_examined_positive": 5,
                "nottingham_prognostic_index": 5.4,
                "pr_status": "Positive",
                "radio_therapy": 1,
            }
        }


class PredictionOutput(BaseModel):
    cancer_type_detailed: str = Field(..., description="Loại ung thư chi tiết")
    cancer_type_code: int = Field(..., description="Mã số loại ung thư")


# ==================== HELPER FUNCTIONS ====================
def encode_input(patient_data: PatientInput) -> pd.DataFrame:
    """Chuyển đổi input sang format model cần"""
    data_dict = patient_data.dict(by_alias=True)

    # Encode categorical features
    for feature, mapping in ENCODING_MAPS.items():
        if feature in data_dict:
            data_dict[feature] = mapping[data_dict[feature]]

    # Create DataFrame with correct feature order
    df = pd.DataFrame([data_dict])
    df = df[FEATURE_ORDER]

    return df


# ==================== API ENDPOINTS ====================
@app.get("/")
def read_root():
    """Health check endpoint"""
    return {
        "message": "Breast Cancer Prediction API",
        "status": "running",
        "model_loaded": model is not None,
    }


@app.post("/predict", response_model=PredictionOutput)
async def predict(patient: PatientInput):
    """
    Dự đoán loại ung thư vú chi tiết

    - **Input**: Thông tin lâm sàng bệnh nhân
    - **Output**: Loại ung thư chi tiết và độ tin cậy
    """
    if model is None:
        raise HTTPException(status_code=500, detail="Model chưa được load")

    try:
        # Encode input
        X = encode_input(patient)

        # Predict
        prediction = model.predict(X)[0]

        # Get prediction probabilities if available
        confidence = None
        if hasattr(model, "predict_proba"):
            try:
                # Lấy pipeline's final estimator (SVC)
                final_model = model.named_steps.get("svc", model)

                # Kiểm tra xem SVC có được train với probability=True
                if hasattr(final_model, "predict_proba"):
                    proba = model.predict_proba(X)[0]
                    confidence = float(np.max(proba))
                else:
                    # SVC không có probability=True
                    confidence = None
            except Exception as e:
                print(f"Warning: Could not get probability: {e}")
                confidence = None

        # Decode prediction
        cancer_type = CANCER_TYPE_DETAILED.get(prediction, "Unknown")

        return PredictionOutput(
            cancer_type_detailed=cancer_type,
            cancer_type_code=int(prediction),  # -1 nghĩa là không có confidence
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Lỗi dự đoán: {str(e)}")


@app.get("/model-info")
def model_info():
    """Thông tin về model và features"""
    if model is None:
        raise HTTPException(status_code=500, detail="Model chưa được load")

    return {
        "model_type": str(type(model)),
        "features": FEATURE_ORDER,
        "output_classes": CANCER_TYPE_DETAILED,
        "encoding_maps": ENCODING_MAPS,
    }


# ==================== RUN SERVER ====================
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

# uvicorn app:app --reload
