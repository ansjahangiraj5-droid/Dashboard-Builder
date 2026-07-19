from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.ai_service import analyse_dataset

router = APIRouter()


class ChatRequest(BaseModel):
    schema_info: list
    preview: list
    message: str
    history: list[dict] = []


class ChatResponse(BaseModel):
    reply: str


@router.post("/ask", response_model=ChatResponse)
async def ask(req: ChatRequest):
    try:
        reply = await analyse_dataset(req.schema_info, req.preview, req.message)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="AI service unavailable") from exc
    return ChatResponse(reply=reply)
