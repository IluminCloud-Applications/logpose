from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from database.core.connection import get_db
from database.models.vturb_account import VturbAccount
from api.auth.deps import get_current_user

router = APIRouter(prefix="/vturb", tags=["vturb"])


class VturbAccountCreate(BaseModel):
    name: str
    api_key: str


class VturbAccountResponse(BaseModel):
    id: int
    name: str
    api_key: str
    created_at: datetime | None = None

    class Config:
        from_attributes = True


@router.get("/accounts", response_model=list[VturbAccountResponse])
def list_accounts(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return db.query(VturbAccount).order_by(VturbAccount.id.desc()).all()


@router.post("/accounts", response_model=VturbAccountResponse, status_code=201)
def create_account(
    payload: VturbAccountCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    account = VturbAccount(
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
    account = db.query(VturbAccount).filter(VturbAccount.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Conta VTurb não encontrada")
    db.delete(account)
    db.commit()
