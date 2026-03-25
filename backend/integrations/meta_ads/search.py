"""
Busca de dados auxiliares na Meta Marketing API:
- Pixels da conta
- Páginas do Facebook (via Business)
- Contas Instagram vinculadas
- Interesses (targeting search)
"""
import logging
import httpx
from integrations.meta_ads.client import MetaAdsClient, GRAPH_API_BASE

logger = logging.getLogger(__name__)


async def fetch_pixels(client: MetaAdsClient) -> list[dict]:
    """Busca todos os pixels da conta de anúncio."""
    data = await client._get(
        f"{client.account_id}/adspixels",
        params={"fields": "id,name,last_fired_time"},
    )
    return data.get("data", [])


async def _get_business_id(access_token: str, ad_account_id: str) -> str | None:
    """Busca o business_id vinculado à conta de anúncio."""
    url = f"{GRAPH_API_BASE}/act_{ad_account_id}"
    params = {"access_token": access_token, "fields": "business"}

    async with httpx.AsyncClient(timeout=15.0) as http:
        response = await http.get(url, params=params)
        if response.status_code != 200:
            logger.warning(f"Erro ao buscar business: {response.text}")
            return None
        data = response.json()

    biz = data.get("business")
    return biz.get("id") if biz else None


async def fetch_pages(access_token: str, ad_account_id: str) -> list[dict]:
    """
    Busca páginas do Facebook via Business vinculado à conta.
    Combina owned_pages + client_pages.
    """
    biz_id = await _get_business_id(access_token, ad_account_id)
    if not biz_id:
        logger.warning("Business não encontrado, tentando /me/accounts")
        return await _fetch_pages_me(access_token)

    pages: dict[str, dict] = {}  # dedup por id

    for edge in ("owned_pages", "client_pages"):
        url = f"{GRAPH_API_BASE}/{biz_id}/{edge}"
        params = {
            "access_token": access_token,
            "fields": "id,name,picture{url}",
            "limit": "100",
        }
        async with httpx.AsyncClient(timeout=15.0) as http:
            response = await http.get(url, params=params)
            if response.status_code != 200:
                logger.warning(f"Erro {edge}: {response.text}")
                continue
            for p in response.json().get("data", []):
                pages[p["id"]] = p

    return list(pages.values())


async def _fetch_pages_me(access_token: str) -> list[dict]:
    """Fallback: busca páginas via /me/accounts."""
    url = f"{GRAPH_API_BASE}/me/accounts"
    params = {
        "access_token": access_token,
        "fields": "id,name,picture{url}",
        "limit": "100",
    }
    async with httpx.AsyncClient(timeout=15.0) as http:
        response = await http.get(url, params=params)
        response.raise_for_status()
        return response.json().get("data", [])


async def fetch_instagram_accounts(
    access_token: str,
    ad_account_id: str,
) -> list[dict]:
    """Busca contas Instagram vinculadas à conta de anúncio via Ads API."""
    act_id = ad_account_id if ad_account_id.startswith("act_") else f"act_{ad_account_id}"
    url = f"{GRAPH_API_BASE}/{act_id}/instagram_accounts"
    params = {
        "access_token": access_token,
        "fields": "id,username,profile_picture_url",
        "limit": "100",
    }
    async with httpx.AsyncClient(timeout=15.0) as http:
        response = await http.get(url, params=params)
        if response.status_code != 200:
            logger.warning(f"Erro IG ad account {act_id}: {response.text}")
            return []
        data = response.json()

    return [
        {
            "id": ig.get("id", ""),
            "username": ig.get("username", ""),
            "profile_pic": ig.get("profile_picture_url", ""),
        }
        for ig in data.get("data", [])
    ]


async def search_interests(
    access_token: str,
    query: str,
    locale: str = "pt_BR",
) -> list[dict]:
    """Busca interesses para targeting via /search."""
    url = f"{GRAPH_API_BASE}/search"
    params = {
        "access_token": access_token,
        "type": "adinterest",
        "q": query,
        "locale": locale,
        "limit": "50",
    }
    async with httpx.AsyncClient(timeout=15.0) as http:
        response = await http.get(url, params=params)
        if response.status_code != 200:
            logger.warning(f"Interest search error: {response.text}")
            return []
        data = response.json()

    logger.info(f"Interest search '{query}': {len(data.get('data', []))} results")
    return [
        {
            "id": item.get("id"),
            "name": item.get("name"),
            "audience_size": item.get("audience_size_upper_bound", 0),
            "path": item.get("path", []),
        }
        for item in data.get("data", [])
    ]
