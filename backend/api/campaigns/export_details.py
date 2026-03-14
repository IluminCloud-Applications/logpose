"""
Endpoint para exportar detalhes completos de uma campanha existente.
Busca targeting, pixel, page, instagram e ad creatives na Facebook Graph API.

Abordagem validada:
  1. {campaign_id}/ads com fields=id,name,creative → retorna criativos com ID
  2. GET /{creative_id}?fields=id,body,title,url_tags,object_story_spec → detalhes
  3. {campaign_id}/adsets → targeting, pixel, bid
  4. {page_id}?fields=instagram_business_account{id,username} → instagram
"""
import asyncio
import logging
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from database.core.connection import get_db
from database.models.facebook_account import FacebookAccount
from api.auth.deps import get_current_user
from integrations.meta_ads.client import MetaAdsClient
from api.campaigns.export_helpers import (
    parse_targeting, parse_bid_data, parse_ad_creative,
    extract_page_and_instagram,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/campaigns", tags=["campaigns"])

CAMPAIGN_FIELDS = "id,name,bid_strategy"

ADSET_FIELDS = ",".join([
    "id", "name", "targeting", "promoted_object",
    "start_time", "daily_budget", "lifetime_budget",
    "bid_amount", "bid_strategy", "bid_constraints",
])

# creative sem subfields — só retorna {id}
AD_FIELDS = "id,name,creative"

# Campos do creative buscado individualmente
CREATIVE_FIELDS = "id,name,body,title,url_tags,object_story_spec"


@router.get("/export-details")
async def get_campaign_export_details(
    campaign_id: str = Query(...),
    account_id: int = Query(...),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Busca detalhes completos de uma campanha para exportação."""
    fb_account = db.query(FacebookAccount).filter(
        FacebookAccount.id == account_id
    ).first()
    if not fb_account:
        raise HTTPException(status_code=404, detail="Conta não encontrada")

    client = MetaAdsClient(fb_account.access_token, fb_account.account_id)

    try:
        return await _export_campaign(client, campaign_id)
    except Exception as e:
        logger.error(f"[EXPORT] Erro ao exportar {campaign_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await client.close()


async def _export_campaign(client: MetaAdsClient, campaign_id: str) -> dict:
    """Orquestra busca de campanha, adsets, ads e creatives."""
    # Passo 1: Buscar campanha, adsets e ads em paralelo
    campaign, adsets, ads = await asyncio.gather(
        client._get(campaign_id, params={"fields": CAMPAIGN_FIELDS}),
        client._get_all_pages(
            f"{campaign_id}/adsets",
            params={"fields": ADSET_FIELDS, "limit": "100"},
        ),
        client._get_all_pages(
            f"{campaign_id}/ads",
            params={"fields": AD_FIELDS, "limit": "100"},
        ),
    )

    # Passo 2: Buscar todos os creatives em paralelo pelo ID
    creative_ids = [
        ad["creative"]["id"] for ad in ads
        if isinstance(ad.get("creative"), dict) and ad["creative"].get("id")
    ]

    creatives_map: dict[str, dict] = {}
    if creative_ids:
        tasks = [_fetch_creative(client, cid) for cid in creative_ids]
        results = await asyncio.gather(*tasks)
        creatives_map = {cid: data for cid, data in results}

    # Passo 3: Montar resultado
    return _build_result(campaign, adsets, ads, creatives_map)


async def _fetch_creative(
    client: MetaAdsClient, creative_id: str,
) -> tuple[str, dict]:
    """Busca um creative pelo ID."""
    try:
        data = await client._get(
            creative_id, params={"fields": CREATIVE_FIELDS},
        )
        return creative_id, data
    except Exception as e:
        logger.error(f"[EXPORT] Erro creative {creative_id}: {e}")
        return creative_id, {}


def _build_result(
    campaign: dict,
    adsets: list[dict],
    ads: list[dict],
    creatives_map: dict[str, dict],
) -> dict:
    """Monta o resultado final de export."""
    first_adset = adsets[0] if adsets else {}

    targeting = parse_targeting(first_adset.get("targeting", {}))
    pixel_id = (first_adset.get("promoted_object") or {}).get("pixel_id", "")
    bid_data = parse_bid_data(campaign, first_adset)

    # Parsear ads e extrair page_id/instagram do primeiro creative
    parsed_ads = []
    page_id = ""
    instagram_id = ""

    for ad in ads:
        creative_id = (ad.get("creative") or {}).get("id", "")
        creative = creatives_map.get(creative_id, {})

        # Extrair page_id e instagram do creative
        if not page_id or not instagram_id:
            p, i = extract_page_and_instagram(creative)
            if not page_id:
                page_id = p
            if not instagram_id:
                instagram_id = i

        parsed_ads.append(
            parse_ad_creative(ad.get("name", ""), creative)
        )

    return {
        "pixel_id": pixel_id,
        "start_time": first_adset.get("start_time", ""),
        "targeting": targeting,
        "page_id": page_id,
        "instagram_actor_id": instagram_id,
        "bid_strategy": bid_data["bid_strategy"],
        "bid_amount": bid_data["bid_amount"],
        "roas_floor": bid_data["roas_floor"],
        "ads": parsed_ads,
    }
