from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database.core.connection import get_db
from database.models.company import CompanySettings, DEFAULT_KPI_COLORS, DEFAULT_AI_INSTRUCTIONS
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


# ── KPI Colors schemas ──────────────────────────────────
class KpiThreshold(BaseModel):
    min: Optional[float] = None
    max: Optional[float] = None


class KpiColorEntry(BaseModel):
    green: KpiThreshold
    yellow: KpiThreshold
    red: KpiThreshold


class KpiColorsSchema(BaseModel):
    roas: Optional[KpiColorEntry] = None
    cpa: Optional[KpiColorEntry] = None
    ctr: Optional[KpiColorEntry] = None
    cpc: Optional[KpiColorEntry] = None


def _get_or_create_settings(db: Session) -> CompanySettings:
    settings = db.query(CompanySettings).first()
    if not settings:
        settings = CompanySettings(
            tax_rate=12.3,
            operational_costs=[],
            kpi_colors=DEFAULT_KPI_COLORS,
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("/settings", response_model=CompanySettingsResponse)
def get_settings(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return _get_or_create_settings(db)


@router.put("/settings", response_model=CompanySettingsResponse)
def update_settings(
    payload: CompanySettingsSchema,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    settings = _get_or_create_settings(db)
    settings.tax_rate = payload.tax_rate
    settings.operational_costs = [
        c.model_dump() for c in payload.operational_costs
    ]
    db.commit()
    db.refresh(settings)
    return settings


# ── KPI Colors endpoints ────────────────────────────────
@router.get("/kpi-colors")
def get_kpi_colors(db: Session = Depends(get_db), _=Depends(get_current_user)):
    settings = _get_or_create_settings(db)
    return settings.kpi_colors or DEFAULT_KPI_COLORS


@router.put("/kpi-colors")
def update_kpi_colors(
    payload: KpiColorsSchema,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    settings = _get_or_create_settings(db)
    settings.kpi_colors = payload.model_dump()
    db.commit()
    db.refresh(settings)
    return settings.kpi_colors


# ── AI Instructions schemas ─────────────────────────────
class MetricRule(BaseModel):
    good: Optional[str] = None
    bad: Optional[str] = None
    average: Optional[str] = None


class AiMetricsConfig(BaseModel):
    roas: Optional[MetricRule] = None
    cpa: Optional[MetricRule] = None
    cpc: Optional[MetricRule] = None
    connect_rate: Optional[MetricRule] = None


class AiInstructionsSchema(BaseModel):
    metrics: AiMetricsConfig
    additional_prompt: str = ""


# ── AI Instructions endpoints ───────────────────────────
@router.get("/ai-instructions")
def get_ai_instructions(
    db: Session = Depends(get_db), _=Depends(get_current_user)
):
    settings = _get_or_create_settings(db)
    return settings.ai_instructions or DEFAULT_AI_INSTRUCTIONS


@router.put("/ai-instructions")
def update_ai_instructions(
    payload: AiInstructionsSchema,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    settings = _get_or_create_settings(db)
    settings.ai_instructions = payload.model_dump()
    db.commit()
    db.refresh(settings)
    return settings.ai_instructions
