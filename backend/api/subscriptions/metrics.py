from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database.core.connection import get_db
from database.models.stripe_account import StripeAccount
from integrations.stripe.subscriptions import (
    compute_subscription_metrics,
    fetch_stripe_products,
)
from integrations.stripe.mrr_history import compute_mrr_history
from api.auth.deps import get_current_user

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


def _get_first_stripe_account(db: Session) -> StripeAccount:
    """Retorna a primeira conta Stripe configurada ou 404."""
    account = db.query(StripeAccount).first()
    if not account:
        raise HTTPException(
            status_code=404,
            detail="Nenhuma conta Stripe configurada. Adicione uma em Integrações → Stripe.",
        )
    return account


@router.get("/metrics")
def get_subscription_metrics(
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    product_id: str | None = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    account = _get_first_stripe_account(db)
    try:
        metrics = compute_subscription_metrics(
            api_key=account.api_key,
            date_from=date_from,
            date_to=date_to,
            product_id=product_id,
        )
        return metrics
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao buscar métricas do Stripe: {str(e)}",
        )


@router.get("/mrr-history")
def get_mrr_history(
    months: int = Query(12, ge=3, le=24),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    account = _get_first_stripe_account(db)
    try:
        return compute_mrr_history(account.api_key, months=months)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao buscar histórico de MRR: {str(e)}",
        )


@router.get("/products")
def get_stripe_products(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    account = _get_first_stripe_account(db)
    try:
        return fetch_stripe_products(account.api_key)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao buscar produtos do Stripe: {str(e)}",
        )

