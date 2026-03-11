from sqlalchemy import text
from datetime import datetime, date
from zoneinfo import ZoneInfo

# Timezone padrão: São Paulo (UTC-3 / UTC-2 no horário de verão)
SAO_PAULO_TZ = "America/Sao_Paulo"
SP_ZONE = ZoneInfo(SAO_PAULO_TZ)

# Default SQL para created_at e updated_at com timezone São Paulo
CREATED_AT_DEFAULT = text("(NOW() AT TIME ZONE 'America/Sao_Paulo')")
UPDATED_AT_DEFAULT = text("(NOW() AT TIME ZONE 'America/Sao_Paulo')")


def now_sp() -> datetime:
    """Retorna datetime.now() no timezone de São Paulo."""
    return datetime.now(SP_ZONE)


def today_sp() -> date:
    """Retorna a data de hoje no timezone de São Paulo."""
    return datetime.now(SP_ZONE).date()


def today_sp_str() -> str:
    """Retorna a data de hoje no formato YYYY-MM-DD (São Paulo)."""
    return today_sp().isoformat()

