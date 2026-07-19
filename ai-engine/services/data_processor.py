import pandas as pd
import numpy as np
from io import BytesIO
from typing import Any


def load_dataframe(file_content: bytes, mime_type: str, filename: str) -> pd.DataFrame:
    """Load a file into a Pandas DataFrame based on MIME type."""
    buf = BytesIO(file_content)
    if mime_type == "text/csv" or filename.endswith(".csv"):
        return pd.read_csv(buf)
    if mime_type in (
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ) or filename.endswith((".xlsx", ".xls")):
        return pd.read_excel(buf)
    if mime_type == "application/json" or filename.endswith(".json"):
        return pd.read_json(buf)
    raise ValueError(f"Unsupported file type: {mime_type}")


def compute_schema(df: pd.DataFrame) -> list[dict[str, Any]]:
    """Return column metadata for the dataset schema."""
    schema = []
    for col in df.columns:
        col_info: dict[str, Any] = {
            "name": col,
            "dtype": str(df[col].dtype),
            "nullable": bool(df[col].isnull().any()),
            "unique_count": int(df[col].nunique()),
            "null_count": int(df[col].isnull().sum()),
        }
        if pd.api.types.is_numeric_dtype(df[col]):
            col_info["stats"] = {
                "min": _safe_val(df[col].min()),
                "max": _safe_val(df[col].max()),
                "mean": _safe_val(df[col].mean()),
                "median": _safe_val(df[col].median()),
                "std": _safe_val(df[col].std()),
            }
        schema.append(col_info)
    return schema


def compute_preview(df: pd.DataFrame, rows: int = 10) -> list[dict[str, Any]]:
    """Return first N rows as JSON-safe list of dicts."""
    return df.head(rows).replace({np.nan: None}).to_dict(orient="records")


def detect_correlations(df: pd.DataFrame, threshold: float = 0.7) -> list[dict[str, Any]]:
    """Return strongly correlated column pairs."""
    numeric = df.select_dtypes(include="number")
    if numeric.shape[1] < 2:
        return []
    corr = numeric.corr()
    pairs = []
    cols = list(corr.columns)
    for i in range(len(cols)):
        for j in range(i + 1, len(cols)):
            val = corr.iloc[i, j]
            if abs(val) >= threshold and not np.isnan(val):
                pairs.append({"col_a": cols[i], "col_b": cols[j], "correlation": round(float(val), 4)})
    return pairs


def detect_anomalies(series: pd.Series) -> dict[str, Any]:
    """Simple IQR-based outlier detection."""
    q1 = series.quantile(0.25)
    q3 = series.quantile(0.75)
    iqr = q3 - q1
    lower = q1 - 1.5 * iqr
    upper = q3 + 1.5 * iqr
    outliers = series[(series < lower) | (series > upper)]
    return {
        "lower_bound": round(float(lower), 4),
        "upper_bound": round(float(upper), 4),
        "outlier_count": int(len(outliers)),
        "outlier_pct": round(float(len(outliers) / len(series) * 100), 2),
    }


def _safe_val(val: Any) -> Any:
    if isinstance(val, (np.integer,)):
        return int(val)
    if isinstance(val, (np.floating,)):
        return None if np.isnan(val) else round(float(val), 4)
    return val
