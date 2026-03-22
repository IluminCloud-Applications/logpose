"""
Script de migração automática executado no boot da aplicação.
Converte colunas ENUM nativas do PostgreSQL para VARCHAR,
permitindo que o create_all funcione sem migrations manuais.

Cada alteração é idempotente: verifica o tipo atual antes de agir.
"""
import logging
from sqlalchemy import text
from sqlalchemy.engine import Engine

logger = logging.getLogger(__name__)

# Lista de (tabela, coluna) que precisam ser VARCHAR
_ENUM_TO_VARCHAR: list[tuple[str, str]] = [
    ("transactions", "status"),
    ("transactions", "platform"),
    ("webhook_endpoints", "platform"),
    ("recoveries", "type"),
    ("recoveries", "channel"),
    ("admins", "role"),
    ("checkouts", "platform"),
    ("campaign_markers", "marker_type"),
    ("campaign_actions", "action_type"),
]

_CHECK_SQL = text("""
    SELECT data_type
    FROM information_schema.columns
    WHERE table_name = :table AND column_name = :column
""")

_ALTER_SQL = (
    "ALTER TABLE {table} ALTER COLUMN {column} "
    "TYPE VARCHAR(50) USING {column}::text"
)


def run_enum_migrations(engine: Engine) -> None:
    """
    Para cada (tabela, coluna) cadastrado, verifica se o tipo é 'USER-DEFINED'
    (ENUM nativo do PostgreSQL). Se for, converte para VARCHAR(50).
    """
    with engine.connect() as conn:
        for table, column in _ENUM_TO_VARCHAR:
            try:
                row = conn.execute(
                    _CHECK_SQL, {"table": table, "column": column}
                ).fetchone()

                if row is None:
                    # Tabela/coluna ainda não existe — create_all vai criar como VARCHAR
                    continue

                data_type = row[0]
                if data_type == "USER-DEFINED":
                    logger.info(f"Convertendo ENUM → VARCHAR: {table}.{column}")
                    conn.execute(text(_ALTER_SQL.format(table=table, column=column)))
                    conn.commit()
                    logger.info(f"✅ {table}.{column} convertido com sucesso")

            except Exception as e:
                logger.error(
                    f"Erro ao migrar {table}.{column}: {e}", exc_info=True
                )
                conn.rollback()
