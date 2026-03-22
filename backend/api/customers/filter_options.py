from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.core.connection import get_db
from database.models.product import Product
from database.models.transaction import Transaction
from api.auth.deps import get_current_user

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("/filter-options")
def customer_filter_options(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    products = db.query(Product.id, Product.name).order_by(Product.name).all()
    platforms = (
        db.query(Transaction.platform)
        .filter(Transaction.platform.isnot(None))
        .distinct()
        .all()
    )
    campaigns = (
        db.query(Transaction.utm_campaign)
        .filter(Transaction.utm_campaign.isnot(None), Transaction.utm_campaign != "")
        .distinct()
        .order_by(Transaction.utm_campaign)
        .all()
    )
    sources = (
        db.query(Transaction.src)
        .filter(Transaction.src.isnot(None), Transaction.src != "")
        .distinct()
        .order_by(Transaction.src)
        .all()
    )

    platform_labels = {"kiwify": "Kiwify", "payt": "PayT", "api": "API"}

    return {
        "products": [{"id": p.id, "name": p.name} for p in products],
        "platforms": [
            {"value": p[0], "label": platform_labels.get(p[0], p[0])}
            for p in platforms
        ],
        "campaigns": [c[0] for c in campaigns],
        "sources": [s[0] for s in sources],
    }
