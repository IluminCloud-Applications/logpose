"""
API para ligar/desligar campanhas, conjuntos e anúncios no Meta Ads.
Registra a ação no banco para aprendizado da AI.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database.core.connection import get_db
from database.models.facebook_account import FacebookAccount
from database.models.campaign_action import ActionType
from api.auth.deps import get_current_user
from api.campaigns.actions import record_campaign_action
from integrations.meta_ads.manage import toggle_entity_status

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


class ToggleRequest(BaseModel):
    account_id: int
    entity_id: str
    entity_type: str  # "campaign" | "adset" | "ad"
    active: bool
    # Dados para aprendizado da AI
    entity_name: str = ""
    metrics: dict = {}
    budget: float = 0


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

    # Registrar ação para aprendizado da AI
    action_type = ActionType.ACTIVATE if payload.active else ActionType.PAUSE
    try:
        record_campaign_action(
            db=db,
            entity_id=payload.entity_id,
            entity_type=payload.entity_type,
            entity_name=payload.entity_name or payload.entity_id,
            action_type=action_type,
            metrics=payload.metrics,
            budget_before=payload.budget,
            budget_after=payload.budget,
        )
    except Exception:
        pass  # Não bloqueia o toggle se o log falhar

    return {"status": "ok", "new_status": new_status.lower()}
