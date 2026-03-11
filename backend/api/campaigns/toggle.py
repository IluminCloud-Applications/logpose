"""
API para ligar/desligar campanhas, conjuntos e anúncios no Meta Ads.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database.core.connection import get_db
from database.models.facebook_account import FacebookAccount
from api.auth.deps import get_current_user
from integrations.meta_ads.manage import toggle_entity_status

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


class ToggleRequest(BaseModel):
    account_id: int
    entity_id: str
    entity_type: str  # "campaign" | "adset" | "ad"
    active: bool


@router.post("/toggle")
async def toggle_status(
    payload: ToggleRequest,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Liga ou desliga uma campanha, conjunto ou anúncio."""
    fb_account = db.query(FacebookAccount).filter(
        FacebookAccount.id == payload.account_id
    ).first()

    if not fb_account:
        raise HTTPException(status_code=404, detail="Conta Facebook não encontrada")

    new_status = "ACTIVE" if payload.active else "PAUSED"

    result = await toggle_entity_status(
        access_token=fb_account.access_token,
        entity_id=payload.entity_id,
        entity_type=payload.entity_type,
        new_status=new_status,
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error", "Erro ao alterar status"))

    return {"status": "ok", "new_status": new_status.lower()}
