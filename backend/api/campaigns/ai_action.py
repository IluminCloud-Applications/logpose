"""
Endpoint que executa ações sugeridas pela AI no chat.
Recebe o tipo de ação + entity_id e executa via Meta Ads API.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database.core.connection import get_db
from database.models.facebook_account import FacebookAccount
from database.models.campaign_action import ActionType
from api.auth.deps import get_current_user
from api.campaigns.actions import record_campaign_action
from integrations.meta_ads.manage import toggle_entity_status, update_budget

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


class AiActionRequest(BaseModel):
    action: str  # increase_budget | decrease_budget | set_budget | pause | activate
    entity_id: str
    entity_type: str  # campaign | adset
    entity_name: str
    value: float = 0  # valor do orçamento (para budget actions)
    current_budget: float = 0  # orçamento atual
    metrics: dict = {}


@router.post("/ai-action")
async def execute_ai_action(
    payload: AiActionRequest,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Executa uma ação sugerida pela AI."""
    fb_account = db.query(FacebookAccount).first()
    if not fb_account:
        raise HTTPException(status_code=404, detail="Nenhuma conta Facebook configurada")

    action = payload.action
    result_msg = ""
    new_budget = payload.current_budget
    action_type = ActionType.PAUSE

    if action in ("pause", "activate"):
        new_status = "ACTIVE" if action == "activate" else "PAUSED"
        result = await toggle_entity_status(
            access_token=fb_account.access_token,
            entity_id=payload.entity_id,
            entity_type=payload.entity_type,
            new_status=new_status,
        )
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result.get("error", "Erro"))

        action_type = ActionType.ACTIVATE if action == "activate" else ActionType.PAUSE
        result_msg = f"{'Ativada' if action == 'activate' else 'Pausada'}: {payload.entity_name}"

    elif action in ("increase_budget", "decrease_budget", "set_budget"):
        if action == "increase_budget":
            new_budget = payload.current_budget + payload.value
        elif action == "decrease_budget":
            new_budget = max(1, payload.current_budget - payload.value)
        else:
            new_budget = payload.value

        result = await update_budget(
            access_token=fb_account.access_token,
            entity_id=payload.entity_id,
            entity_type=payload.entity_type,
            daily_budget_reais=new_budget,
        )
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result.get("error", "Erro"))

        action_type = (
            ActionType.BUDGET_INCREASE if new_budget > payload.current_budget
            else ActionType.BUDGET_DECREASE
        )
        result_msg = (
            f"Orçamento de {payload.entity_name}: "
            f"R${payload.current_budget:.0f} → R${new_budget:.0f}"
        )

    else:
        raise HTTPException(status_code=400, detail=f"Ação desconhecida: {action}")

    # Registrar ação para aprendizado
    try:
        record_campaign_action(
            db=db,
            entity_id=payload.entity_id,
            entity_type=payload.entity_type,
            entity_name=payload.entity_name,
            action_type=action_type,
            metrics=payload.metrics,
            budget_before=payload.current_budget,
            budget_after=new_budget if action not in ("pause", "activate") else payload.current_budget,
        )
    except Exception:
        pass

    return {"status": "ok", "message": result_msg}
