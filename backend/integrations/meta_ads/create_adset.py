"""
Criação de Ad Set na Meta Marketing API.
Suporte a targeting, pixel, scheduling e bid amount.
Compatível com CBO (Campaign Budget Optimization).
"""
import json
import logging
from integrations.meta_ads.client import GRAPH_API_BASE
import httpx

logger = logging.getLogger(__name__)

# Mapeamento de estratégias de lance (UI → API)
BID_STRATEGY_MAP = {
    "VOLUME": "LOWEST_COST_WITHOUT_CAP",
    "BID_CAP": "LOWEST_COST_WITH_BID_CAP",
    "COST_CAP": "COST_CAP",
    "ROAS": "LOWEST_COST_WITH_MIN_ROAS",
}


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
    status: str = "PAUSED",
) -> dict:
    """
    Cria um Ad Set vinculado a uma campanha CBO.
    
    Args:
        bid_strategy: VOLUME | BID_CAP | COST_CAP | ROAS
        bid_amount: Valor do lance (reais) para BID_CAP/COST_CAP
        roas_floor: Mínimo ROAS (ex: 2.0 = 200%) para ROAS
        pixel_id: ID do pixel para otimização de conversão
        start_time: ISO 8601 com timezone (ex: 2026-03-14T00:00:00-0300)
        targeting: Dict com geo_locations, age_min, age_max, genders, interests, etc.
    """
    act_id = account_id if account_id.startswith("act_") else f"act_{account_id}"
    url = f"{GRAPH_API_BASE}/{act_id}/adsets"

    # Monta targeting para a API
    api_targeting = _build_targeting(targeting)

    # Bid strategy para a API
    api_bid_strategy = BID_STRATEGY_MAP.get(bid_strategy, "LOWEST_COST_WITHOUT_CAP")

    data: dict[str, str] = {
        "access_token": access_token,
        "name": name,
        "campaign_id": campaign_id,
        "bid_strategy": api_bid_strategy,
        "optimization_goal": "OFFSITE_CONVERSIONS",
        "billing_event": "IMPRESSIONS",
        "status": status,
        "start_time": start_time,
        "promoted_object": json.dumps({
            "pixel_id": pixel_id,
            "custom_event_type": "PURCHASE",
        }),
        "targeting": json.dumps(api_targeting),
    }

    # Adiciona bid_amount para BID_CAP / COST_CAP (em centavos)
    if bid_strategy in ("BID_CAP", "COST_CAP") and bid_amount:
        data["bid_amount"] = str(int(bid_amount * 100))

    # Adiciona roas_average_floor para ROAS
    if bid_strategy == "ROAS" and roas_floor:
        # Meta espera roas_average_floor no bid_constraints
        # Formato: valor inteiro representando percentual (2.0 → 200)
        roas_int = int(roas_floor * 100)
        data["bid_constraints"] = json.dumps({
            "roas_average_floor": roas_int,
        })

    logger.info(f"Criando Ad Set: {name} | Campaign: {campaign_id} | Strategy: {api_bid_strategy}")
    logger.info(f"Targeting: {json.dumps(api_targeting)}")
    logger.info(f"Payload ad set (sem token): { {k: v for k, v in data.items() if k != 'access_token'} }")

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
            error_code = body.get("error", {}).get("code", "N/A")
            error_subcode = body.get("error", {}).get("error_subcode", "N/A")
            logger.error(f"Erro ao criar Ad Set: {error_msg} (code={error_code}, subcode={error_subcode})")
            logger.error(f"Response body: {body}")
        except Exception:
            error_msg = f"Erro {response.status_code} da Meta API"
            logger.error(f"Erro ao criar Ad Set (não JSON): {response.text}")

        return {"success": False, "error": error_msg}


def _build_targeting(targeting: dict) -> dict:
    """Constrói o objeto targeting para a API da Meta."""
    api_targeting: dict = {
        "geo_locations": {"countries": ["BR"]},
        "age_min": targeting.get("age_min", 18),
        "age_max": targeting.get("age_max", 65),
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

    # Posicionamentos manuais (Ex: se não tiver ator do Instagram)
    if "publisher_platforms" in targeting:
        api_targeting["publisher_platforms"] = targeting["publisher_platforms"]
        if "facebook_positions" in targeting:
            api_targeting["facebook_positions"] = targeting["facebook_positions"]

    return api_targeting
