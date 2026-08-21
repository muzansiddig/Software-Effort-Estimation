from fastapi import FastAPI, HTTPException
from src.schemas import ProjectInput
from src.predictor import EffortPredictor

app = FastAPI(
    title="NASA93 Software Effort Estimation API",
    version="1.0.0"
)

# Initialize predictor and model status
predictor = None
MODEL_STATUS = "not_loaded"

try:
    predictor = EffortPredictor()
    MODEL_STATUS = "loaded"
except Exception as e:
    MODEL_STATUS = f"failed_to_load: {str(e)}"

# ============================================================
# Root
# ============================================================

@app.get("/")
def root():

    return {
        "status": "running",
        "service": "NASA93 Software Effort Estimation API",
        "model": "Random Forest",
        "model_status": MODEL_STATUS,
    }


# ============================================================
# Health Check
# ============================================================

@app.get("/health")
def health():

    if predictor is None:

        return {
            "status": "unhealthy",
            "model": MODEL_STATUS,
        }

    return {
        "status": "healthy",
        "model": "Random Forest",
        "model_status": "loaded",
    }


# ============================================================
# Prediction
# ============================================================

@app.post("/predict")
def predict(project: ProjectInput):

    if predictor is None:

        raise HTTPException(
            status_code=500,
            detail="Prediction model is not available."
        )

    try:

        prediction = predictor.predict(
            project.model_dump()
        )

        return {
            "success": True,
            "model": "Random Forest",
            "dataset": "NASA93",
            "estimated_effort": round(prediction, 4),
            "unit": "person-hours",
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )
