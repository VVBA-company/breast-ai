"""
Model Service Layer
===================

Service layer để xử lý predictions từ nhiều models.
Tách biệt business logic khỏi API endpoints.
"""

from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from pathlib import Path


class ModelPredictionResult:
    """Kết quả prediction từ 1 model"""
    
    def __init__(
        self,
        model_name: str,
        cancer_type_code: int,
        cancer_type_detailed: str,
        confidence: Optional[float] = None,
        probabilities: Optional[Dict[str, float]] = None,
    ):
        self.model_name = model_name
        self.cancer_type_code = cancer_type_code
        self.cancer_type_detailed = cancer_type_detailed
        self.confidence = confidence
        self.probabilities = probabilities or {}
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for API response"""
        result = {
            "model_name": self.model_name,
            "cancer_type_detailed": self.cancer_type_detailed,
            "cancer_type_code": self.cancer_type_code,
        }
        
        if self.confidence is not None:
            result["confidence"] = round(self.confidence, 4)
        
        if self.probabilities:
            result["probabilities"] = {
                k: round(v, 4) for k, v in self.probabilities.items()
            }
        
        return result


class ModelService:
    """Service để quản lý và predict với nhiều models"""
    
    def __init__(
        self,
        models: Dict[str, any],
        cancer_type_mapping: Dict[int, str],
    ):
        """
        Initialize ModelService
        
        Args:
            models: Dictionary với key là model name, value là model object
            cancer_type_mapping: Mapping từ code sang tên cancer type
        """
        self.models = models
        self.cancer_type_mapping = cancer_type_mapping
    
    def predict_with_model(
        self,
        model_name: str,
        X: pd.DataFrame,
    ) -> ModelPredictionResult:
        """
        Predict với 1 model cụ thể
        
        Args:
            model_name: Tên model (key trong self.models)
            X: Input data đã được encode
        
        Returns:
            ModelPredictionResult object
        
        Raises:
            ValueError: Nếu model_name không tồn tại
            RuntimeError: Nếu prediction fail
        """
        if model_name not in self.models:
            raise ValueError(f"Model '{model_name}' not found")
        
        model = self.models[model_name]
        
        try:
            # Predict
            prediction = model.predict(X)[0]
            prediction_code = int(prediction)
            
            # Get cancer type name
            cancer_type_detailed = self.cancer_type_mapping.get(
                prediction_code, "Unknown"
            )
            
            # Get probabilities if available
            # Confidence và Probabilities dựa vào predict_proba() của model
            confidence = None
            probabilities = None
            
            # Xử lý Pipeline (SVM model thường là Pipeline với scaler + svc)
            if hasattr(model, "named_steps"):
                # Đây là Pipeline, kiểm tra final estimator
                final_estimator = None
                # Tìm SVC trong pipeline
                for step_name, step_obj in model.named_steps.items():
                    if hasattr(step_obj, "predict_proba"):
                        final_estimator = step_obj
                        break
                
                if final_estimator is not None:
                    try:
                        proba = model.predict_proba(X)[0]
                        confidence = float(np.max(proba))
                        probabilities = {
                            self.cancer_type_mapping.get(i, f"Class {i}"): float(prob)
                            for i, prob in enumerate(proba)
                        }
                    except Exception as e:
                        print(f"Warning: Could not get probability for {model_name} (Pipeline): {e}")
            elif hasattr(model, "predict_proba"):
                # Model thuần (không phải Pipeline), ví dụ Random Forest
                try:
                    # predict_proba() trả về array probabilities cho tất cả classes
                    # Ví dụ: [0.1, 0.85, 0.03, 0.01, 0.01] cho 5 classes
                    proba = model.predict_proba(X)[0]
                    
                    # Confidence = probability cao nhất (của class được predict)
                    # Đây là độ tin cậy của model về prediction của nó
                    # Ví dụ: nếu predict class 1 với proba = 0.85 -> confidence = 0.85 (85%)
                    confidence = float(np.max(proba))
                    
                    # Probabilities = dict chứa probability của TẤT CẢ classes
                    # Giúp user thấy model nghĩ gì về từng loại ung thư
                    probabilities = {
                        self.cancer_type_mapping.get(i, f"Class {i}"): float(prob)
                        for i, prob in enumerate(proba)
                    }
                except Exception as e:
                    print(f"Warning: Could not get probability for {model_name}: {e}")
            
            return ModelPredictionResult(
                model_name=model_name,
                cancer_type_code=prediction_code,
                cancer_type_detailed=cancer_type_detailed,
                confidence=confidence,
                probabilities=probabilities,
            )
        
        except Exception as e:
            raise RuntimeError(
                f"Prediction failed for model '{model_name}': {str(e)}"
            )
    
    def predict_all(self, X: pd.DataFrame) -> List[ModelPredictionResult]:
        """
        Predict với tất cả models
        
        Args:
            X: Input data đã được encode
        
        Returns:
            List of ModelPredictionResult
        """
        results = []
        
        for model_name in self.models.keys():
            try:
                result = self.predict_with_model(model_name, X)
                results.append(result)
            except Exception as e:
                print(f"Error predicting with {model_name}: {e}")
                # Continue with other models even if one fails
                continue
        
        return results
    
    def calculate_consensus(
        self,
        predictions: List[ModelPredictionResult],
    ) -> Dict:
        """
        Tính consensus từ nhiều predictions
        
        Logic:
        1. Mỗi model "vote" cho 1 cancer type (dựa vào prediction của nó)
        2. Consensus = cancer type được vote nhiều nhất
        3. Nếu có tie (cùng số vote), chọn model có confidence cao hơn
        4. Agreement = True nếu TẤT CẢ models đều vote cùng 1 type
        
        Ví dụ:
        - SVM predicts: Class 1
        - Random Forest predicts: Class 1
        -> Consensus: Class 1, Agreement: True (2/2 models đồng ý)
        
        - SVM predicts: Class 1 (confidence: 0.85)
        - Random Forest predicts: Class 2 (confidence: 0.65)
        -> Consensus: Class 1 (vì có confidence cao hơn khi tie)
        -> Agreement: False (1/2 models đồng ý)
        
        Args:
            predictions: List of ModelPredictionResult
        
        Returns:
            Dict với consensus information:
            - cancer_type_detailed: Loại ung thư được vote nhiều nhất
            - cancer_type_code: Code của loại ung thư đó
            - agreement: True nếu tất cả models đồng ý, False nếu không
            - vote_count: Số models vote cho kết quả consensus
            - total_models: Tổng số models
        """
        if not predictions:
            return {
                "cancer_type_detailed": "Unknown",
                "cancer_type_code": -1,
                "agreement": False,
                "vote_count": 0,
                "total_models": 0,
            }
        
        # Count votes for each cancer type
        # Mỗi model = 1 vote cho cancer type mà nó predict
        votes = {}
        # Lưu confidence của mỗi vote để xử lý tie-breaking
        vote_confidences = {}
        
        for pred in predictions:
            code = pred.cancer_type_code
            votes[code] = votes.get(code, 0) + 1
            
            # Lưu confidence (nếu có) để dùng khi tie-breaking
            if pred.confidence is not None:
                if code not in vote_confidences:
                    vote_confidences[code] = []
                vote_confidences[code].append(pred.confidence)
        
        # Find most common prediction (cancer type được vote nhiều nhất)
        max_votes = max(votes.values())
        candidates = [code for code, count in votes.items() if count == max_votes]
        
        # Nếu có tie (nhiều classes cùng số vote), chọn class có confidence trung bình cao hơn
        if len(candidates) > 1:
            # Tính average confidence cho mỗi candidate
            candidate_scores = {}
            for code in candidates:
                if code in vote_confidences and vote_confidences[code]:
                    candidate_scores[code] = np.mean(vote_confidences[code])
                else:
                    # Nếu không có confidence, dùng 0.5 (trung bình)
                    candidate_scores[code] = 0.5
            
            # Chọn candidate có confidence cao nhất
            most_common_code = max(candidate_scores.items(), key=lambda x: x[1])[0]
        else:
            most_common_code = candidates[0]
        
        vote_count = votes[most_common_code]
        total_models = len(predictions)
        
        # Agreement: True nếu TẤT CẢ models đều vote cùng 1 type
        # (tức là vote_count == total_models)
        agreement = vote_count == total_models
        
        return {
            "cancer_type_detailed": self.cancer_type_mapping.get(
                most_common_code, "Unknown"
            ),
            "cancer_type_code": most_common_code,
            "agreement": agreement,
            "vote_count": vote_count,
            "total_models": total_models,
        }

