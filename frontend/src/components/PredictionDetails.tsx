import React from "react";
import type { PredictionResult } from "../types";
import { CANCER_TYPE_DESCRIPTIONS } from "../types";

interface PredictionDetailsProps {
  prediction: PredictionResult;
}

const PredictionDetails: React.FC<PredictionDetailsProps> = ({
  prediction,
}) => {
  const getColorByType = (code: number): string => {
    const colors = {
      0: "#3498db", // Blue
      1: "#e74c3c", // Red
      2: "#f39c12", // Orange
      3: "#9b59b6", // Purple
      4: "#e67e22", // Dark Orange
    };
    return colors[code as keyof typeof colors] || "#95a5a6";
  };

  return (
    <div className="prediction-details">
      <div
        className="main-result"
        style={{ borderLeftColor: getColorByType(prediction.cancer_type_code) }}
      >
        <h4>Loại ung thư được dự đoán:</h4>
        <p className="cancer-type">{prediction.cancer_type_detailed}</p>
        <p className="cancer-description">
          {CANCER_TYPE_DESCRIPTIONS[prediction.cancer_type_code] ||
            "Không có thông tin chi tiết"}
        </p>
      </div>
    </div>
  );
};

export default PredictionDetails;
