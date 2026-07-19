from openai import AsyncOpenAI
from config import settings
import logging

logger = logging.getLogger(__name__)

_client: AsyncOpenAI | None = None


def get_openai_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.openai_api_key)
    return _client


async def chat_completion(system_prompt: str, user_message: str, model: str = "gpt-4o-mini") -> str:
    """Call OpenAI chat completion and return the assistant message text."""
    client = get_openai_client()
    response = await client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        temperature=0.2,
        max_tokens=2048,
    )
    return response.choices[0].message.content or ""


async def analyse_dataset(schema: list, preview: list, user_question: str) -> str:
    system_prompt = (
        "You are an expert data analyst and business intelligence advisor. "
        "You receive dataset schema and preview rows, then answer the user's question "
        "with precise, actionable insights. Respond in structured markdown."
    )
    context = (
        f"Dataset Schema:\n{schema}\n\n"
        f"Preview (first 10 rows):\n{preview}\n\n"
        f"Question: {user_question}"
    )
    return await chat_completion(system_prompt, context)


async def generate_insights(schema: list, stats: dict) -> str:
    system_prompt = (
        "You are a business intelligence expert. Analyse the provided dataset statistics "
        "and generate 5 key business insights in JSON format with keys: "
        "type, title, summary, confidence (0-1). Types: TREND, ANOMALY, CORRELATION, SUMMARY, KPI."
    )
    payload = f"Schema: {schema}\n\nStatistics: {stats}"
    return await chat_completion(system_prompt, payload, model="gpt-4o-mini")


async def recommend_kpis(schema: list, business_context: str) -> str:
    system_prompt = (
        "You are a KPI strategy consultant. Based on the dataset columns and business context, "
        "recommend 6 relevant KPIs in JSON format with keys: "
        "name, description, formula, chart_type (bar/line/pie/scatter/area), priority (1-5)."
    )
    payload = f"Dataset columns: {schema}\n\nBusiness context: {business_context}"
    return await chat_completion(system_prompt, payload, model="gpt-4o-mini")
