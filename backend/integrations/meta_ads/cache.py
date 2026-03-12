"""
Cache em memória com TTL para respostas da Meta Marketing API.
Evita chamadas duplicadas à API durante um período curto.
"""
import time
from typing import Any

# TTL padrão: 5 minutos
DEFAULT_TTL_SECONDS = 300

_cache: dict[str, dict[str, Any]] = {}


def get_cached(key: str) -> Any | None:
    """Retorna dado do cache se não expirou."""
    entry = _cache.get(key)
    if not entry:
        return None
    if time.time() > entry["expires_at"]:
        _cache.pop(key, None)
        return None
    return entry["data"]


def set_cached(key: str, data: Any, ttl: int = DEFAULT_TTL_SECONDS) -> None:
    """Armazena dado no cache com TTL."""
    _cache[key] = {
        "data": data,
        "expires_at": time.time() + ttl,
    }


def build_cache_key(
    account_id: str,
    endpoint: str,
    date_start: str,
    date_end: str,
    extra: str = "",
) -> str:
    """Gera chave única para cache."""
    parts = [account_id, endpoint, date_start, date_end]
    if extra:
        parts.append(extra)
    return "|".join(parts)


def invalidate_account_cache(account_id: str) -> None:
    """Remove todas as entradas de cache de uma conta."""
    keys_to_remove = [
        k for k in _cache if k.startswith(account_id)
    ]
    for k in keys_to_remove:
        _cache.pop(k, None)


def clear_all_cache() -> None:
    """Limpa todo o cache."""
    _cache.clear()
