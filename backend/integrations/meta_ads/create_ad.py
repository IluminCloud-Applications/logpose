"""
Criação de Ad Creative + Ad na Meta Marketing API.
Suporte a imagem e vídeo com object_story_spec.
"""
import json
import logging
from integrations.meta_ads.client import GRAPH_API_BASE
import httpx

logger = logging.getLogger(__name__)


async def create_ad_creative(
    access_token: str,
    account_id: str,
    name: str,
    page_id: str,
    instagram_actor_id: str | None,
    link: str,
    primary_text: str,
    headline: str,
    description: str,
    cta_type: str,
    image_hash: str | None = None,
    video_id: str | None = None,
) -> dict:
    """
    Cria um Ad Creative com imagem ou vídeo.
    Retorna {"success": True, "creative_id": "..."} ou erro.
    """
    act_id = account_id if account_id.startswith("act_") else f"act_{account_id}"
    url = f"{GRAPH_API_BASE}/{act_id}/adcreatives"

    # Monta link_data (para imagem) ou video_data (para vídeo)
    story_spec: dict = {"page_id": page_id}

    if instagram_actor_id:
        story_spec["instagram_actor_id"] = instagram_actor_id

    cta_value = {"link": link}

    if video_id:
        story_spec["video_data"] = {
            "video_id": video_id,
            "message": primary_text,
            "title": headline,
            "link_description": description,
            "call_to_action": {"type": cta_type, "value": cta_value},
            "link": link,
        }
        # Imagem de thumbnail automática se não tiver image_hash
        if image_hash:
            story_spec["video_data"]["image_hash"] = image_hash
    else:
        story_spec["link_data"] = {
            "image_hash": image_hash,
            "link": link,
            "message": primary_text,
            "name": headline,
            "description": description,
            "call_to_action": {"type": cta_type, "value": cta_value},
        }

    data = {
        "access_token": access_token,
        "name": name,
        "object_story_spec": json.dumps(story_spec),
    }

    async with httpx.AsyncClient(timeout=30.0) as http:
        response = await http.post(url, data=data)

        if response.status_code == 200:
            result = response.json()
            creative_id = result.get("id")
            logger.info(f"Creative criado: {creative_id}")
            return {"success": True, "creative_id": creative_id}

        error_msg = _parse_error(response)
        logger.error(f"Erro ao criar creative: {error_msg}")
        return {"success": False, "error": error_msg}


async def create_ad(
    access_token: str,
    account_id: str,
    name: str,
    adset_id: str,
    creative_id: str,
) -> dict:
    """
    Cria um Ad vinculado a um Ad Set e Creative.
    Retorna {"success": True, "ad_id": "..."} ou erro.
    """
    act_id = account_id if account_id.startswith("act_") else f"act_{account_id}"
    url = f"{GRAPH_API_BASE}/{act_id}/ads"

    data = {
        "access_token": access_token,
        "name": name,
        "adset_id": adset_id,
        "creative": json.dumps({"creative_id": creative_id}),
        "status": "PAUSED",
    }

    async with httpx.AsyncClient(timeout=30.0) as http:
        response = await http.post(url, data=data)

        if response.status_code == 200:
            result = response.json()
            ad_id = result.get("id")
            logger.info(f"Ad criado: {ad_id}")
            return {"success": True, "ad_id": ad_id}

        error_msg = _parse_error(response)
        logger.error(f"Erro ao criar ad: {error_msg}")
        return {"success": False, "error": error_msg}


def _parse_error(response: httpx.Response) -> str:
    try:
        body = response.json()
        return body.get("error", {}).get("message", f"Erro {response.status_code}")
    except Exception:
        return f"Erro {response.status_code} da Meta API"
