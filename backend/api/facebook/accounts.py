from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from database.core.connection import get_db
from database.models.facebook_account import FacebookAccount
from api.auth.deps import get_current_user

router = APIRouter(prefix="/facebook", tags=["facebook"])


class FacebookAccountCreate(BaseModel):
    label: str
    account_id: str
    access_token: str


class FacebookAccountResponse(BaseModel):
    id: int
    label: str
    account_id: str
    access_token: str
    created_at: datetime | None = None

    class Config:
        from_attributes = True


@router.get("/accounts", response_model=list[FacebookAccountResponse])
def list_accounts(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return db.query(FacebookAccount).order_by(FacebookAccount.id.desc()).all()


@router.post("/accounts", response_model=FacebookAccountResponse, status_code=201)
def create_account(
    payload: FacebookAccountCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    existing = db.query(FacebookAccount).filter(
        FacebookAccount.account_id == payload.account_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Essa conta já está cadastrada"
        )

    account = FacebookAccount(
        label=payload.label,
        account_id=payload.account_id,
        access_token=payload.access_token,
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


class FacebookBulkCreate(BaseModel):
    accounts: list[dict]  # [{"label": "...", "account_id": "..."}]
    access_token: str


@router.post("/accounts/bulk", response_model=list[FacebookAccountResponse], status_code=201)
def create_accounts_bulk(
    payload: FacebookBulkCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    created = []
    for item in payload.accounts:
        account_id = item.get("account_id", "").strip()
        label = item.get("label", "").strip()
        if not account_id or not label:
            continue
        existing = db.query(FacebookAccount).filter(
            FacebookAccount.account_id == account_id
        ).first()
        if existing:
            continue
        account = FacebookAccount(
            label=label,
            account_id=account_id,
            access_token=payload.access_token,
        )
        db.add(account)
        db.flush()
        created.append(account)

    db.commit()
    return created


@router.delete("/accounts/{account_id}", status_code=204)
def delete_account(
    account_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    account = db.query(FacebookAccount).filter(FacebookAccount.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Conta Facebook não encontrada")
    db.delete(account)
    db.commit()
