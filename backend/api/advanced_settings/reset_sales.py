from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.core.connection import get_db
from database.models.transaction import Transaction
from database.models.recovery import Recovery
from database.models.customer import Customer
from database.models.customer_product import CustomerProduct
from database.models.refund_reason import RefundReason
from api.auth.deps import require_role

router = APIRouter(prefix="/advanced-settings", tags=["advanced-settings"])


@router.delete("/reset-sales")
def reset_sales(
    db: Session = Depends(get_db),
    user=Depends(require_role("owner")),
):
    try:
        # Deleta na ordem correta para respeitar FKs
        deleted_refund_reasons = db.query(RefundReason).delete()
        deleted_customer_products = db.query(CustomerProduct).delete()
        deleted_recoveries = db.query(Recovery).delete()
        deleted_transactions = db.query(Transaction).delete()
        deleted_customers = db.query(Customer).delete()

        db.commit()

        return {
            "success": True,
            "deleted": {
                "transactions": deleted_transactions,
                "recoveries": deleted_recoveries,
                "customers": deleted_customers,
                "customer_products": deleted_customer_products,
                "refund_reasons": deleted_refund_reasons,
            },
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao resetar vendas: {str(e)}")
