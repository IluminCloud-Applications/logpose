from sqlalchemy import Column, Integer, String, DateTime
from database.core.connection import Base
from database.core.timezone import CREATED_AT_DEFAULT, UPDATED_AT_DEFAULT


class RecoveryChannelConfig(Base):
    """
    Configuração de mapeamento de canal de recuperação.
    O campo `src` da transaction contém o valor, e o `keyword`
    define qual substring identifica cada canal.
    Ex: canal='whatsapp', keyword='zap' → se src contém 'zap', é WhatsApp.
    """
    __tablename__ = "recovery_channel_configs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    channel = Column(String(50), nullable=False, unique=True)
    keyword = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=CREATED_AT_DEFAULT)
    updated_at = Column(
        DateTime,
        server_default=UPDATED_AT_DEFAULT,
        onupdate=UPDATED_AT_DEFAULT,
    )
