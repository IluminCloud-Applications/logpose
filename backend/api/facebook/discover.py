"""
Descobre todas as contas de anúncio vinculadas a um Business Manager (BM).
Usa a Graph API da Meta para listar owned_ad_accounts.
"""
import os
import logging
import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from api.auth.deps import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/facebook", tags=["facebook"])

GRAPH_API_VERSION = os.getenv("META_GRAPH_API_VERSION", "v25.0")
GRAPH_API_BASE = f"https://graph.facebook.com/{GRAPH_API_VERSION}"


class DiscoverRequest(BaseModel):
    access_token: str
    business_id: str


class DiscoveredAccount(BaseModel):
    account_id: str
    name: str


class DiscoverResponse(BaseModel):
    accounts: list[DiscoveredAccount]
    total: int


@router.post("/accounts/discover", response_model=DiscoverResponse)
async def discover_accounts(
    payload: DiscoverRequest,
    _=Depends(get_current_user),
):
    """
    Lista todas as contas de anúncio de um Business Manager.
    Faz paginação automática para BMs com muitas contas.
    """
    url = f"{GRAPH_API_BASE}/{payload.business_id}/owned_ad_accounts"
    params = {
        "access_token": payload.access_token,
        "fields": "account_id,name",
        "limit": 100,
    }

    accounts: list[DiscoveredAccount] = []

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, params=params)

            if response.status_code != 200:
                error_data = response.json()
                error_msg = (
                    error_data.get("error", {}).get("message", "Erro desconhecido")
                )
                raise HTTPException(
                    status_code=400,
                    detail=f"Erro na API da Meta: {error_msg}",
                )

            data = response.json()
            accounts.extend(_parse_accounts(data))

            # Paginação automática
            while "paging" in data and "next" in data["paging"]:
                response = await client.get(data["paging"]["next"])
                if response.status_code != 200:
                    break
                data = response.json()
                accounts.extend(_parse_accounts(data))

    except httpx.RequestError as e:
        logger.error(f"Erro ao conectar com a Meta API: {e}")
        raise HTTPException(
            status_code=502,
            detail="Não foi possível conectar com a API da Meta",
        )

    return DiscoverResponse(accounts=accounts, total=len(accounts))


def _parse_accounts(data: dict) -> list[DiscoveredAccount]:
    """Extrai contas do payload da Graph API."""
    result = []
    for item in data.get("data", []):
        account_id = item.get("account_id", item.get("id", ""))
        name = item.get("name", account_id)
        if account_id:
            # Garante que tenha o prefixo act_
            if not account_id.startswith("act_"):
                account_id = f"act_{account_id}"
            result.append(DiscoveredAccount(account_id=account_id, name=name))
    return result
