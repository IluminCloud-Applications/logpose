from datetime import datetime, timedelta
from database.core.timezone import now_sp


def resolve_date_range(
    preset: str,
    date_start: str | None = None,
    date_end: str | None = None,
) -> tuple[datetime | None, datetime | None]:
    """
    Resolve um preset de período em (start, end) datetimes.
    Retorna (None, None) para 'all'.
    """
    today = now_sp()

    if preset == "today":
        start = today.replace(hour=0, minute=0, second=0, microsecond=0)
        return start, today

    if preset == "7d":
        return today - timedelta(days=7), today

    if preset == "14d":
        return today - timedelta(days=14), today

    if preset == "30d":
        return today - timedelta(days=30), today

    if preset == "90d":
        return today - timedelta(days=90), today

    if preset == "custom" and date_start and date_end:
        try:
            start = datetime.strptime(date_start, "%Y-%m-%d")
            end = datetime.strptime(date_end, "%Y-%m-%d").replace(
                hour=23, minute=59, second=59
            )
            return start, end
        except ValueError:
            return None, None

    # "all" or fallback
    return None, None


def date_to_meta_format(dt: datetime) -> str:
    """Converte datetime para formato da Meta Ads: YYYY-MM-DD"""
    return dt.strftime("%Y-%m-%d")
