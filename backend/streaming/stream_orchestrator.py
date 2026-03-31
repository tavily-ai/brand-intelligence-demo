"""Parallel fan-out orchestrator — runs 5 brand research categories concurrently."""

import json
import asyncio
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import AsyncGenerator, Dict, Any, List, Optional

from .tavily_stream import stream_tavily_research
from .event_handler import process_stream_event
from ..research_tasks import get_research_tasks

logger = logging.getLogger(__name__)

# --- Debug logging -----------------------------------------------------------
LOG_DIR = Path(__file__).resolve().parent.parent.parent / "logs"


def _write_category_log(
    brand_name: str,
    category: str,
    raw_accumulated: Dict[str, str],
    parsed_data: Dict[str, Any],
    sources: List[Dict[str, Any]],
):
    """Append one JSON line per category completion to logs/<brand>_<timestamp>.jsonl"""
    try:
        LOG_DIR.mkdir(parents=True, exist_ok=True)
        safe_name = "".join(c if c.isalnum() or c in "-_" else "_" for c in brand_name)
        ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        log_path = LOG_DIR / f"{safe_name}_{category}_{ts}.jsonl"

        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "brand": brand_name,
            "category": category,
            "raw_accumulated": raw_accumulated,
            "parsed_data": parsed_data,
            "source_count": len(sources),
        }
        with open(log_path, "a") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
        logger.info(f"Logged {category} result → {log_path}")
    except Exception as e:
        logger.warning(f"Failed to write debug log for {category}: {e}")


CATEGORIES = [
    "brand_overview",
    "media_press",
    "public_perception",
    "analyst_competitive",
    "risks_opportunities",
]

CATEGORY_LABELS = {
    "brand_overview": "Brand Overview",
    "media_press": "Media & Press",
    "public_perception": "Public Perception",
    "analyst_competitive": "Analyst & Competitive",
    "risks_opportunities": "Risks & Opportunities",
}


async def _research_category(
    category: str,
    query: str,
    output_schema: Dict[str, Any],
    api_key: str,
    event_queue: asyncio.Queue,
    brand_name: str = "",
):
    """Run a single category research and push events onto the shared queue."""
    accumulated_content: Dict[str, str] = {}
    all_sources: List[Dict[str, Any]] = []

    try:
        async for event_data in stream_tavily_research(
            api_key=api_key,
            query=query,
            output_schema=output_schema,
        ):
            if isinstance(event_data, dict):
                if event_data.get("type") == "error":
                    await event_queue.put(
                        f'data: {json.dumps({"type": "error", "category": category, "message": event_data.get("message", "Unknown error")})}\n\n'
                    )
                    return

                for sse_event in process_stream_event(event_data, category, accumulated_content, all_sources):
                    await event_queue.put(sse_event)

        # De-duplicate sources by URL
        seen_urls = set()
        unique_sources = []
        for s in all_sources:
            url = s.get("url", "")
            if url and url not in seen_urls:
                seen_urls.add(url)
                unique_sources.append({"title": s.get("title", ""), "url": url, "favicon": s.get("favicon")})

        # Parse accumulated content — try to JSON-decode string values
        parsed = {}
        for k, v in accumulated_content.items():
            try:
                parsed[k] = json.loads(v)
            except (json.JSONDecodeError, TypeError):
                parsed[k] = v

        # Debug log: write raw + parsed data to logs/
        _write_category_log(
            brand_name=brand_name,
            category=category,
            raw_accumulated=dict(accumulated_content),
            parsed_data=parsed,
            sources=unique_sources,
        )

        await event_queue.put(
            f'data: {json.dumps({"type": "category_complete", "category": category, "data": parsed, "sources": unique_sources})}\n\n'
        )

    except Exception as e:
        logger.error(f"Error researching {category}: {e}")
        await event_queue.put(
            f'data: {json.dumps({"type": "error", "category": category, "message": str(e)})}\n\n'
        )


async def run_brand_research(
    brand_name: str,
    context: Optional[str],
    api_key: str,
) -> AsyncGenerator[str, None]:
    """
    Fan-out 5 parallel Tavily Research streams and merge events into a single SSE stream.
    """
    tasks_config = get_research_tasks(brand_name, context)

    # Start event
    yield f'data: {json.dumps({"type": "start", "categories": list(CATEGORY_LABELS.values()), "brand_name": brand_name})}\n\n'

    event_queue: asyncio.Queue = asyncio.Queue()

    # Launch all 5 categories in parallel
    async_tasks = []
    for cat in CATEGORIES:
        cfg = tasks_config[cat]
        task = asyncio.create_task(
            _research_category(
                category=cat,
                query=cfg["query"],
                output_schema=cfg["output_schema"],
                api_key=api_key,
                event_queue=event_queue,
                brand_name=brand_name,
            )
        )
        async_tasks.append(task)

    # Merge events from all categories
    active = set(range(len(async_tasks)))
    completed_categories: Dict[str, Dict[str, Any]] = {}
    all_category_sources: Dict[str, List[Dict[str, Any]]] = {}

    while active:
        try:
            event = await asyncio.wait_for(event_queue.get(), timeout=0.1)

            # Track category_complete events for the final summary
            if event.startswith("data: "):
                try:
                    ev = json.loads(event[6:].strip())
                    if ev.get("type") == "category_complete":
                        cat = ev["category"]
                        completed_categories[cat] = ev.get("data", {})
                        all_category_sources[cat] = ev.get("sources", [])
                except (json.JSONDecodeError, KeyError):
                    pass

            yield event

        except asyncio.TimeoutError:
            done_indices = [i for i in active if async_tasks[i].done()]
            for i in done_indices:
                active.remove(i)

            if not active:
                # Drain remaining
                while not event_queue.empty():
                    try:
                        event = event_queue.get_nowait()
                        if event.startswith("data: "):
                            try:
                                ev = json.loads(event[6:].strip())
                                if ev.get("type") == "category_complete":
                                    cat = ev["category"]
                                    completed_categories[cat] = ev.get("data", {})
                                    all_category_sources[cat] = ev.get("sources", [])
                            except (json.JSONDecodeError, KeyError):
                                pass
                        yield event
                    except asyncio.QueueEmpty:
                        break
                break

    # Wait for all tasks
    await asyncio.gather(*async_tasks, return_exceptions=True)

    # Final complete event with all data
    yield f'data: {json.dumps({"type": "complete", "data": {"brand_name": brand_name, "context": context, **completed_categories}, "sources": all_category_sources})}\n\n'
