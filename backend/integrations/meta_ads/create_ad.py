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
    url_tags: str = "",
) -> dict:
    """
    Cria um Ad Creative com imagem ou vídeo.
    Retorna {"success": True, "creative_id": "..."} ou erro.
    """
    act_id = account_id if account_id.startswith("act_") else f"act_{account_id}"
    url = f"{GRAPH_API_BASE}/{act_id}/adcreatives"

    # Monta link_data (para imagem) ou video_data (para vídeo)
    # NOTA: instagram_actor_id foi DEPRECATED na v22.0+, usar instagram_user_id
    story_spec: dict = {"page_id": page_id}

    if instagram_actor_id and instagram_actor_id not in ("", "none") and str(instagram_actor_id).isdigit():
        story_spec["instagram_user_id"] = instagram_actor_id
        logger.info(f"Usando instagram_user_id fornecido: {instagram_actor_id}")
    else:
        # Fallback: busca IG account vinculado à conta de anúncio
        ig_id = await _resolve_instagram_user_id(access_token, page_id, account_id)
        if ig_id:
            story_spec["instagram_user_id"] = ig_id

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

    # url_tags: parâmetros de URL separados (não aparecem no Ads Library)
    if url_tags:
        data["url_tags"] = url_tags

    logger.info(f"Criando Creative: {name} | Page: {page_id} | Video: {bool(video_id)}")
    logger.info(f"Story spec: {json.dumps(story_spec)}")

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


async def _resolve_instagram_user_id(
    access_token: str, page_id: str, account_id: str = ""
) -> str | None:
    """
    Fallback: busca o primeiro Instagram account vinculado à conta de anúncio.
    Usa /act_{id}/instagram_accounts (permissão ads_management).
    """
    if not account_id:
        logger.warning("Sem account_id para fallback de Instagram — creative sem IG")
        return None

    try:
        act_id = account_id if account_id.startswith("act_") else f"act_{account_id}"
        url = f"{GRAPH_API_BASE}/{act_id}/instagram_accounts"
        params = {"access_token": access_token, "fields": "id,username", "limit": "1"}

        async with httpx.AsyncClient(timeout=10.0) as http:
            resp = await http.get(url, params=params)
            if resp.status_code == 200:
                ig_list = resp.json().get("data", [])
                if ig_list:
                    ig_id = ig_list[0].get("id", "")
                    ig_user = ig_list[0].get("username", "?")
                    logger.info(f"Fallback IG account: {ig_user} ({ig_id})")
                    return ig_id
                logger.info("Nenhuma conta Instagram vinculada à conta de anúncio")
            else:
                logger.warning(f"Falha ao buscar IG accounts: {resp.status_code} {resp.text}")
    except Exception as e:
        logger.warning(f"Erro ao buscar Instagram accounts: {e}")
    return None


async def create_ad(
    access_token: str,
    account_id: str,
    name: str,
    adset_id: str,
    creative_id: str,
    status: str = "PAUSED",
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
        "status": status,
    }

    logger.info(f"Criando Ad: {name} | AdSet: {adset_id} | Creative: {creative_id}")

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
    """Parseia mensagem de erro da Meta API com detalhes."""
    try:
        body = response.json()
        error = body.get("error", {})
        msg = error.get("message", f"Erro {response.status_code}")
        code = error.get("code", "N/A")
        subcode = error.get("error_subcode", "N/A")
        logger.error(f"Meta API error detail: code={code}, subcode={subcode}, body={body}")
        return msg
    except Exception:
        logger.error(f"Meta API raw response: {response.text}")
        return f"Erro {response.status_code} da Meta API"
