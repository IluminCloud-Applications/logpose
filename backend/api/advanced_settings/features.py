from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database.core.connection import get_db
from database.models.company import CompanySettings
from api.auth.deps import get_current_user, require_role

router = APIRouter(prefix="/advanced-settings", tags=["advanced-settings"])


class FeaturesResponse(BaseModel):
    stripe_enabled: bool

    class Config:
        from_attributes = True


class FeaturesUpdate(BaseModel):
    stripe_enabled: bool


def _get_or_create_settings(db: Session) -> CompanySettings:
    settings = db.query(CompanySettings).first()
    if not settings:
        settings = CompanySettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("/features", response_model=FeaturesResponse)
def get_features(db: Session = Depends(get_db), _=Depends(get_current_user)):
    settings = _get_or_create_settings(db)
    return FeaturesResponse(stripe_enabled=settings.stripe_enabled or False)


@router.put("/features", response_model=FeaturesResponse)
def update_features(
    payload: FeaturesUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_role("owner")),
):
    settings = _get_or_create_settings(db)
    settings.stripe_enabled = payload.stripe_enabled
    db.commit()
    db.refresh(settings)
    return FeaturesResponse(stripe_enabled=settings.stripe_enabled)
