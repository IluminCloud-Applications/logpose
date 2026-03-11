"""
API para alterar orçamento de campanhas (CBO) ou conjuntos (ABO).
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database.core.connection import get_db
from database.models.facebook_account import FacebookAccount
from api.auth.deps import get_current_user
from integrations.meta_ads.manage import update_budget

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


class BudgetRequest(BaseModel):
    account_id: int
    entity_id: str
    entity_type: str  # "campaign" (CBO) | "adset" (ABO)
    daily_budget: float  # valor em reais


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

    return {"status": "ok", "daily_budget": payload.daily_budget}
