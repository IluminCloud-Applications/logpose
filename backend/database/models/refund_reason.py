from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from database.core.connection import Base
from database.core.timezone import CREATED_AT_DEFAULT


class RefundReason(Base):
    """Motivo do reembolso / chargeback registrado pelo operador."""
    __tablename__ = "refund_reasons"

    id = Column(Integer, primary_key=True, autoincrement=True)
    transaction_id = Column(
        Integer, ForeignKey("transactions.id"), nullable=False, unique=True, index=True,
    )
    reason_code = Column(String(100), nullable=False)
    reason_text = Column(String(500), nullable=True)
    created_at = Column(DateTime, server_default=CREATED_AT_DEFAULT)
