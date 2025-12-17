import React, { useState } from "react";
import type { MultiModelPredictionResult } from "../types";
import { CANCER_TYPE_DESCRIPTIONS } from "../types";

interface PredictionDetailsProps {
  prediction: MultiModelPredictionResult;
}

const PredictionDetails: React.FC<PredictionDetailsProps> = ({
  prediction,
}) => {
  const [expandedProbs, setExpandedProbs] = useState<Record<string, boolean>>({});

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

  const getModelIcon = (modelName: string): string => {
    if (modelName === "SVM") return "🤖";
    if (modelName === "Random Forest") return "🌲";
    if (modelName === "Decision Tree") return "🌳";
    return "📊";
  };

  const toggleProbabilities = (modelName: string) => {
    setExpandedProbs((prev) => ({
      ...prev,
      [modelName]: !prev[modelName],
    }));
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <div className="prediction-details">
      {/* Individual Model Results */}
      <div className="models-grid">
        {prediction.predictions.map((modelPred, index) => (
          <div
            key={modelPred.model_name}
            className="model-card"
            style={{
              borderLeftColor: getColorByType(modelPred.cancer_type_code),
            }}
          >
            <div className="model-header">
              <h5>
                {getModelIcon(modelPred.model_name)}{" "}
                {modelPred.model_name}
              </h5>
              {modelPred.confidence !== undefined && (
                <span className="confidence-badge">
                  {formatPercentage(modelPred.confidence)}
                </span>
              )}
            </div>

            <div className="model-prediction">
              <p className="model-cancer-type">
                {modelPred.cancer_type_detailed}
              </p>
              <p className="model-description">
                {CANCER_TYPE_DESCRIPTIONS[modelPred.cancer_type_code] ||
                  "Không có thông tin chi tiết"}
              </p>
            </div>

            {/* Probabilities */}
            {modelPred.probabilities &&
              Object.keys(modelPred.probabilities).length > 0 && (
                <div className="probabilities-section">
                  <button
                    className="toggle-probabilities-btn"
                    onClick={() => toggleProbabilities(modelPred.model_name)}
                  >
                    {expandedProbs[modelPred.model_name]
                      ? "▼ Ẩn xác suất"
                      : "▶ Hiển thị xác suất"}
                  </button>
                  {expandedProbs[modelPred.model_name] && (
                    <div className="probabilities-list">
                      {Object.entries(modelPred.probabilities)
                        .sort(([, a], [, b]) => b - a)
                        .map(([className, prob]) => (
                          <div key={className} className="probability-item">
                            <span className="prob-class">{className}:</span>
                            <span className="prob-value">
                              {formatPercentage(prob)}
                            </span>
                            <div className="prob-bar-container">
                              <div
                                className="prob-bar"
                                style={{
                                  width: `${prob * 100}%`,
                                  backgroundColor: (() => {
                                    const code = Object.keys(CANCER_TYPE_DESCRIPTIONS).find(
                                      (k) =>
                                        CANCER_TYPE_DESCRIPTIONS[parseInt(k)] === className
                                    );
                                    return getColorByType(
                                      code !== undefined ? parseInt(code) : modelPred.cancer_type_code
                                    );
                                  })(),
                                }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PredictionDetails;
