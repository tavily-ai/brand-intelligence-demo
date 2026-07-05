"""Pydantic models for account intelligence."""

from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class AccountResearchRequest(BaseModel):
    account_name: str
    industry: Optional[str] = None
    context: Optional[str] = None


class ExtractRequest(BaseModel):
    url: str


class ExtractResponse(BaseModel):
    url: str
    title: Optional[str] = None
    content: Optional[str] = None
    error: Optional[str] = None


class Source(BaseModel):
    title: str
    url: str
    favicon: Optional[str] = None


class AccountSummaryData(BaseModel):
    company_name: Optional[str] = None
    summary: Optional[str] = None
    industry: Optional[str] = None
    headquarters: Optional[str] = None
    employees: Optional[str] = None
    revenue: Optional[str] = None
    parent_or_subsidiaries: Optional[str] = None
    strategic_direction: Optional[str] = None
    website: Optional[str] = None


class NewsItem(BaseModel):
    date: Optional[str] = None
    headline: Optional[str] = None
    summary: Optional[str] = None
    category: Optional[str] = None
    source_name: Optional[str] = None
    url: Optional[str] = None
    actionable: Optional[bool] = None
    suggested_action: Optional[str] = None


class RecentNewsData(BaseModel):
    news_items: Optional[List[NewsItem]] = None
    as_of: Optional[str] = None


class AccountResearchResponse(BaseModel):
    account_name: str
    industry: Optional[str] = None
    context: Optional[str] = None
    account_summary: Optional[Dict[str, Any]] = None
    recent_news: Optional[Dict[str, Any]] = None
    sources: Optional[Dict[str, List[Source]]] = None
