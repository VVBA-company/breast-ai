import { useState } from "react";
import "./App.css";
import type { PatientData, PredictionResult } from "./types";
import PredictionDetails from "./components/PredictionDetails";

function App() {
  const [formData, setFormData] = useState<PatientData>({
    type_of_breast_surgery: "",
    cancer_type: "",
    cellularity: "",
    chemotherapy: 0,
    "pam50_+_claudin-low_subtype": "",
    neoplasm_histologic_grade: 1,
    her2_status: "",
    hormone_therapy: 0,
    lymph_nodes_examined_positive: 0,
    nottingham_prognostic_index: 0,
    pr_status: "",
    radio_therapy: 0,
  });

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name.includes("therapy") ||
        name === "chemotherapy" ||
        name === "radio_therapy" ||
        name === "neoplasm_histologic_grade" ||
        name === "lymph_nodes_examined_positive"
          ? Number(value)
          : name === "nottingham_prognostic_index"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PredictionResult = await response.json();
      setPrediction(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during prediction"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎗️ Hệ Thống Dự Đoán Ung Thư Vú</h1>
        <p>Nhập thông tin lâm sàng để dự đoán loại ung thư vú chi tiết</p>
      </header>

      <main className="main-content">
        <form onSubmit={handleSubmit} className="patient-form">
          <div className="form-grid">
            {/* Left Column */}
            <div className="form-column">
              <div className="form-section">
                <h3>Thông Tin Phẫu Thuật & Ung Thư</h3>

                <div className="form-group">
                  <label htmlFor="type_of_breast_surgery">
                    Loại phẫu thuật vú:
                  </label>
                  <select
                    id="type_of_breast_surgery"
                    name="type_of_breast_surgery"
                    value={formData.type_of_breast_surgery}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn loại phẫu thuật</option>
                    <option value="BREAST CONSERVING">
                      Breast Conserving (Bảo tồn vú)
                    </option>
                    <option value="MASTECTOMY">Mastectomy (Cắt bỏ vú)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="cancer_type">Loại ung thư:</label>
                  <select
                    id="cancer_type"
                    name="cancer_type"
                    value={formData.cancer_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn loại ung thư</option>
                    <option value="Breast Cancer">
                      Breast Cancer (Ung thư vú)
                    </option>
                    <option value="Breast Sarcoma">
                      Breast Sarcoma (U xơ vú)
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="cellularity">
                    Mật độ tế bào (Cellularity):
                  </label>
                  <select
                    id="cellularity"
                    name="cellularity"
                    value={formData.cellularity}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn mật độ tế bào</option>
                    <option value="High">High (Cao)</option>
                    <option value="Moderate">Moderate (Trung bình)</option>
                    <option value="Low">Low (Thấp)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="neoplasm_histologic_grade">
                    Độ mô học (Histologic Grade 1-3):
                  </label>
                  <select
                    id="neoplasm_histologic_grade"
                    name="neoplasm_histologic_grade"
                    value={formData.neoplasm_histologic_grade}
                    onChange={handleInputChange}
                    required
                  >
                    <option value={1}>Grade 1 (Độ 1)</option>
                    <option value={2}>Grade 2 (Độ 2)</option>
                    <option value={3}>Grade 3 (Độ 3)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Middle Column */}
            <div className="form-column">
              <div className="form-section">
                <h3>Phân Tử & Trạng Thái Thụ Thể</h3>

                <div className="form-group">
                  <label htmlFor="pam50_+_claudin-low_subtype">
                    Phân loại PAM50 Subtype:
                  </label>
                  <select
                    id="pam50_+_claudin-low_subtype"
                    name="pam50_+_claudin-low_subtype"
                    value={formData["pam50_+_claudin-low_subtype"]}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn phân loại PAM50</option>
                    <option value="Basal">Basal</option>
                    <option value="Her2">Her2</option>
                    <option value="LumA">LumA</option>
                    <option value="LumB">LumB</option>
                    <option value="Normal">Normal</option>
                    <option value="NC">NC</option>
                    <option value="claudin-low">claudin-low</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="her2_status">Trạng thái HER2:</label>
                  <select
                    id="her2_status"
                    name="her2_status"
                    value={formData.her2_status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn trạng thái HER2</option>
                    <option value="Positive">Positive (Dương tính)</option>
                    <option value="Negative">Negative (Âm tính)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="pr_status">Trạng thái PR:</label>
                  <select
                    id="pr_status"
                    name="pr_status"
                    value={formData.pr_status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn trạng thái PR</option>
                    <option value="Positive">Positive (Dương tính)</option>
                    <option value="Negative">Negative (Âm tính)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="lymph_nodes_examined_positive">
                    Số hạch bạch huyết dương tính:
                  </label>
                  <input
                    type="number"
                    id="lymph_nodes_examined_positive"
                    name="lymph_nodes_examined_positive"
                    value={formData.lymph_nodes_examined_positive}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="form-column">
              <div className="form-section">
                <h3>Điều Trị & Thông Số Lâm Sàng</h3>

                <div className="form-group">
                  <label htmlFor="chemotherapy">Hóa trị (Chemotherapy):</label>
                  <select
                    id="chemotherapy"
                    name="chemotherapy"
                    value={formData.chemotherapy}
                    onChange={handleInputChange}
                    required
                  >
                    <option value={0}>Không</option>
                    <option value={1}>Có</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="hormone_therapy">
                    Liệu pháp nội tiết (Hormone Therapy):
                  </label>
                  <select
                    id="hormone_therapy"
                    name="hormone_therapy"
                    value={formData.hormone_therapy}
                    onChange={handleInputChange}
                    required
                  >
                    <option value={0}>Không</option>
                    <option value={1}>Có</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="radio_therapy">Xạ trị (Radiotherapy):</label>
                  <select
                    id="radio_therapy"
                    name="radio_therapy"
                    value={formData.radio_therapy}
                    onChange={handleInputChange}
                    required
                  >
                    <option value={0}>Không</option>
                    <option value={1}>Có</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="nottingham_prognostic_index">
                    Chỉ số tiên lượng Nottingham (NPI):
                  </label>
                  <input
                    type="number"
                    id="nottingham_prognostic_index"
                    name="nottingham_prognostic_index"
                    value={formData.nottingham_prognostic_index}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "🔄 Đang dự đoán..." : "🔍 Dự Đoán"}
          </button>
        </form>

        {error && (
          <div className="error-message">
            <h3>❌ Lỗi</h3>
            <p>{error}</p>
          </div>
        )}

        {prediction && (
          <div className="prediction-result">
            <h3>🎯 Kết Quả Dự Đoán</h3>
            <PredictionDetails prediction={prediction} />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>
          ⚠️ Lưu ý: Kết quả này chỉ mang tính chất tham khảo. Vui lòng tham khảo
          ý kiến bác sĩ chuyên khoa để được tư vấn y khoa chuyên nghiệp.
        </p>
      </footer>
    </div>
  );
}

export default App;
