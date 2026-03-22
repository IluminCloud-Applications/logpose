"""
Migração automática no boot: adiciona 'API' aos ENUM types
e repara colunas VARCHAR (da migração errada) de volta para ENUM.
Idempotente — roda em todo boot sem efeito colateral.
"""
import logging
from sqlalchemy import text
from sqlalchemy.engine import Engine

logger = logging.getLogger(__name__)

# SQLAlchemy usa os NOMES dos membros do enum, não os valores.
# Ex: WebhookPlatform.API → armazena 'API', não 'api'.
_NEW_ENUM_VALUES = [
    ("webhookplatform", "API"),
    ("paymentplatform", "API"),
]

# Mapeamento value→name para normalizar dados da era VARCHAR
_DATA_FIXES: dict[tuple[str, str], dict[str, str]] = {
    ("transactions", "status"): {
        "approved": "APPROVED", "refunded": "REFUNDED",
        "chargeback": "CHARGEBACK", "pending": "PENDING",
    },
    ("transactions", "platform"): {
        "kiwify": "KIWIFY", "payt": "PAYT", "api": "API",
    },
    ("webhook_endpoints", "platform"): {
        "kiwify": "KIWIFY", "payt": "PAYT", "api": "API",
    },
    ("recoveries", "type"): {
        "abandoned_cart": "ABANDONED_CART",
        "declined_card": "DECLINED_CART",
        "unpaid_pix": "UNPAID_PIX",
    },
    ("recoveries", "channel"): {
        "whatsapp": "WHATSAPP", "email": "EMAIL", "sms": "SMS",
        "back_redirect": "BACK_REDIRECT", "other": "OTHER",
    },
    ("checkouts", "platform"): {
        "kiwify": "KIWIFY", "payt": "PAYT",
    },
    ("campaign_markers", "marker_type"): {
        "video": "VIDEO", "checkout": "CHECKOUT",
        "product": "PRODUCT", "platform": "PLATFORM",
    },
    ("campaign_actions", "action_type"): {
        "budget_increase": "BUDGET_INCREASE",
        "budget_decrease": "BUDGET_DECREASE",
        "pause": "PAUSE", "activate": "ACTIVATE",
    },
    # UserRole: nomes já são lowercase (owner, admin, viewer)
}

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
    # 1. Adicionar novos valores aos ENUMs (AUTOCOMMIT obrigatório)
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
                        f"ALTER TYPE {type_name} "
                        f"ADD VALUE IF NOT EXISTS '{value}'"
                    ))
                    logger.info(f"✅ '{value}' em {type_name}")
            except Exception as e:
                logger.error(f"Erro adding {value} to {type_name}: {e}")

    # 2. Reparar colunas VARCHAR → ENUM (se necessário)
    with engine.connect() as conn:
        for table, column, enum_type in _ENUM_COLUMNS:
            try:
                row = conn.execute(text(
                    "SELECT data_type FROM information_schema.columns "
                    "WHERE table_name = :t AND column_name = :c"
                ), {"t": table, "c": column}).fetchone()

                if row is None or row[0] != "character varying":
                    continue

                logger.info(f"Reparando {table}.{column}")

                # Normalizar valores lowercase → nomes uppercase
                fixes = _DATA_FIXES.get((table, column), {})
                for old_val, new_val in fixes.items():
                    conn.execute(text(
                        f"UPDATE {table} SET {column} = :new "
                        f"WHERE {column} = :old"
                    ), {"old": old_val, "new": new_val})

                conn.execute(text(
                    f"ALTER TABLE {table} ALTER COLUMN {column} "
                    f"TYPE {enum_type} USING {column}::{enum_type}"
                ))
                conn.commit()
                logger.info(f"✅ {table}.{column} restaurado")
            except Exception as e:
                logger.error(f"Erro {table}.{column}: {e}", exc_info=True)
                conn.rollback()
