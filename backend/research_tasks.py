"""Research task configurations for account intelligence.

Two categories per account:
  1. account_summary — a short, current business snapshot for a seller.
  2. recent_news     — the last ~90 days of significant, sourced, actionable news.
"""

from datetime import date
from typing import Dict, Any, Optional


def _context_clause(context: Optional[str]) -> str:
    if not context or not context.strip():
        return ""
    return f" Additional context: {context.strip()}."


def _industry_clause(industry: Optional[str]) -> str:
    if not industry or not industry.strip():
        return ""
    return f" (industry: {industry.strip()})"


def get_research_tasks(
    account_name: str,
    industry: Optional[str] = None,
    context: Optional[str] = None,
) -> Dict[str, Dict[str, Any]]:
    """
    Return the 2 research category configs, each with a query and output_schema
    for the Tavily Research API. Aimed at a B2B seller, not a PR analyst.
    """
    ctx = _context_clause(context)
    ind = _industry_clause(industry)
    today = date.today().strftime("%B %d, %Y")

    return {
        # ── 1. Account Summary ────────────────────────────────────────────
        "account_summary": {
            "query": (
                f"As of {today}, give a concise, current business snapshot of "
                f"{account_name}{ind}. Cover: what the company does, its approximate "
                f"size (employee count and annual revenue ballpark), any notable parent "
                f"company or key subsidiaries, headquarters, and its current strategic "
                f"direction and priorities. Keep it to a few sentences — this is quick "
                f"context for a B2B sales rep, not an analyst report.{ctx}"
            ),
            "output_schema": {
                "properties": {
                    "company_name": {
                        "type": "string",
                        "description": "The official/canonical company name, properly cased (e.g. 'ServiceNow', 'Bank of Montreal', 'First Solar').",
                    },
                    "summary": {
                        "type": "string",
                        "description": "A 3-5 sentence current snapshot: what the company does, its size/revenue ballpark, any notable parent or subsidiaries, and its current strategic direction. Written for a seller who needs fast context.",
                    },
                    "industry": {
                        "type": "string",
                        "description": "Primary industry and sub-industry (e.g. 'Enterprise Software — IT Service Management').",
                    },
                    "headquarters": {
                        "type": "string",
                        "description": "Headquarters city and country/state.",
                    },
                    "employees": {
                        "type": "string",
                        "description": "Approximate employee count (e.g. '~28,000'). Return 'N/A' if unknown.",
                    },
                    "revenue": {
                        "type": "string",
                        "description": "Approximate annual revenue ballpark with fiscal year if known (e.g. '$10.9B (FY2024)'). Return 'N/A' if unknown.",
                    },
                    "parent_or_subsidiaries": {
                        "type": "string",
                        "description": "Notable parent company or key subsidiaries. Return 'Independent' if neither is notable.",
                    },
                    "strategic_direction": {
                        "type": "string",
                        "description": "One concise line on the company's current strategic priorities or direction.",
                    },
                    "website": {
                        "type": "string",
                        "description": "Primary website domain only (e.g. 'servicenow.com'). No protocol, no path.",
                    },
                },
                "required": ["company_name", "summary", "website"],
            },
        },
        # ── 2. Recent News ────────────────────────────────────────────────
        "recent_news": {
            "query": (
                f"As of {today}, find the most significant business news about "
                f"{account_name}{ind} from the last 90 days. Prioritize: quarterly "
                f"earnings, mergers & acquisitions, funding rounds, executive and "
                f"leadership changes, layoffs or restructuring, major product or strategy "
                f"announcements, market/geographic expansion, regulatory or legal "
                f"developments, and security incidents or breaches. For every item give "
                f"the exact date, a one-line headline, a short factual summary, the "
                f"publication name, and a direct source URL. For each item decide whether "
                f"it is a sales-relevant trigger a B2B seller could act on (e.g. a new CIO "
                f"or CxO, a new AI or digital initiative, funding, expansion, a stated pain "
                f"point) and, if so, give one concise suggested seller action. Only include "
                f"real, dated, sourced events — no speculation.{ctx}"
            ),
            "output_schema": {
                "properties": {
                    "news_items": {
                        "type": "array",
                        "description": "8-15 significant, dated, sourced news items from roughly the last 90 days, most recent first.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "date": {
                                    "type": "string",
                                    "description": "Event/publication date as YYYY-MM-DD (or YYYY-MM if the day is unknown). Used for sorting newest first.",
                                },
                                "headline": {
                                    "type": "string",
                                    "description": "A single-line headline summary of the event (max ~15 words).",
                                },
                                "summary": {
                                    "type": "string",
                                    "description": "1-2 sentence factual summary including key numbers or names.",
                                },
                                "category": {
                                    "type": "string",
                                    "description": "One of: 'Earnings', 'M&A', 'Funding', 'Leadership', 'Layoffs/Restructuring', 'Product/Strategy', 'Expansion', 'Regulatory/Legal', 'Security Incident', 'Partnership', 'Other'.",
                                },
                                "source_name": {
                                    "type": "string",
                                    "description": "Publication name (e.g. 'Reuters', 'Bloomberg', 'The Wall Street Journal').",
                                },
                                "url": {
                                    "type": "string",
                                    "description": "Direct URL to the source article.",
                                },
                                "actionable": {
                                    "type": "boolean",
                                    "description": "true if this is a sales-relevant trigger a B2B seller could act on; false if it is context only.",
                                },
                                "suggested_action": {
                                    "type": "string",
                                    "description": "If actionable, one concise sentence on what a seller should do and why (e.g. 'New CIO hired — strong moment for outreach on IT modernization'). If not actionable, return an empty string.",
                                },
                            },
                            "required": ["date", "headline", "actionable"],
                        },
                    },
                    "as_of": {
                        "type": "string",
                        "description": "The date this news snapshot reflects (today's date).",
                    },
                },
                "required": ["news_items"],
            },
        },
    }
