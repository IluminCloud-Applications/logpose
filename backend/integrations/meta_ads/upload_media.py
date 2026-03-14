"""
Upload de mídia (imagem/vídeo) para a Meta Marketing API.
"""
import logging
from integrations.meta_ads.client import GRAPH_API_BASE
import httpx

logger = logging.getLogger(__name__)

# Timeout longo para upload de vídeos grandes
UPLOAD_TIMEOUT = 120.0


async def upload_image(
    access_token: str,
    account_id: str,
    file_bytes: bytes,
    filename: str,
) -> dict:
    """
    Faz upload de uma imagem para a conta de anúncio.
    Retorna {"success": True, "image_hash": "..."} ou erro.
    """
    act_id = account_id if account_id.startswith("act_") else f"act_{account_id}"
    url = f"{GRAPH_API_BASE}/{act_id}/adimages"

    async with httpx.AsyncClient(timeout=UPLOAD_TIMEOUT) as http:
        response = await http.post(
            url,
            data={"access_token": access_token},
            files={"filename": (filename, file_bytes)},
        )

        if response.status_code == 200:
            result = response.json()
            images = result.get("images", {})
            # A chave é o nome do campo (filename)
            image_data = images.get("filename", {})
            image_hash = image_data.get("hash")
            if image_hash:
                logger.info(f"Imagem uploaded: {filename} → hash={image_hash}")
                return {"success": True, "image_hash": image_hash}

        error_msg = _parse_error(response)
        logger.error(f"Erro upload imagem {filename}: {error_msg}")
        return {"success": False, "error": error_msg}


async def upload_video(
    access_token: str,
    account_id: str,
    file_bytes: bytes,
    filename: str,
) -> dict:
    """
    Faz upload de um vídeo para a conta de anúncio.
    Retorna {"success": True, "video_id": "..."} ou erro.
    """
    act_id = account_id if account_id.startswith("act_") else f"act_{account_id}"
    url = f"{GRAPH_API_BASE}/{act_id}/advideos"

    async with httpx.AsyncClient(timeout=UPLOAD_TIMEOUT) as http:
        response = await http.post(
            url,
            data={"access_token": access_token},
            files={"source": (filename, file_bytes)},
        )

        if response.status_code == 200:
            result = response.json()
            video_id = result.get("id")
            if video_id:
                logger.info(f"Vídeo uploaded: {filename} → id={video_id}")
                return {"success": True, "video_id": video_id}

        error_msg = _parse_error(response)
        logger.error(f"Erro upload vídeo {filename}: {error_msg}")
        return {"success": False, "error": error_msg}


def _parse_error(response: httpx.Response) -> str:
    """Parseia mensagem de erro da Meta API."""
    try:
        body = response.json()
        return body.get("error", {}).get("message", f"Erro {response.status_code}")
    except Exception:
        return f"Erro {response.status_code} da Meta API"
