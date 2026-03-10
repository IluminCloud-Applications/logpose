"""
Schemas Pydantic para dados da Meta Marketing API.
Padroniza os campos retornados para o frontend.
"""
from pydantic import BaseModel


class CampaignInsights(BaseModel):
    id: str
    name: str
    status: str
    budget: float = 0.0
    spend: float = 0.0
    clicks: int = 0
    impressions: int = 0
    cpc: float = 0.0
    ctr: float = 0.0
    cpa: float = 0.0
    landing_page_views: int = 0
    initiate_checkout: int = 0
    connect_rate: float = 0.0


class AdSetInsights(BaseModel):
    id: str
    campaign_id: str
    name: str
    status: str
    budget: float = 0.0
    spend: float = 0.0
    clicks: int = 0
    impressions: int = 0
    cpc: float = 0.0
    ctr: float = 0.0
    cpa: float = 0.0
    landing_page_views: int = 0
    initiate_checkout: int = 0
    connect_rate: float = 0.0


class AdInsights(BaseModel):
    id: str
    ad_set_id: str
    name: str
    status: str
    budget: float = 0.0
    spend: float = 0.0
    clicks: int = 0
    impressions: int = 0
    cpc: float = 0.0
    ctr: float = 0.0
    cpa: float = 0.0
    landing_page_views: int = 0
    initiate_checkout: int = 0
    connect_rate: float = 0.0


class AccountInsightsSummary(BaseModel):
    """Métricas agregadas da conta inteira."""
    spend: float = 0.0
    clicks: int = 0
    impressions: int = 0
    cpc: float = 0.0
    ctr: float = 0.0
    landing_page_views: int = 0
    initiate_checkout: int = 0
