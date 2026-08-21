import os
import sys
from typing import Literal, Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ROOT_DIR)
ENV_PATH = os.path.join(ROOT_DIR, ".env")
if os.path.exists(ENV_PATH):
    load_dotenv(ENV_PATH)

from src.predictor import EffortPredictor
from src.schemas import ProjectInput as BaseProjectInput

app = FastAPI(
    title="Software Effort Estimation API",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(ROOT_DIR, "models", "random_forest_effort_model.joblib")
SUBPAES_MODEL_PATH = os.path.join(ROOT_DIR, "models", "subpaes_model.joblib")

predictor = None
MODEL_STATUS = "not_loaded"

try:
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}")
    predictor = EffortPredictor(model_path=MODEL_PATH)
    MODEL_STATUS = "loaded"
except Exception as exc:  # pragma: no cover - defensive runtime only
    MODEL_STATUS = f"failed_to_load: {exc}"
    predictor = None


class ProjectInput(BaseProjectInput):
    dataset: Literal["NASA93", "SUBPAES"] = "NASA93"


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"] = "user"
    content: str = Field(..., min_length=1)


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    project_context: Optional[str] = None
    dataset: Literal["NASA93", "SUBPAES"] = "NASA93"


async def _generate_local_assistant_reply(request: ChatRequest) -> str:
    latest_user_text = ""
    for message in reversed(request.messages):
        if message.role == "user":
            latest_user_text = message.content.lower()
            break

    project_context = request.project_context or ""
    if "estimate" in latest_user_text or "effort" in latest_user_text or "people" in latest_user_text:
        return (
            f"The current dataset is {request.dataset}. "
            "For effort planning, review the KLOC size, driver multipliers, and project mode before committing to a delivery schedule."
        )
    if "risk" in latest_user_text or "confidence" in latest_user_text or "uncertain" in latest_user_text:
        return "Use sensitivity analysis and review the high-impact cost drivers such as complexity, schedule, and team experience before finalizing the estimate."
    if "subpaes" in latest_user_text.lower() or request.dataset == "SUBPAES":
        if os.path.exists(SUBPAES_MODEL_PATH):
            return "The SUBPAES dataset is available and mapped for prediction. Confirm the model file in models/subpaes_model.joblib before production use."
        return "SUBPAES is configured as an optional dataset label. Add a trained subpaes_model.joblib file in the models folder to enable direct inference on that dataset."
    if project_context:
        return (
            f"Project context received: {project_context}. "
            "The estimate should be reviewed in relation to size, product complexity, and schedule pressure."
        )
    return "I can help interpret the estimate, explain the impact of cost drivers, and compare the project profile against similar delivery assumptions."


async def _generate_groq_reply(request: ChatRequest) -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return await _generate_local_assistant_reply(request)

    messages = []
    for message in request.messages:
        messages.append({"role": message.role, "content": message.content})

    if request.project_context:
        messages.append({"role": "system", "content": f"Project context: {request.project_context}"})

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "temperature": 0.2,
                    "messages": messages,
                },
            )
            payload = response.json()
            if response.status_code >= 400:
                raise RuntimeError(payload.get("error", {}).get("message", "Groq API request failed."))
            choices = payload.get("choices") or []
            if not choices:
                raise RuntimeError("Groq API returned no completion choices.")
            return choices[0]["message"]["content"].strip()
    except Exception:
        return await _generate_local_assistant_reply(request)


@app.get("/")
def read_root():
    return {
        "message": "Software Effort Estimation API is running",
        "model_status": MODEL_STATUS,
        "dataset": "NASA93",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy" if predictor is not None else "unhealthy",
        "model_status": MODEL_STATUS,
        "dataset": "NASA93",
    }


@app.post("/predict")
def predict(project: ProjectInput):
    if predictor is None:
        raise HTTPException(status_code=500, detail="Prediction model is not available.")

    try:
        dataset_name = project.dataset
        active_predictor = predictor
        if dataset_name == "SUBPAES" and os.path.exists(SUBPAES_MODEL_PATH):
            active_predictor = EffortPredictor(model_path=SUBPAES_MODEL_PATH)

        prediction = active_predictor.predict(project.model_dump(exclude={"dataset"}))
        return {
            "estimated_effort": round(float(prediction), 2),
            "unit": "person-months",
            "model": "Random Forest",
            "dataset": dataset_name,
            "success": True,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}")


from fastapi import Request, Depends
from jwt import InvalidTokenError


async def _verify_supabase_jwt(token: str) -> dict:
    """
    Verify a Supabase (Postgres + GoTrue) JWT using the configured JWKS URL.
    Returns the decoded payload on success or raises HTTPException on failure.
    """
    try:
        # Import PyJWT JWK client lazily to avoid hard dependency at import time
        from jwt import PyJWKClient, decode
    except Exception as e:  # pragma: no cover - runtime missing library
        raise HTTPException(status_code=500, detail=("PyJWT is required for JWT verification. "
                                                    "Install with: pip install PyJWT cryptography"))

    jwks_url = os.getenv("SUPABASE_JWKS_URL") or os.getenv("SUPABASE_URL", "") + "/auth/v1/.well-known/jwks.json"
    if not jwks_url:
        raise HTTPException(status_code=500, detail="JWKS URL not configured.")

    try:
        jwk_client = PyJWKClient(jwks_url)
        signing_key = jwk_client.get_signing_key_from_jwt(token)
        # do not require audience here; Supabase tokens may not include expected aud for local usage
        payload = decode(token, signing_key.key, algorithms=["RS256"], options={"verify_aud": False})
        return payload
    except InvalidTokenError as exc:
        raise HTTPException(status_code=401, detail=f"Invalid token: {exc}")
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {exc}")


async def get_current_user(request: Request):
    auth = request.headers.get("Authorization")
    if not auth:
        return None
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = auth.split(" ", 1)[1]
    payload = await _verify_supabase_jwt(token)
    return payload


@app.post("/assistant/chat")
async def chat(request: ChatRequest, user: dict = Depends(get_current_user)):
    # user may be None (anonymous) or a dict with token claims
    reply = await _generate_groq_reply(request)
    return {
        "reply": reply,
        "provider": "groq" if os.getenv("GROQ_API_KEY") else "local",
        "dataset": request.dataset,
        "user": {"sub": user.get('sub')} if user else None,
    }


@app.get('/auth/me')
async def auth_me(user: dict = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail='Not authenticated')
    # Return a small safe profile
    return {
        'user': {
            'id': user.get('sub') or user.get('sub'),
            'email': user.get('email'),
            'claims': {k: v for k, v in user.items() if k in ['aud', 'exp', 'iat', 'sub']}
        }
    }

