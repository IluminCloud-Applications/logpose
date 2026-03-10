"""
Busca anúncios (ads) + insights da conta Meta Ads.
"""
from integrations.meta_ads.client import MetaAdsClient
from integrations.meta_ads.schemas import AdInsights
from integrations.meta_ads.helpers import (
    extract_action_value, safe_float, safe_int, calc_connect_rate,
)

AD_FIELDS = ",".join([
    "ad_id",
    "ad_name",
    "adset_id",
    "spend",
    "clicks",
    "impressions",
    "cpc",
    "ctr",
    "actions",
])

AD_STRUCTURE_FIELDS = "id,name,status,adset_id"


async def fetch_ads(
    client: MetaAdsClient,
    date_start: str,
    date_end: str,
) -> list[AdInsights]:
    """
    Busca todos os ads da conta com insights no período.
    """
    # 1. Buscar estrutura dos ads
    ads_raw = await client._get_all_pages(
        f"{client.account_id}/ads",
        params={"fields": AD_STRUCTURE_FIELDS},
    )

    # 2. Buscar insights no nível ad
    insights_raw = await client._get_all_pages(
        f"{client.account_id}/insights",
        params={
            "fields": AD_FIELDS,
            "level": "ad",
            "time_range": f'{{"since":"{date_start}","until":"{date_end}"}}',
        },
    )

    insights_map = {
        row.get("ad_id"): row for row in insights_raw
    }

    results: list[AdInsights] = []
    for ad in ads_raw:
        ad_id = ad.get("id", "")
        insight = insights_map.get(ad_id, {})
        actions = insight.get("actions", [])

        lpv = safe_int(extract_action_value(
            actions, "landing_page_view",
        ))
        initiate = safe_int(extract_action_value(
            actions, "omni_initiated_checkout",
        ))
        clicks = safe_int(insight.get("clicks", 0))

        results.append(AdInsights(
            id=ad_id,
            ad_set_id=ad.get("adset_id", ""),
            name=ad.get("name", ""),
            status=_normalize_status(ad.get("status", "")),
            budget=0.0,  # Ads herdam budget do AdSet
            spend=safe_float(insight.get("spend", 0)),
            clicks=clicks,
            impressions=safe_int(insight.get("impressions", 0)),
            cpc=safe_float(insight.get("cpc", 0)),
            ctr=safe_float(insight.get("ctr", 0)),
            cpa=0.0,
            landing_page_views=lpv,
            initiate_checkout=initiate,
            connect_rate=calc_connect_rate(lpv, clicks),
        ))

    return results


def _normalize_status(raw_status: str) -> str:
    mapping = {
        "ACTIVE": "active",
        "PAUSED": "paused",
        "DELETED": "completed",
        "ARCHIVED": "completed",
    }
    return mapping.get(raw_status, "paused")
