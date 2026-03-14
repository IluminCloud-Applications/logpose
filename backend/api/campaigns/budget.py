"""
API para alterar orçamento de campanhas (CBO) ou conjuntos (ABO).
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
from integrations.meta_ads.manage import update_budget

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


class BudgetRequest(BaseModel):
    account_id: int
    entity_id: str
    entity_type: str  # "campaign" (CBO) | "adset" (ABO)
    daily_budget: float  # valor em reais
    # Dados para aprendizado da AI
    entity_name: str = ""
    budget_before: float = 0
    metrics: dict = {}


@router.post("/budget")
async def update_entity_budget(
    payload: BudgetRequest,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Atualiza o orçamento diário. Meta API espera centavos."""
    if payload.entity_type not in ("campaign", "adset"):
        raise HTTPException(
            status_code=400,
            detail="entity_type deve ser 'campaign' (CBO) ou 'adset' (ABO)",
        )

    fb_account = db.query(FacebookAccount).filter(
        FacebookAccount.id == payload.account_id
    ).first()

    if not fb_account:
        raise HTTPException(status_code=404, detail="Conta Facebook não encontrada")

    result = await update_budget(
        access_token=fb_account.access_token,
        entity_id=payload.entity_id,
        entity_type=payload.entity_type,
        daily_budget_reais=payload.daily_budget,
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error", "Erro ao alterar orçamento"))

    # Registrar ação para aprendizado da AI
    action_type = (
        ActionType.BUDGET_INCREASE
        if payload.daily_budget > payload.budget_before
        else ActionType.BUDGET_DECREASE
    )
    try:
        record_campaign_action(
            db=db,
            entity_id=payload.entity_id,
            entity_type=payload.entity_type,
            entity_name=payload.entity_name or payload.entity_id,
            action_type=action_type,
            metrics=payload.metrics,
            budget_before=payload.budget_before,
            budget_after=payload.daily_budget,
        )
    except Exception:
        pass  # Não bloqueia o budget update se o log falhar

    return {"status": "ok", "daily_budget": payload.daily_budget}
