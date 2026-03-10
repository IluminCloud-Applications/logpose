"""
Busca insights agregados da conta inteira (nível account).
Usado nos KPIs do dashboard principal.
"""
from integrations.meta_ads.client import MetaAdsClient
from integrations.meta_ads.schemas import AccountInsightsSummary
from integrations.meta_ads.helpers import (
    extract_action_value, safe_float, safe_int,
)

ACCOUNT_FIELDS = ",".join([
    "spend",
    "clicks",
    "impressions",
    "cpc",
    "ctr",
    "actions",
])


async def fetch_account_insights(
    client: MetaAdsClient,
    date_start: str,
    date_end: str,
) -> AccountInsightsSummary:
    """
    Busca métricas agregadas da conta inteira no período.
    Retorna spend total, clicks, impressions, etc.
    """
    data = await client._get(
        f"{client.account_id}/insights",
        params={
            "fields": ACCOUNT_FIELDS,
            "time_range": f'{{"since":"{date_start}","until":"{date_end}"}}',
        },
    )

    rows = data.get("data", [])
    if not rows:
        return AccountInsightsSummary()

    row = rows[0]
    actions = row.get("actions", [])

    return AccountInsightsSummary(
        spend=safe_float(row.get("spend", 0)),
        clicks=safe_int(row.get("clicks", 0)),
        impressions=safe_int(row.get("impressions", 0)),
        cpc=safe_float(row.get("cpc", 0)),
        ctr=safe_float(row.get("ctr", 0)),
        landing_page_views=safe_int(
            extract_action_value(actions, "landing_page_view")
        ),
        initiate_checkout=safe_int(
            extract_action_value(actions, "omni_initiated_checkout")
        ),
    )
