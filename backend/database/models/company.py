from sqlalchemy import Column, Integer, Float, JSON, Text, DateTime
from database.core.connection import Base
from database.core.timezone import UPDATED_AT_DEFAULT


DEFAULT_KPI_COLORS = {
    "roas": {
        "green": {"min": 3},
        "yellow": {"min": 2, "max": 3},
        "red": {"max": 2},
    },
    "cpa": None,
    "ctr": None,
    "cpc": None,
}

DEFAULT_AI_INSTRUCTIONS = {
    "metrics": {
        "roas": None,
        "cpa": None,
        "cpc": None,
        "connect_rate": None,
    },
    "additional_prompt": "",
}


class CompanySettings(Base):
    __tablename__ = "company_settings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tax_rate = Column(Float, default=12.3)
    operational_costs = Column(JSON, default=list)
    kpi_colors = Column(JSON, default=lambda: DEFAULT_KPI_COLORS.copy())
    ai_instructions = Column(JSON, default=lambda: DEFAULT_AI_INSTRUCTIONS.copy())
    updated_at = Column(
        DateTime,
        server_default=UPDATED_AT_DEFAULT,
        onupdate=UPDATED_AT_DEFAULT,
    )
