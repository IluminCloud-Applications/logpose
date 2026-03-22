"""
Migração automática no boot: adiciona novos valores aos ENUM types
e repara colunas que foram convertidas para VARCHAR por engano.
Idempotente — roda em todo boot sem efeito colateral.
"""
import logging
from sqlalchemy import text
from sqlalchemy.engine import Engine

logger = logging.getLogger(__name__)

# Novos valores a adicionar (pg_type_name, value)
_NEW_ENUM_VALUES = [
    ("webhookplatform", "api"),
    ("paymentplatform", "api"),
]

# Colunas que devem ser ENUM (tabela, coluna, pg_type_name)
_ENUM_COLUMNS = [
    ("transactions", "status", "transactionstatus"),
    ("transactions", "platform", "paymentplatform"),
    ("webhook_endpoints", "platform", "webhookplatform"),
    ("recoveries", "type", "recoverytype"),
    ("recoveries", "channel", "recoverychannel"),
    ("admins", "role", "userrole"),
    ("checkouts", "platform", "checkoutplatform"),
    ("campaign_markers", "marker_type", "markertype"),
    ("campaign_actions", "action_type", "actiontype"),
]


def run_enum_migrations(engine: Engine) -> None:
    """Adiciona 'api' aos ENUMs e repara colunas VARCHAR→ENUM."""

    # 1. Adicionar valores novos (precisa de AUTOCOMMIT)
    with engine.connect().execution_options(
        isolation_level="AUTOCOMMIT"
    ) as conn:
        for type_name, value in _NEW_ENUM_VALUES:
            try:
                exists = conn.execute(
                    text("SELECT 1 FROM pg_type WHERE typname = :n"),
                    {"n": type_name},
                ).fetchone()
                if exists:
                    conn.execute(text(
                        f"ALTER TYPE {type_name} ADD VALUE IF NOT EXISTS '{value}'"
                    ))
                    logger.info(f"✅ '{value}' em {type_name}")
            except Exception as e:
                logger.error(f"Erro ao adicionar {value} a {type_name}: {e}")

    # 2. Reparar colunas VARCHAR → ENUM (se necessário)
    with engine.connect() as conn:
        for table, column, enum_type in _ENUM_COLUMNS:
            try:
                row = conn.execute(text(
                    "SELECT data_type FROM information_schema.columns "
                    "WHERE table_name = :t AND column_name = :c"
                ), {"t": table, "c": column}).fetchone()

                if row is None:
                    continue

                if row[0] == "character varying":
                    logger.info(f"Reparando {table}.{column}: VARCHAR → {enum_type}")
                    conn.execute(text(
                        f"ALTER TABLE {table} ALTER COLUMN {column} "
                        f"TYPE {enum_type} USING {column}::{enum_type}"
                    ))
                    conn.commit()
                    logger.info(f"✅ {table}.{column} restaurado")
            except Exception as e:
                logger.error(f"Erro {table}.{column}: {e}", exc_info=True)
                conn.rollback()
