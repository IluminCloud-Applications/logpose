"""
Busca spend mensal da Meta Ads para a página Company.
Utiliza time_increment=monthly para agrupar por mês.
"""
import logging
from typing import Optional
from sqlalchemy.orm import Session

from database.models.facebook_account import FacebookAccount
from integrations.meta_ads.client import MetaAdsClient
from integrations.meta_ads.helpers import safe_float, safe_int

logger = logging.getLogger(__name__)

ACCOUNT_FIELDS = ",".join([
    "spend",
    "clicks",
    "impressions",
])


async def fetch_monthly_spend(
    db: Session,
    year: int,
) -> dict[int, dict]:
    """
    Busca spend mensal da Meta Ads para o ano inteiro.
    Retorna dict: { month_num: { spend, clicks, impressions } }
    """
    fb = db.query(FacebookAccount).first()
    if not fb:
        return {}

    client = MetaAdsClient(fb.access_token, fb.account_id)
    try:
        date_start = f"{year}-01-01"
        date_end = f"{year}-12-31"

        data = await client._get(
            f"{client.account_id}/insights",
            params={
                "fields": ACCOUNT_FIELDS,
                "time_range": f'{{"since":"{date_start}","until":"{date_end}"}}',
                "time_increment": "monthly",
            },
        )

        rows = data.get("data", [])
        result: dict[int, dict] = {}

        for row in rows:
            # Cada row tem date_start e date_stop
            period_start = row.get("date_start", "")
            if len(period_start) >= 7:
                month_num = int(period_start[5:7])
                result[month_num] = {
                    "spend": safe_float(row.get("spend", 0)),
                    "clicks": safe_int(row.get("clicks", 0)),
                    "impressions": safe_int(row.get("impressions", 0)),
                }

        return result

    except Exception as e:
        logger.error(f"Erro ao buscar spend mensal da Meta: {e}")
        return {}
    finally:
        await client.close()
