"""FastAPI server for Account Intelligence — fresh, sourced account news for sellers."""

import os
import sys
import logging
from pathlib import Path

import httpx
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv

# Ensure backend package is importable
backend_dir = Path(__file__).parent
project_dir = backend_dir.parent
if str(project_dir) not in sys.path:
    sys.path.insert(0, str(project_dir))

from backend.models import AccountResearchRequest, ExtractRequest, ExtractResponse
from backend.content_cleaner import clean_extracted_content
from backend.streaming import run_account_research

TAVILY_API_BASE = "https://api.tavily.com"

load_dotenv(project_dir / ".env")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Account Intelligence",
    description="Fresh, sourced account news for sellers — powered by the Tavily Research API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def health_check():
    return {"status": "healthy"}


@app.post("/api/account/stream")
async def account_stream(request: AccountResearchRequest, fastapi_request: Request):
    """Stream account research (summary + recent news) as SSE."""
    api_key = fastapi_request.headers.get("Authorization") or os.getenv("TAVILY_API_KEY")

    if not api_key:
        import json

        async def error_stream():
            yield f'data: {json.dumps({"type": "error", "message": "Tavily API key is required. Set TAVILY_API_KEY or pass Authorization header."})}\n\n'

        return StreamingResponse(error_stream(), media_type="text/event-stream")

    logger.info(f"Starting account research for: {request.account_name} (industry: {request.industry})")

    return StreamingResponse(
        run_account_research(
            account_name=request.account_name,
            industry=request.industry,
            context=request.context,
            api_key=api_key,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/api/extract", response_model=ExtractResponse)
async def extract(request: ExtractRequest, fastapi_request: Request):
    """Extract clean content for a single URL via the Tavily Extract API.

    Used by the UI to show, for a cited source, exactly what Tavily returns
    from that URL (alongside the research queries and the URL itself).
    """
    api_key = fastapi_request.headers.get("Authorization") or os.getenv("TAVILY_API_KEY")
    if not api_key:
        return ExtractResponse(url=request.url, error="Tavily API key is required.")

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{TAVILY_API_BASE}/extract",
                headers={"Authorization": api_key, "Content-Type": "application/json"},
                json={"urls": [request.url]},
            )
        if resp.status_code != 200:
            return ExtractResponse(url=request.url, error=f"Extract failed ({resp.status_code}).")

        data = resp.json()
        results = data.get("results", [])
        if results:
            r = results[0]
            return ExtractResponse(
                url=r.get("url", request.url),
                title=r.get("title"),
                content=clean_extracted_content(r.get("raw_content") or ""),
            )

        failed = data.get("failed_results", [])
        reason = (failed[0].get("error") if failed and isinstance(failed[0], dict) else None) or "No content could be extracted from this URL."
        return ExtractResponse(url=request.url, error=reason)
    except Exception as e:
        logger.error(f"Extract error for {request.url}: {e}")
        return ExtractResponse(url=request.url, error=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
