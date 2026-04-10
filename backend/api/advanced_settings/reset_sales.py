from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.core.connection import get_db
from database.models.transaction import Transaction
from database.models.recovery import Recovery
from database.models.customer import Customer
from database.models.customer_product import CustomerProduct
from database.models.refund_reason import RefundReason
from database.models.product import Product
from database.models.product_alias import ProductAlias
from database.models.product_items import Checkout, OrderBump, Upsell
from api.auth.deps import require_role

router = APIRouter(prefix="/advanced-settings", tags=["advanced-settings"])


@router.delete("/reset-sales")
def reset_sales(
    db: Session = Depends(get_db),
    user=Depends(require_role("owner")),
):
    try:
        # 1. Filhos de transactions
        db.query(RefundReason).delete()

        # 2. Filhos de customers
        db.query(CustomerProduct).delete()
        db.query(Recovery).delete()

        # 3. Transactions (FK → customers, products SET NULL)
        db.query(Transaction).delete()

        # 4. Customers
        db.query(Customer).delete()

        # 5. Filhos de products
        db.query(ProductAlias).delete()
        db.query(Checkout).delete()
        db.query(OrderBump).delete()
        db.query(Upsell).delete()

        # 6. Products
        db.query(Product).delete()

        db.commit()

        return {"success": True}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Erro ao resetar vendas: {str(e)}"
        )
