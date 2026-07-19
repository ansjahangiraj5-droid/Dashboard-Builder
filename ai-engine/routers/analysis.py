from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from services.data_processor import (
    load_dataframe,
    compute_schema,
    compute_preview,
    detect_correlations,
    detect_anomalies,
)
import pandas as pd

router = APIRouter()


class AnalysisResponse(BaseModel):
    row_count: int
    column_count: int
    schema_info: list
    preview: list
    correlations: list
    numeric_anomalies: dict


@router.post("/analyse", response_model=AnalysisResponse)
async def analyse_file(
    file: UploadFile = File(...),
    mime_type: str = Form(...),
):
    allowed = {
        "text/csv",
        "application/json",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
    if mime_type not in allowed:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    content = await file.read()
    if len(content) > 100 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File exceeds 100 MB limit")

    try:
        df = load_dataframe(content, mime_type, file.filename or "")
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Could not parse file: {exc}") from exc

    schema = compute_schema(df)
    preview = compute_preview(df)
    correlations = detect_correlations(df)

    numeric_cols = df.select_dtypes(include="number").columns.tolist()
    anomalies: dict = {}
    for col in numeric_cols[:10]:
        anomalies[col] = detect_anomalies(df[col].dropna())

    return AnalysisResponse(
        row_count=len(df),
        column_count=len(df.columns),
        schema_info=schema,
        preview=preview,
        correlations=correlations,
        numeric_anomalies=anomalies,
    )
