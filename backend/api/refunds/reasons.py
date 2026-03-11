"""Endpoint para salvar motivo do reembolso."""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.core.connection import get_db
from database.models.refund_reason import RefundReason
from api.auth.deps import get_current_user

router = APIRouter(prefix="/refunds", tags=["refunds"])


class ReasonPayload(BaseModel):
    transaction_id: int
    reason_code: str
    reason_text: str | None = None


@router.post("/reasons")
def save_reason(
    payload: ReasonPayload,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Cria ou atualiza o motivo de reembolso de uma transação."""
    existing = db.query(RefundReason).filter(
        RefundReason.transaction_id == payload.transaction_id
    ).first()

    if existing:
        existing.reason_code = payload.reason_code
        existing.reason_text = payload.reason_text
    else:
        existing = RefundReason(
            transaction_id=payload.transaction_id,
            reason_code=payload.reason_code,
            reason_text=payload.reason_text,
        )
        db.add(existing)

    db.commit()
    db.refresh(existing)

    return {
        "id": existing.id,
        "transaction_id": existing.transaction_id,
        "reason_code": existing.reason_code,
        "reason_text": existing.reason_text,
    }
