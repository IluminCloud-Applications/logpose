from sqlalchemy import Column, Integer, String, DateTime
from database.core.connection import Base
from database.core.timezone import CREATED_AT_DEFAULT


class VturbAccount(Base):
    """
    Conta do VTurb conectada.
    Armazena API key para consumir métricas de plays/retention de VSL.
    """
    __tablename__ = "vturb_accounts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    api_key = Column(String(500), nullable=False)
    created_at = Column(DateTime, server_default=CREATED_AT_DEFAULT)
