import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.ai_service import generate_insights

router = APIRouter()


class InsightsRequest(BaseModel):
    schema_info: list
    statistics: dict


class InsightsResponse(BaseModel):
    insights: list


@router.post("/generate", response_model=InsightsResponse)
async def generate(req: InsightsRequest):
    try:
        raw = await generate_insights(req.schema_info, req.statistics)
        start = raw.find("[")
        end = raw.rfind("]") + 1
        insights = json.loads(raw[start:end]) if start != -1 else []
    except Exception as exc:
        raise HTTPException(status_code=500, detail="AI generation failed") from exc
    return InsightsResponse(insights=insights)
