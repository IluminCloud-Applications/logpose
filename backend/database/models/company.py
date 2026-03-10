from sqlalchemy import Column, Integer, Float, JSON, DateTime
from database.core.connection import Base
from database.core.timezone import UPDATED_AT_DEFAULT


class CompanySettings(Base):
    __tablename__ = "company_settings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tax_rate = Column(Float, default=12.3)
    operational_costs = Column(JSON, default=list)
    updated_at = Column(
        DateTime,
        server_default=UPDATED_AT_DEFAULT,
        onupdate=UPDATED_AT_DEFAULT,
    )
