"""Parallel fan-out orchestrator — runs the 2 account research categories concurrently."""

import json
import asyncio
import logging
from typing import AsyncGenerator, Dict, Any, List, Optional

from .tavily_stream import stream_tavily_research
from .event_handler import process_stream_event
from ..research_tasks import get_research_tasks

logger = logging.getLogger(__name__)


CATEGORIES = [
    "account_summary",
    "recent_news",
]

CATEGORY_LABELS = {
    "account_summary": "Account Summary",
    "recent_news": "Recent News",
}


async def _research_category(
    category: str,
    query: str,
    output_schema: Dict[str, Any],
    api_key: str,
    event_queue: asyncio.Queue,
    account_name: str = "",
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

        await event_queue.put(
            f'data: {json.dumps({"type": "category_complete", "category": category, "data": parsed, "sources": unique_sources})}\n\n'
        )

    except Exception as e:
        logger.error(f"Error researching {category}: {e}")
        await event_queue.put(
            f'data: {json.dumps({"type": "error", "category": category, "message": str(e)})}\n\n'
        )


async def run_account_research(
    account_name: str,
    industry: Optional[str],
    context: Optional[str],
    api_key: str,
) -> AsyncGenerator[str, None]:
    """
    Fan-out the account research categories as parallel Tavily Research streams
    and merge their events into a single SSE stream.
    """
    tasks_config = get_research_tasks(account_name, industry, context)

    # Start event
    yield f'data: {json.dumps({"type": "start", "categories": list(CATEGORY_LABELS.values()), "account_name": account_name})}\n\n'

    event_queue: asyncio.Queue = asyncio.Queue()

    # Launch all categories in parallel
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
                account_name=account_name,
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
    yield f'data: {json.dumps({"type": "complete", "data": {"account_name": account_name, "industry": industry, "context": context, **completed_categories}, "sources": all_category_sources})}\n\n'
