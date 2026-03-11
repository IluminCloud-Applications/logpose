"""
Busca campanhas + insights da conta Meta Ads.
"""
from integrations.meta_ads.client import MetaAdsClient
from integrations.meta_ads.schemas import CampaignInsights
from integrations.meta_ads.helpers import (
    extract_action_value, safe_float, safe_int, calc_connect_rate,
)

# Campos que queremos das campanhas (estrutura + insights inline)
CAMPAIGN_FIELDS = ",".join([
    "campaign_id",
    "campaign_name",
    "spend",
    "clicks",
    "impressions",
    "cpc",
    "ctr",
    "actions",
])

# Campos de estrutura da campanha
CAMPAIGN_STRUCTURE_FIELDS = "id,name,status,daily_budget,lifetime_budget,objective"


async def fetch_campaigns(
    client: MetaAdsClient,
    date_start: str,
    date_end: str,
) -> list[CampaignInsights]:
    """
    Busca todas as campanhas da conta com insights no período.

    Estratégia:
    1. Busca a lista de campanhas (id, name, status, budget)
    2. Busca insights no nível de campanha (spend, clicks, etc.)
    3. Combina os dados para retornar uma lista padronizada
    """
    # 1. Buscar estrutura das campanhas
    campaigns_raw = await client._get_all_pages(
        f"{client.account_id}/campaigns",
        params={"fields": CAMPAIGN_STRUCTURE_FIELDS, "limit": "200"},
    )

    # 2. Buscar insights no nível campaign
    insights_raw = await client._get_all_pages(
        f"{client.account_id}/insights",
        params={
            "fields": CAMPAIGN_FIELDS,
            "level": "campaign",
            "time_range": f'{{"since":"{date_start}","until":"{date_end}"}}',
        },
    )

    # Indexar insights por campaign_id
    insights_map = {
        row.get("campaign_id"): row for row in insights_raw
    }

    # 3. Combinar
    results: list[CampaignInsights] = []
    for camp in campaigns_raw:
        camp_id = camp.get("id", "")
        insight = insights_map.get(camp_id, {})
        actions = insight.get("actions", [])

        lpv = safe_int(extract_action_value(
            actions, "landing_page_view"
        ))
        initiate = safe_int(extract_action_value(
            actions, "omni_initiated_checkout"
        ))
        clicks = safe_int(insight.get("clicks", 0))
        spend = safe_float(insight.get("spend", 0))

        budget = safe_float(
            camp.get("daily_budget", 0)
            or camp.get("lifetime_budget", 0)
        ) / 100  # Meta retorna em centavos

        results.append(CampaignInsights(
            id=camp_id,
            name=camp.get("name", ""),
            status=_normalize_status(camp.get("status", "")),
            objective=_normalize_objective(camp.get("objective", "")),
            budget=budget,
            spend=spend,
            clicks=clicks,
            impressions=safe_int(insight.get("impressions", 0)),
            cpc=safe_float(insight.get("cpc", 0)),
            ctr=safe_float(insight.get("ctr", 0)),
            cpa=0.0,  # Calculado depois com dados de transação
            landing_page_views=lpv,
            initiate_checkout=initiate,
            connect_rate=calc_connect_rate(lpv, clicks),
        ))

    return results


def _normalize_status(raw_status: str) -> str:
    """Normaliza o status da Meta para o formato do frontend."""
    mapping = {
        "ACTIVE": "active",
        "PAUSED": "paused",
        "DELETED": "completed",
        "ARCHIVED": "completed",
    }
    return mapping.get(raw_status, "paused")


def _normalize_objective(raw_objective: str) -> str:
    """Normaliza o objetivo da Meta para label amigável."""
    mapping = {
        "OUTCOME_SALES": "sales",
        "OUTCOME_TRAFFIC": "traffic",
        "OUTCOME_ENGAGEMENT": "engagement",
        "OUTCOME_LEADS": "leads",
        "OUTCOME_AWARENESS": "awareness",
        "OUTCOME_APP_PROMOTION": "app_promotion",
        "CONVERSIONS": "sales",
        "LINK_CLICKS": "traffic",
        "POST_ENGAGEMENT": "engagement",
        "LEAD_GENERATION": "leads",
        "BRAND_AWARENESS": "awareness",
        "REACH": "awareness",
        "VIDEO_VIEWS": "engagement",
        "MESSAGES": "engagement",
        "APP_INSTALLS": "app_promotion",
        "PRODUCT_CATALOG_SALES": "sales",
        "STORE_VISITS": "traffic",
    }
    return mapping.get(raw_objective, raw_objective.lower() if raw_objective else "other")
