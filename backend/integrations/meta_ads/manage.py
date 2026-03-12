"""
Funções de gerenciamento do Meta Ads via Graph API.
- Toggle status (ACTIVE/PAUSED) de campanhas, adsets e ads
- Update budget (daily_budget) de campanhas e adsets
"""
import httpx
import logging
from integrations.meta_ads.client import GRAPH_API_BASE, DEFAULT_TIMEOUT

logger = logging.getLogger(__name__)


async def toggle_entity_status(
    access_token: str,
    entity_id: str,
    entity_type: str,
    new_status: str,
) -> dict:
    """
    Altera o status de uma entidade (campaign, adset, ad).
    new_status: 'ACTIVE' ou 'PAUSED'
    """
    url = f"{GRAPH_API_BASE}/{entity_id}"
    params = {
        "access_token": access_token,
        "status": new_status,
    }

    try:
        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
            response = await client.post(url, data=params)
            response.raise_for_status()
            return {"success": True}
    except httpx.HTTPStatusError as e:
        try:
            error_body = e.response.json() if e.response else {}
        except Exception:
            error_body = {}
        error_msg = error_body.get("error", {}).get("message", str(e))
        logger.error(f"Toggle {entity_type} {entity_id}: {error_msg}")
        return {"success": False, "error": error_msg}
    except Exception as e:
        logger.error(f"Toggle {entity_type} {entity_id}: {e}")
        return {"success": False, "error": str(e)}


async def update_budget(
    access_token: str,
    entity_id: str,
    entity_type: str,
    daily_budget_reais: float,
) -> dict:
    """
    Atualiza o orçamento diário de uma campanha (CBO) ou adset (ABO).
    Meta API espera o valor em centavos (int).
    """
    budget_cents = int(daily_budget_reais * 100)
    url = f"{GRAPH_API_BASE}/{entity_id}"
    params = {
        "access_token": access_token,
        "daily_budget": str(budget_cents),
    }

    try:
        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
            response = await client.post(url, data=params)
            response.raise_for_status()
            return {"success": True}
    except httpx.HTTPStatusError as e:
        try:
            error_body = e.response.json() if e.response else {}
        except Exception:
            error_body = {}
        error_msg = error_body.get("error", {}).get("message", str(e))
        logger.error(f"Budget {entity_type} {entity_id}: {error_msg}")
        return {"success": False, "error": error_msg}
    except Exception as e:
        logger.error(f"Budget {entity_type} {entity_id}: {e}")
        return {"success": False, "error": str(e)}
