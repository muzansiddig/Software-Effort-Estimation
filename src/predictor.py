import os
import joblib

from src.preprocessing import preprocess_input


MODEL_PATH = "models/random_forest_effort_model.joblib"


class EffortPredictor:

    def __init__(self, model_path: str = MODEL_PATH):

        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Model not found: {model_path}"
            )

        self.model = joblib.load(model_path)

        # Verify that the loaded model has feature information
        target_model = self.model.named_steps['rf'] if hasattr(self.model, "named_steps") else self.model
        if not hasattr(target_model, "feature_names_in_"):
            raise RuntimeError(
                "Loaded model does not contain feature_names_in_."
            )

    def predict(self, input_data: dict) -> float:

        # Convert original NASA93 inputs
        # into the exact 44 model features
        X = preprocess_input(input_data)

        # Verify compatibility before prediction
        target_model = self.model.named_steps['rf'] if hasattr(self.model, "named_steps") else self.model
        model_features = list(target_model.feature_names_in_)
        input_features = list(X.columns)

        if model_features != input_features:
            raise RuntimeError(
                "Preprocessed features do not match "
                "the trained model."
            )

        # Generate prediction
        prediction = self.model.predict(X)[0]

        return float(prediction)
