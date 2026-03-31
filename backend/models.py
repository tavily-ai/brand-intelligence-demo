"""Pydantic models for the brand intelligence report."""

from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class ResearchRequest(BaseModel):
    brand_name: str
    context: Optional[str] = None


class Source(BaseModel):
    title: str
    url: str
    favicon: Optional[str] = None


class BrandOverviewData(BaseModel):
    tagline: Optional[str] = None
    description: Optional[str] = None
    parent_company: Optional[str] = None
    headquarters: Optional[str] = None
    founded: Optional[str] = None
    industry: Optional[str] = None
    key_products: Optional[List[Dict[str, str]]] = None
    target_audience: Optional[str] = None
    brand_values: Optional[str] = None
    website: Optional[str] = None
    summary: Optional[str] = None


class MediaPressData(BaseModel):
    overall_tone: Optional[str] = None
    press_items: Optional[List[Dict[str, str]]] = None
    pr_crises: Optional[str] = None
    earned_media_highlights: Optional[str] = None
    summary: Optional[str] = None


class PublicPerceptionData(BaseModel):
    overall_sentiment: Optional[str] = None
    review_scores: Optional[List[Dict[str, str]]] = None
    common_praise: Optional[List[Dict[str, str]]] = None
    common_complaints: Optional[List[Dict[str, str]]] = None
    summary: Optional[str] = None


class AnalystCompetitiveData(BaseModel):
    analyst_ratings: Optional[List[Dict[str, str]]] = None
    competitors: Optional[List[Dict[str, str]]] = None
    market_position: Optional[str] = None
    awards: Optional[str] = None
    summary: Optional[str] = None


class RisksOpportunitiesData(BaseModel):
    risks: Optional[List[Dict[str, str]]] = None
    opportunities: Optional[List[Dict[str, str]]] = None
    summary: Optional[str] = None


class ResearchResponse(BaseModel):
    brand_name: str
    context: Optional[str] = None
    brand_overview: Optional[Dict[str, Any]] = None
    media_press: Optional[Dict[str, Any]] = None
    public_perception: Optional[Dict[str, Any]] = None
    analyst_competitive: Optional[Dict[str, Any]] = None
    risks_opportunities: Optional[Dict[str, Any]] = None
    sources: Optional[Dict[str, List[Source]]] = None
