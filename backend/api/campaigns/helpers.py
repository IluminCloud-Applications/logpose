"""
Helpers para parsear UTMs no formato name|id e cruzar
dados do Meta Ads com transações do banco de dados.
"""
from typing import Optional


def parse_utm_field(raw: Optional[str]) -> tuple[Optional[str], Optional[str]]:
    """
    Parseia campo UTM no formato 'name|id'.
    Retorna (name, id). Se não tem pipe, retorna (raw, None).
    """
    if not raw:
        return None, None
    if "|" in raw:
        parts = raw.rsplit("|", 1)
        return parts[0].strip(), parts[1].strip()
    return raw.strip(), None


def parse_utm_campaign(utm_campaign: Optional[str]) -> tuple[Optional[str], Optional[str]]:
    """Extrai (campaign_name, campaign_id) do utm_campaign."""
    return parse_utm_field(utm_campaign)


def parse_utm_medium(utm_medium: Optional[str]) -> tuple[Optional[str], Optional[str]]:
    """Extrai (adset_name, adset_id) do utm_medium."""
    return parse_utm_field(utm_medium)


def parse_utm_content(utm_content: Optional[str]) -> tuple[Optional[str], Optional[str]]:
    """Extrai (ad_name, ad_id) do utm_content."""
    return parse_utm_field(utm_content)


def safe_division(numerator: float, denominator: float, default: float = 0.0) -> float:
    """Divisão segura evitando ZeroDivisionError."""
    if denominator <= 0:
        return default
    return round(numerator / denominator, 2)
