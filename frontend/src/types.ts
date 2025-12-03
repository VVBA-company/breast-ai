// Types cho dự án Breast Cancer Prediction

export interface PatientData {
  type_of_breast_surgery: "BREAST CONSERVING" | "MASTECTOMY" | "";
  cancer_type: "Breast Cancer" | "Breast Sarcoma" | "";
  cellularity: "High" | "Low" | "Moderate" | "";
  chemotherapy: 0 | 1;
  "pam50_+_claudin-low_subtype":
    | "Basal"
    | "Her2"
    | "LumA"
    | "LumB"
    | "NC"
    | "Normal"
    | "claudin-low"
    | "";
  neoplasm_histologic_grade: 1 | 2 | 3;
  her2_status: "Negative" | "Positive" | "";
  hormone_therapy: 0 | 1;
  lymph_nodes_examined_positive: number;
  nottingham_prognostic_index: number;
  pr_status: "Negative" | "Positive" | "";
  radio_therapy: 0 | 1;
}

export interface PredictionResult {
  cancer_type_detailed: string;
  cancer_type_code: number;
}

export interface APIError {
  detail: string;
}

// Constants
export const CANCER_TYPE_DESCRIPTIONS: Record<number, string> = {
  0: "Ung thư vú chung",
  1: "Carcinoma ống tuyến xâm lấn (Invasive Ductal Carcinoma)",
  2: "Carcinoma tiểu thùy xâm lấn (Invasive Lobular Carcinoma)",
  3: "Carcinoma nhầy hỗn hợp xâm lấn (Invasive Mixed Mucinous Carcinoma)",
  4: "Carcinoma ống và tiểu thùy hỗn hợp (Mixed Ductal and Lobular Carcinoma)",
};

export const SURGERY_TYPE_DESCRIPTIONS: Record<string, string> = {
  "BREAST CONSERVING":
    "Phẫu thuật bảo tồn vú - Giữ lại hầu hết mô vú",
  MASTECTOMY: "Phẫu thuật cắt bỏ vú - Loại bỏ toàn bộ hoặc hầu hết mô vú",
};

export const PAM50_DESCRIPTIONS: Record<string, string> = {
  Basal: "Basal-like - Thường âm tính với thụ thể nội tiết",
  Her2: "HER2-enriched - Mức HER2 cao",
  LumA: "Luminal A - Thụ thể nội tiết dương tính, tiên lượng tốt",
  LumB: "Luminal B - Thụ thể nội tiết dương tính, tiên lượng trung bình",
  Normal: "Normal-like - Tương tự mô vú bình thường",
  NC: "Not Classified - Không thể phân loại",
  "claudin-low": "Claudin-low - Phân nhóm đặc biệt có đặc tính tế bào gốc",
};
