import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.ai_service import recommend_kpis

router = APIRouter()


class KpiRequest(BaseModel):
    schema_info: list
    business_context: str = "general business"


class KpiResponse(BaseModel):
    kpis: list


@router.post("/recommend", response_model=KpiResponse)
async def recommend(req: KpiRequest):
    try:
        raw = await recommend_kpis(req.schema_info, req.business_context)
        start = raw.find("[")
        end = raw.rfind("]") + 1
        kpis = json.loads(raw[start:end]) if start != -1 else []
    except Exception as exc:
        raise HTTPException(status_code=500, detail="KPI generation failed") from exc
    return KpiResponse(kpis=kpis)
