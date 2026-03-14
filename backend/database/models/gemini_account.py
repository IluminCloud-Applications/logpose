from sqlalchemy import Column, Integer, String, DateTime
from database.core.connection import Base
from database.core.timezone import CREATED_AT_DEFAULT


class GeminiAccount(Base):
    """
    Conta Gemini AI conectada.
    Armazena API key + modelo selecionado para o assistente.
    """
    __tablename__ = "gemini_accounts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    api_key = Column(String(500), nullable=False)
    model = Column(String(100), nullable=False, default="gemini-2.0-flash-lite")
    created_at = Column(DateTime, server_default=CREATED_AT_DEFAULT)
