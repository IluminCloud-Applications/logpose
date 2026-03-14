"""
Criação de Ad Set na Meta Marketing API.
Suporte a targeting, pixel, scheduling e bid amount.
"""
import json
import logging
from integrations.meta_ads.client import GRAPH_API_BASE
import httpx

logger = logging.getLogger(__name__)


async def create_adset(
    access_token: str,
    account_id: str,
    campaign_id: str,
    name: str,
    bid_strategy: str,
    bid_amount: float | None,
    roas_floor: float | None,
    pixel_id: str,
    start_time: str,
    targeting: dict,
) -> dict:
    """
    Cria um Ad Set vinculado a uma campanha CBO.
    
    Args:
        bid_strategy: VOLUME | BID_CAP | COST_CAP | ROAS
        bid_amount: Valor do lance (centavos) para BID_CAP/COST_CAP
        roas_floor: Mínimo ROAS (ex: 2.0 = 200%) para ROAS
        pixel_id: ID do pixel para otimização de conversão
        start_time: ISO 8601 com timezone (ex: 2026-03-14T00:00:00-0300)
        targeting: Dict com geo_locations, age_min, age_max, genders, interests, etc.
    """
    act_id = account_id if account_id.startswith("act_") else f"act_{account_id}"
    url = f"{GRAPH_API_BASE}/{act_id}/adsets"

    # Monta targeting para a API
    api_targeting = _build_targeting(targeting)

    data = {
        "access_token": access_token,
        "name": name,
        "campaign_id": campaign_id,
        "optimization_goal": "OFFSITE_CONVERSIONS",
        "billing_event": "IMPRESSIONS",
        "status": "PAUSED",
        "start_time": start_time,
        "promoted_object": json.dumps({
            "pixel_id": pixel_id,
            "custom_event_type": "PURCHASE",
        }),
        "targeting": json.dumps(api_targeting),
    }

    # Adiciona bid_amount para BID_CAP / COST_CAP
    if bid_strategy in ("BID_CAP", "COST_CAP") and bid_amount:
        data["bid_amount"] = str(int(bid_amount * 100))

    # Adiciona bid_constraints para ROAS
    if bid_strategy == "ROAS" and roas_floor:
        # Meta espera roas como inteiro (ex: 2.0 → 200)
        roas_int = int(roas_floor * 100)
        data["bid_constraints"] = json.dumps({
            "roas_average_floor": roas_int,
        })

    logger.info(f"Criando Ad Set: {name} | Campaign: {campaign_id}")

    async with httpx.AsyncClient(timeout=30.0) as http:
        response = await http.post(url, data=data)

        if response.status_code == 200:
            result = response.json()
            adset_id = result.get("id")
            logger.info(f"Ad Set criado: {adset_id}")
            return {"success": True, "adset_id": adset_id}

        try:
            body = response.json()
            error_msg = body.get("error", {}).get("message", f"Erro {response.status_code}")
        except Exception:
            error_msg = f"Erro {response.status_code} da Meta API"

        logger.error(f"Erro ao criar Ad Set: {error_msg}")
        return {"success": False, "error": error_msg}


def _build_targeting(targeting: dict) -> dict:
    """Constrói o objeto targeting para a API da Meta."""
    api_targeting: dict = {
        "geo_locations": {"countries": ["BR"]},
        "age_min": targeting.get("age_min", 18),
        "age_max": targeting.get("age_max", 65),
        "publisher_platforms": ["facebook", "instagram"],
        "facebook_positions": ["feed", "video_feeds", "story", "reels"],
        "instagram_positions": ["stream", "story", "reels", "explore"],
    }

    # Gênero: 0=all, 1=male, 2=female
    gender = targeting.get("genders", 0)
    if gender and gender != 0:
        api_targeting["genders"] = [gender]

    # Interesses (opcional)
    interests = targeting.get("interests", [])
    if interests:
        api_targeting["flexible_spec"] = [{
            "interests": [
                {"id": str(i["id"]), "name": i["name"]}
                for i in interests
            ]
        }]

    return api_targeting
