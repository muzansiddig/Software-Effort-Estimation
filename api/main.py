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


class ProjectInput(BaseModel):
    projectname: str = "HST"
    cat2: str = "scientific"
    forg: str = "g"
    center: str | int = 2
    year: int = 2026
    mode: str = "organic"
    equivphyskloc: float = 40.0
    rely: str = "n"
    data: str = "n"
    cplx: str = "n"
    time: str = "n"
    stor: str = "n"
    virt: str = "n"
    turn: str = "n"
    acap: str = "n"
    aexp: str = "n"
    pcap: str = "n"
    vexp: str = "n"
    lexp: str = "n"
    modp: str = "n"
    tool: str = "n"
    sced: str = "n"
    dataset: Literal["NASA93", "SUBPAES"] = "NASA93"


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


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"] = "user"
    content: str = Field(..., min_length=1)


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    project_context: Optional[str] = None
    dataset: Literal["NASA93", "SUBPAES"] = "NASA93"


class ExtractRequest(BaseModel):
    prompt: str = Field(..., min_length=1)


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
@app.get("/api")
def read_root():
    return {
        "message": "Software Effort Estimation API is running",
        "model_status": MODEL_STATUS,
        "dataset": "NASA93",
    }


@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy" if predictor is not None else "unhealthy",
        "model_status": MODEL_STATUS,
        "dataset": "NASA93",
    }


def _normalize_project_dict(raw: dict) -> dict:
    payload = dict(raw)
    payload["projectname"] = str(payload.get("projectname", "HST")).strip().lower()
    if payload["projectname"] not in {"y", "de", "erb", "gal", "hst", "slp", "spl"}:
        payload["projectname"] = "hst"

    cat_map = {
        "avionics": "avionicsmonitoring",
        "avionicsmonitoring": "avionicsmonitoring",
        "command_control": "monitor_control",
        "monitor_control": "monitor_control",
        "data_management": "datacapture",
        "mission_planning": "missionplanning",
        "missionplanning": "missionplanning",
        "launch_processing": "launchprocessing",
        "launchprocessing": "launchprocessing",
        "real_time_control": "realdataprocessing",
        "realdataprocessing": "realdataprocessing",
        "scientific": "science",
        "science": "science",
        "simulation": "simulation",
        "simulation_and_training": "simulation",
        "operating_system": "operatingsystem",
        "operatingsystem": "operatingsystem",
        "utility": "utility",
        "application_ground": "application_ground",
        "ground_combined": "application_ground",
        "flight_combined": "application_ground",
    }
    normalized_cat = str(payload.get("cat2", "science")).strip().lower().replace(" ", "_").replace("-", "_")
    payload["cat2"] = cat_map.get(normalized_cat, normalized_cat if normalized_cat in {
        "application_ground","avionicsmonitoring","batchdataprocessing","communications","datacapture",
        "launchprocessing","missionplanning","monitor_control","operatingsystem","realdataprocessing",
        "science","simulation","utility"
    } else "science")

    payload["forg"] = str(payload.get("forg", "g")).strip().lower()
    payload["forg"] = payload["forg"] if payload["forg"] in {"g", "f"} else "g"

    center_value = payload.get("center", 2)
    payload["center"] = str(center_value).strip().lower().replace("center ", "")
    if payload["center"] not in {"1", "2", "3", "5", "6"}:
        payload["center"] = "2"

    payload["year"] = int(payload.get("year", 2026))
    payload["mode"] = str(payload.get("mode", "organic")).strip().lower()
    if payload["mode"] not in {"organic", "semidetached", "embedded"}:
        payload["mode"] = "organic"

    payload["equivphyskloc"] = float(payload.get("equivphyskloc", payload.get("kloc", 40.0)))

    for field in ["rely", "data", "cplx", "time", "stor", "virt", "turn", "acap", "aexp", "pcap", "vexp", "lexp", "modp", "tool", "sced"]:
        value = str(payload.get(field, "n")).strip().lower()
        payload[field] = value if value in {"vl", "l", "n", "h", "vh", "xh"} else "n"

    return payload


@app.post("/predict")
@app.post("/api/predict")
def predict(project: ProjectInput):
    if predictor is None:
        raise HTTPException(status_code=500, detail="Prediction model is not available.")

    try:
        normalized = _normalize_project_dict(project.model_dump(exclude_none=True))
        dataset_name = normalized.get("dataset", "NASA93")
        active_predictor = predictor
        if dataset_name == "SUBPAES" and os.path.exists(SUBPAES_MODEL_PATH):
            active_predictor = EffortPredictor(model_path=SUBPAES_MODEL_PATH)

        prediction = active_predictor.predict(normalized)
        return {
            "estimated_effort": round(float(prediction), 2),
            "unit": "person-months",
            "model": "Random Forest",
            "dataset": dataset_name,
            "success": True,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}")


async def _generate_extract_fallback(prompt: str) -> dict:
    lower_prompt = prompt.lower()
    payload = {
        "projectname": "PROJECT",
        "cat2": "scientific" if "scientific" in lower_prompt else "avionics" if "avionics" in lower_prompt else "business",
        "forg": "g",
        "center": 2,
        "year": 2026,
        "mode": "embedded" if "embedded" in lower_prompt else "organic",
        "equivphyskloc": 45.0,
        "rely": "h",
        "data": "n",
        "cplx": "h",
        "time": "n",
        "stor": "n",
        "virt": "n",
        "turn": "n",
        "acap": "h",
        "aexp": "n",
        "pcap": "h",
        "vexp": "n",
        "lexp": "n",
        "modp": "h",
        "tool": "h",
        "sced": "h",
    }
    return payload


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
@app.post("/api/chat")
async def chat(request: ChatRequest, user: dict = Depends(get_current_user)):
    # user may be None (anonymous) or a dict with token claims
    reply = await _generate_groq_reply(request)
    return {
        "reply": reply,
        "provider": "groq" if os.getenv("GROQ_API_KEY") else "local",
        "dataset": request.dataset,
        "user": {"sub": user.get('sub')} if user else None,
    }


@app.post("/api/extract")
async def extract(request: ExtractRequest):
    extracted = await _generate_extract_fallback(request.prompt)
    return {"extracted": extracted, "provider": "rule-engine"}


@app.get('/auth/me')
@app.get('/api/auth/me')
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

