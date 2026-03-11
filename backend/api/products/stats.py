from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database.core.connection import get_db
from database.models.product import Product
from database.models.product_items import Checkout, OrderBump, Upsell
from database.models.transaction import Transaction, TransactionStatus
from api.auth.deps import get_current_user

router = APIRouter(prefix="/products", tags=["product-stats"])


@router.get("/stats")
def get_all_product_stats(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """
    Retorna estatísticas agregadas de cada produto:
    - Vendas, faturamento, abandonos por checkout
    - Vendas e faturamento por order bump (calculadas pelo JSON order_bumps na transaction)
    - Vendas e faturamento por upsell (calculadas pelo external_id do produto na transaction)
    """
    products = db.query(Product).all()
    result = []

    for product in products:
        checkouts = db.query(Checkout).filter(Checkout.product_id == product.id).all()
        order_bumps = db.query(OrderBump).filter(OrderBump.product_id == product.id).all()
        upsells = db.query(Upsell).filter(Upsell.product_id == product.id).all()

        # Main product stats from transactions
        checkout_stats = _calc_checkout_stats(db, product, checkouts)
        ob_stats = _calc_order_bump_stats(db, product, order_bumps)
        upsell_stats = _calc_upsell_stats(db, upsells)

        result.append({
            "product_id": product.id,
            "checkouts": checkout_stats,
            "order_bumps": ob_stats,
            "upsells": upsell_stats,
        })

    return result


def _calc_checkout_stats(db: Session, product: Product, checkouts: list[Checkout]):
    """
    Para cada checkout, conta vendas approved e abandonos (pending)
    pelo product_id da transaction e pelo checkout_url.
    """
    stats = []
    for ck in checkouts:
        # Approved sales that match this product and checkout
        sales_q = db.query(func.count(Transaction.id), func.coalesce(func.sum(Transaction.amount), 0)).filter(
            Transaction.product_id == product.id,
            Transaction.status == TransactionStatus.APPROVED,
            Transaction.checkout_url == ck.url,
        ).first()

        # Pending/abandoned transactions for this checkout
        abandons_q = db.query(func.count(Transaction.id)).filter(
            Transaction.product_id == product.id,
            Transaction.status == TransactionStatus.PENDING,
            Transaction.checkout_url == ck.url,
        ).scalar()

        sales_count = sales_q[0] if sales_q else 0
        revenue = float(sales_q[1]) if sales_q else 0.0
        abandons = abandons_q or 0
        total_attempts = sales_count + abandons
        conversion = (sales_count / total_attempts * 100) if total_attempts > 0 else 0.0

        stats.append({
            "id": ck.id,
            "url": ck.url,
            "price": ck.price,
            "sales": sales_count,
            "revenue": revenue,
            "abandons": abandons,
            "conversion_rate": round(conversion, 2),
        })
    return stats


def _calc_order_bump_stats(db: Session, product: Product, order_bumps: list[OrderBump]):
    """
    Order bumps são armazenados no campo JSON `order_bumps` da transaction.
    Precisamos iterar as transactions approved deste produto e contar quanto
    cada OB apareceu no JSON (pelo external_id / code).
    """
    stats = []
    if not order_bumps:
        return stats

    # Get all approved transactions for this product that have order_bumps
    txns = db.query(Transaction).filter(
        Transaction.product_id == product.id,
        Transaction.status == TransactionStatus.APPROVED,
        Transaction.order_bumps.isnot(None),
    ).all()

    # Total approved sales for this product (for conversion calc)
    total_sales = db.query(func.count(Transaction.id)).filter(
        Transaction.product_id == product.id,
        Transaction.status == TransactionStatus.APPROVED,
    ).scalar() or 0

    for ob in order_bumps:
        ob_sales = 0
        ob_revenue = 0.0

        for txn in txns:
            if not isinstance(txn.order_bumps, list):
                continue
            for ob_data in txn.order_bumps:
                ob_code = ob_data.get("code") or ob_data.get("product", {}).get("code", "")
                if ob_code == ob.external_id:
                    ob_sales += 1
                    ob_price = ob_data.get("product", {}).get("price", ob_data.get("price", 0))
                    ob_revenue += float(ob_price) / 100  # Price in cents
                    break

        conversion = (ob_sales / total_sales * 100) if total_sales > 0 else 0.0
        stats.append({
            "id": ob.id,
            "external_id": ob.external_id,
            "name": ob.name,
            "price": ob.price,
            "sales": ob_sales,
            "revenue": ob_revenue,
            "conversion_rate": round(conversion, 2),
        })
    return stats


def _calc_upsell_stats(db: Session, upsells: list[Upsell]):
    """
    Upsells são vendas separadas (row diferente no transactions).
    O upsell é identificado pelo external_id do upsell = product.code na transaction.
    Na prática, a transaction terá product_id apontando para o registro de upsell
    pelo match do external_id do produto na venda com o external_id do upsell.
    """
    stats = []
    for up in upsells:
        if not up.external_id:
            stats.append({
                "id": up.id, "external_id": up.external_id, "name": up.name,
                "price": up.price, "sales": 0, "revenue": 0.0, "conversion_rate": 0.0,
            })
            continue

        # Find a product that matches this upsell external_id
        upsell_product = db.query(Product).filter(Product.external_id == up.external_id).first()

        if upsell_product:
            # Count transactions for this upsell product
            result = db.query(
                func.count(Transaction.id),
                func.coalesce(func.sum(Transaction.amount), 0),
            ).filter(
                Transaction.product_id == upsell_product.id,
                Transaction.status == TransactionStatus.APPROVED,
            ).first()
        else:
            result = (0, 0)

        sales_count = result[0] if result else 0
        revenue = float(result[1]) if result else 0.0

        stats.append({
            "id": up.id,
            "external_id": up.external_id,
            "name": up.name,
            "price": up.price,
            "sales": sales_count,
            "revenue": revenue,
            "conversion_rate": 0.0,  # Cannot calculate without parent sales context
        })
    return stats
