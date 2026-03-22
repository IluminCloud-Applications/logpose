from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from database.core.connection import get_db
from database.models.stripe_account import StripeAccount
from integrations.stripe.client import validate_stripe_key
from api.auth.deps import get_current_user

router = APIRouter(prefix="/stripe", tags=["stripe"])


class StripeAccountCreate(BaseModel):
    name: str
    api_key: str


class StripeAccountResponse(BaseModel):
    id: int
    name: str
    api_key: str
    created_at: datetime | None = None

    class Config:
        from_attributes = True


@router.get("/accounts", response_model=list[StripeAccountResponse])
def list_accounts(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return db.query(StripeAccount).order_by(StripeAccount.id.desc()).all()


@router.post("/accounts", response_model=StripeAccountResponse, status_code=201)
def create_account(
    payload: StripeAccountCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    if not validate_stripe_key(payload.api_key):
        raise HTTPException(
            status_code=400,
            detail="API Key inválida. Verifique se é uma Secret Key válida do Stripe.",
        )

    account = StripeAccount(
        name=payload.name,
        api_key=payload.api_key,
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


@router.delete("/accounts/{account_id}", status_code=204)
def delete_account(
    account_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    account = (
        db.query(StripeAccount)
        .filter(StripeAccount.id == account_id)
        .first()
    )
    if not account:
        raise HTTPException(status_code=404, detail="Conta Stripe não encontrada")
    db.delete(account)
    db.commit()
