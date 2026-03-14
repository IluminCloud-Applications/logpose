"""
Pydantic schemas para criação simplificada de campanhas.
"""
from pydantic import BaseModel


class AdPayload(BaseModel):
    """Dados de um anúncio individual."""
    name: str
    primary_text: str
    headline: str
    description: str
    link: str
    utm_params: dict[str, str] = {}
    cta_type: str = "SHOP_NOW"
    media_type: str = "image"  # "image" ou "video"
    # Os arquivos vêm como multipart — media_index referencia a ordem
    media_index: int = 0


class TargetingPayload(BaseModel):
    """Configuração de targeting."""
    age_min: int = 18
    age_max: int = 65
    genders: int = 0  # 0=all, 1=male, 2=female
    interests: list[dict] = []  # [{"id": "123", "name": "..."}]


class CampaignCreatePayload(BaseModel):
    """Payload completo para criar uma campanha."""
    account_id: int  # ID interno do banco (FK facebook_accounts)
    # Campaign
    campaign_name: str
    daily_budget: float
    bid_strategy: str = "VOLUME"  # VOLUME | BID_CAP | COST_CAP | ROAS
    bid_amount: float | None = None
    roas_floor: float | None = None
    # Ad Set
    adset_name: str
    pixel_id: str
    start_time: str  # ISO 8601 com timezone
    targeting: TargetingPayload = TargetingPayload()
    page_id: str
    instagram_actor_id: str | None = None
    # Ads
    ads: list[AdPayload]
    batch_mode: bool = True


class CampaignCreateResponse(BaseModel):
    """Resposta da criação de campanha."""
    success: bool
    campaign_id: str | None = None
    adset_id: str | None = None
    ads_created: int = 0
    errors: list[str] = []


class CampaignExportData(BaseModel):
    """Dados para exportação/importação de campanha."""
    version: str = "1.0"
    campaign_name: str
    daily_budget: float
    bid_strategy: str
    bid_amount: float | None = None
    roas_floor: float | None = None
    adset_name: str
    pixel_id: str
    start_time: str
    targeting: TargetingPayload
    page_id: str
    instagram_actor_id: str | None = None
    ads: list[AdPayload]
    batch_mode: bool = True
