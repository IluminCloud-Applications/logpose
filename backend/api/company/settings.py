from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database.core.connection import get_db
from database.models.company import CompanySettings
from api.auth.deps import get_current_user

router = APIRouter(prefix="/company", tags=["company"])


class OperationalCostSchema(BaseModel):
    id: str
    name: str
    amount: float


class CompanySettingsSchema(BaseModel):
    tax_rate: float
    operational_costs: list[OperationalCostSchema]


class CompanySettingsResponse(BaseModel):
    tax_rate: float
    operational_costs: list[OperationalCostSchema]

    class Config:
        from_attributes = True


@router.get("/settings", response_model=CompanySettingsResponse)
def get_settings(db: Session = Depends(get_db), _=Depends(get_current_user)):
    settings = db.query(CompanySettings).first()
    if not settings:
        settings = CompanySettings(
            tax_rate=12.3,
            operational_costs=[],
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.put("/settings", response_model=CompanySettingsResponse)
def update_settings(
    payload: CompanySettingsSchema,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    settings = db.query(CompanySettings).first()
    if not settings:
        settings = CompanySettings()
        db.add(settings)

    settings.tax_rate = payload.tax_rate
    settings.operational_costs = [
        c.model_dump() for c in payload.operational_costs
    ]
    db.commit()
    db.refresh(settings)
    return settings
