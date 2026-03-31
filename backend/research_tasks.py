"""Research task configurations for the 5 brand intelligence categories."""

from datetime import date
from typing import Dict, Any, Optional


def _context_clause(context: Optional[str]) -> str:
    if not context or not context.strip():
        return ""
    return f" Additional context: {context.strip()}"


def get_research_tasks(
    brand_name: str, context: Optional[str] = None
) -> Dict[str, Dict[str, Any]]:
    """
    Return the 5 research category configs, each with a query and output_schema
    for the Tavily Research API.
    """
    ctx = _context_clause(context)
    today = date.today().strftime("%B %d, %Y")

    return {
        # ── 1. Brand Overview ─────────────────────────────────────────────
        "brand_overview": {
            "query": (
                f"As of {today}, provide a comprehensive brand profile for {brand_name}. "
                f"Include: brand positioning and tagline, parent company (if any), headquarters, "
                f"year founded, industry, key products or services (top 3-5), "
                f"target audience and customer segments, brand values or mission statement, "
                f"and primary website domain.{ctx}"
            ),
            "output_schema": {
                "properties": {
                    "tagline": {
                        "type": "string",
                        "description": "The brand's official tagline or a concise one-sentence positioning statement (max 15 words)",
                    },
                    "description": {
                        "type": "string",
                        "description": "What the brand does and what it is known for in 2-3 sentences",
                    },
                    "parent_company": {
                        "type": "string",
                        "description": "Parent company or holding company if applicable, otherwise 'Independent'",
                    },
                    "headquarters": {
                        "type": "string",
                        "description": "Headquarters city and country",
                    },
                    "founded": {
                        "type": "string",
                        "description": "Year founded or launched",
                    },
                    "industry": {
                        "type": "string",
                        "description": "Primary industry and sub-industry",
                    },
                    "key_products": {
                        "type": "array",
                        "description": "Top 3-5 key products or services",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": {
                                    "type": "string",
                                    "description": "Product or service name",
                                },
                                "description": {
                                    "type": "string",
                                    "description": "One-sentence description",
                                },
                            },
                        },
                    },
                    "target_audience": {
                        "type": "string",
                        "description": "Primary target audience and customer segments",
                    },
                    "brand_values": {
                        "type": "string",
                        "description": "Core brand values, mission statement, or brand promise",
                    },
                    "website": {
                        "type": "string",
                        "description": "Primary website domain (e.g. 'cisco.com'). Just the domain, no protocol.",
                    },
                    "summary": {
                        "type": "string",
                        "description": "A concise 2-3 sentence executive summary of the brand's market position and identity",
                    },
                },
                "required": ["description", "summary", "website"],
            },
        },
        # ── 2. Media & Press Sentiment ────────────────────────────────────
        "media_press": {
            "query": (
                f"As of {today}, research recent media and press coverage of {brand_name} "
                f"from the past 12 months. Find: major press stories and their tone "
                f"(positive, neutral, or negative), any PR crises or controversies, "
                f"notable earned media highlights (awards, recognitions, viral moments), "
                f"and overall journalist sentiment toward the brand. "
                f"Include the source URL for each press item.{ctx}"
            ),
            "output_schema": {
                "properties": {
                    "overall_tone": {
                        "type": "string",
                        "description": "Overall media tone as a single word: 'positive', 'mixed', or 'negative'",
                    },
                    "press_items": {
                        "type": "array",
                        "description": "5-8 notable press stories from the past 12 months, most recent first",
                        "items": {
                            "type": "object",
                            "properties": {
                                "headline": {
                                    "type": "string",
                                    "description": "Article headline or concise title",
                                },
                                "source": {
                                    "type": "string",
                                    "description": "Publication name (e.g. 'TechCrunch', 'Reuters')",
                                },
                                "date": {
                                    "type": "string",
                                    "description": "Approximate publication date (e.g. 'March 2025')",
                                },
                                "sentiment": {
                                    "type": "string",
                                    "description": "One of: 'positive', 'neutral', 'negative'",
                                },
                                "summary": {
                                    "type": "string",
                                    "description": "1-2 sentence summary of the article",
                                },
                                "url": {
                                    "type": "string",
                                    "description": "URL to the article",
                                },
                            },
                        },
                    },
                    "pr_crises": {
                        "type": "string",
                        "description": "Any PR crises or major controversies in the past 12 months. Say 'No major PR crises' if none.",
                    },
                    "earned_media_highlights": {
                        "type": "string",
                        "description": "Notable earned media: awards, analyst recognitions, viral campaigns, or positive press milestones",
                    },
                    "summary": {
                        "type": "string",
                        "description": "Executive summary of media sentiment in 2-3 sentences",
                    },
                },
                "required": ["overall_tone", "summary"],
            },
        },
        # ── 3. Public Perception ──────────────────────────────────────────
        "public_perception": {
            "query": (
                f"As of {today}, research public perception and community sentiment about {brand_name}. "
                f"Find: discussions on Reddit, Twitter/X, LinkedIn, and Hacker News about this brand. "
                f"Look for review scores on platforms like G2, Glassdoor, Trustpilot, or TrustRadius. "
                f"Identify recurring praise themes and recurring complaint themes from users and employees. "
                f"Include source URLs where possible.{ctx}"
            ),
            "output_schema": {
                "properties": {
                    "overall_sentiment": {
                        "type": "string",
                        "description": "Overall public sentiment as a single word: 'positive', 'mixed', or 'negative'",
                    },
                    "review_scores": {
                        "type": "array",
                        "description": "Review scores from major platforms. Include 3-6 platforms.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "platform": {
                                    "type": "string",
                                    "description": "Platform name (e.g. 'G2', 'Glassdoor', 'Trustpilot')",
                                },
                                "score": {
                                    "type": "string",
                                    "description": "Rating score (e.g. '4.5/5', '3.8/5')",
                                },
                                "review_count": {
                                    "type": "string",
                                    "description": "Approximate number of reviews (e.g. '2,400 reviews')",
                                },
                            },
                        },
                    },
                    "common_praise": {
                        "type": "array",
                        "description": "Top 3-5 recurring positive themes from users/employees",
                        "items": {
                            "type": "object",
                            "properties": {
                                "theme": {
                                    "type": "string",
                                    "description": "The positive theme (e.g. 'Reliability', 'Customer support')",
                                },
                                "detail": {
                                    "type": "string",
                                    "description": "1-2 sentence elaboration with specific examples",
                                },
                            },
                        },
                    },
                    "common_complaints": {
                        "type": "array",
                        "description": "Top 3-5 recurring negative themes or pain points",
                        "items": {
                            "type": "object",
                            "properties": {
                                "theme": {
                                    "type": "string",
                                    "description": "The complaint theme (e.g. 'Pricing opacity', 'Slow support')",
                                },
                                "detail": {
                                    "type": "string",
                                    "description": "1-2 sentence elaboration with specific examples",
                                },
                            },
                        },
                    },
                    "summary": {
                        "type": "string",
                        "description": "Executive summary of public perception in 2-3 sentences",
                    },
                },
                "required": ["overall_sentiment", "summary"],
            },
        },
        # ── 4. Analyst & Competitive Standing ─────────────────────────────
        "analyst_competitive": {
            "query": (
                f"As of {today}, research analyst ratings and competitive positioning for {brand_name}. "
                f"Find: Gartner Magic Quadrant placement, Forrester Wave positioning, IDC MarketScape ratings, "
                f"and any other major analyst evaluations. "
                f"Identify the top 3-5 competitors, their approximate market share, "
                f"and how {brand_name} differentiates from each. "
                f"Include any notable industry awards or thought leadership recognitions.{ctx}"
            ),
            "output_schema": {
                "properties": {
                    "analyst_ratings": {
                        "type": "array",
                        "description": "Major analyst evaluations. Include 2-5 ratings.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "firm": {
                                    "type": "string",
                                    "description": "Analyst firm (e.g. 'Gartner', 'Forrester', 'IDC')",
                                },
                                "report": {
                                    "type": "string",
                                    "description": "Report name (e.g. 'Magic Quadrant for UCaaS 2025')",
                                },
                                "rating": {
                                    "type": "string",
                                    "description": "Rating or placement (e.g. 'Leader', 'Strong Performer', 'Challenger')",
                                },
                                "detail": {
                                    "type": "string",
                                    "description": "1-2 sentence summary of the evaluation",
                                },
                            },
                        },
                    },
                    "competitors": {
                        "type": "array",
                        "description": "Top 3-5 competitors, ordered by market relevance",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": {
                                    "type": "string",
                                    "description": "Competitor name",
                                },
                                "market_share": {
                                    "type": "string",
                                    "description": "Approximate market share if known (e.g. '55%', 'Unknown')",
                                },
                                "positioning": {
                                    "type": "string",
                                    "description": "How this competitor positions itself relative to the brand",
                                },
                                "key_strength": {
                                    "type": "string",
                                    "description": "Primary competitive advantage of this rival",
                                },
                            },
                        },
                    },
                    "market_position": {
                        "type": "string",
                        "description": "The brand's overall market position — market share, rank, and trajectory",
                    },
                    "awards": {
                        "type": "string",
                        "description": "Notable industry awards, recognitions, or thought leadership accolades from the past 1-2 years",
                    },
                    "summary": {
                        "type": "string",
                        "description": "Executive summary of competitive standing in 2-3 sentences",
                    },
                },
                "required": ["summary"],
            },
        },
        # ── 5. Risks & Opportunities ──────────────────────────────────────
        "risks_opportunities": {
            "query": (
                f"As of {today}, research brand risks and growth opportunities for {brand_name}. "
                f"For risks: find controversies, lawsuits, data breaches, product outages, "
                f"executive scandals, regulatory issues, negative analyst commentary, and customer churn signals. "
                f"For opportunities: identify underserved audiences, emerging market narratives the brand could own, "
                f"competitor weaknesses to exploit, partnership angles, and whitespace in the market. "
                f"Include source URLs for each risk.{ctx}"
            ),
            "output_schema": {
                "properties": {
                    "risks": {
                        "type": "array",
                        "description": "3-6 brand/reputation risks, most severe first",
                        "items": {
                            "type": "object",
                            "properties": {
                                "category": {
                                    "type": "string",
                                    "description": "Risk category (e.g. 'Security Vulnerability', 'Litigation', 'Executive Turnover', 'Service Outage', 'Regulatory')",
                                },
                                "severity": {
                                    "type": "string",
                                    "description": "One of: 'high', 'medium', 'low'",
                                },
                                "description": {
                                    "type": "string",
                                    "description": "2-3 sentence description of the risk with specific details",
                                },
                                "url": {
                                    "type": "string",
                                    "description": "Source URL for this risk item. Empty string if unavailable.",
                                },
                            },
                        },
                    },
                    "opportunities": {
                        "type": "array",
                        "description": "3-5 growth or positioning opportunities",
                        "items": {
                            "type": "object",
                            "properties": {
                                "area": {
                                    "type": "string",
                                    "description": "Opportunity area (e.g. 'SMB Market Expansion', 'AI Positioning', 'Partner Ecosystem')",
                                },
                                "potential": {
                                    "type": "string",
                                    "description": "One of: 'high', 'medium', 'low'",
                                },
                                "description": {
                                    "type": "string",
                                    "description": "2-3 sentence description of the opportunity and how to pursue it",
                                },
                            },
                        },
                    },
                    "summary": {
                        "type": "string",
                        "description": "Executive summary of the brand's risk/opportunity profile in 2-3 sentences",
                    },
                },
                "required": ["summary"],
            },
        },
    }
