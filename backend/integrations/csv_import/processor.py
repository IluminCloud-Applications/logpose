import logging
from sqlalchemy.orm import Session

from integrations.csv_import.schemas import ImportRow, ProductConfig, ImportResultResponse
from integrations.csv_import.transaction_handler import process_transactions
from database.models.product import Product
from database.models.product_items import Upsell, OrderBump, Checkout, CheckoutPlatform
from database.models.transaction import PaymentPlatform

logger = logging.getLogger(__name__)


def process_import(
    db: Session,
    rows: list[ImportRow],
    products_config: list[ProductConfig],
    platform: str,
) -> ImportResultResponse:
    """Processa a importação: cria Products, Customers, Transactions."""
    platform_enum = PaymentPlatform(platform)
    config_map = {pc.name: pc for pc in products_config}

    result = ImportResultResponse(
        products_created=0, customers_created=0, transactions_created=0,
        upsells_created=0, order_bumps_created=0, skipped_duplicates=0, errors=[],
    )

    # Fase 1: Criar produtos (só frontends primeiro)
    product_db = _create_frontend_products(
        db, rows, config_map, result
    )

    # Fase 2: Criar upsells e order bumps
    _create_sub_products(db, rows, config_map, product_db, result)

    # Fase 2.5: Auto-criar checkouts PayT (pelo checkout_code)
    if platform == "payt":
        _auto_create_payt_checkouts(db, rows, config_map, product_db)

    # Fase 3: Processar transações e clientes
    process_transactions(db, rows, config_map, product_db, platform_enum, result)

    db.commit()
    logger.info(
        f"Importação concluída: {result.products_created} produtos, "
        f"{result.customers_created} clientes, {result.transactions_created} transações"
    )
    return result



def _create_frontend_products(
    db: Session, rows: list[ImportRow], config_map: dict,
    result: ImportResultResponse,
) -> dict[str, Product]:
    """Cria ou encontra Products para cada produto marcado como frontend."""
    product_db: dict[str, Product] = {}
    seen_names: set[str] = set()

    for row in rows:
        name = row.product_name
        if name in seen_names:
            continue
        seen_names.add(name)

        config = config_map.get(name)
        if not config or config.type != "frontend":
            continue

        # Se o user selecionou um produto existente (product_id), usar esse
        if config.product_id:
            existing = db.query(Product).filter(
                Product.id == config.product_id
            ).first()
            if existing:
                product_db[name] = existing
                continue

        # Buscar pelo nome exato
        existing = db.query(Product).filter(
            Product.name == name
        ).first()

        if existing:
            product_db[name] = existing
            continue

        product = Product(name=name)
        db.add(product)
        db.flush()
        product_db[name] = product
        result.products_created += 1

    return product_db


def _create_sub_products(
    db: Session, rows: list[ImportRow], config_map: dict,
    product_db: dict[str, Product], result: ImportResultResponse,
):
    """Cria Upsells e OrderBumps vinculados aos produtos pai."""
    seen: set[str] = set()
    for row in rows:
        name = row.product_name
        if name in seen:
            continue
        seen.add(name)

        config = config_map.get(name)
        if not config or config.type == "frontend":
            continue

        parent = product_db.get(config.parent_product_name or "")
        if not parent:
            result.errors.append(
                f"Pai '{config.parent_product_name}' não encontrado para '{name}'"
            )
            continue

        if config.type == "upsell":
            db.add(Upsell(
                product_id=parent.id, external_id=row.product_external_id,
                name=name, price=row.product_ticket,
            ))
            result.upsells_created += 1
        elif config.type == "order_bump":
            db.add(OrderBump(
                product_id=parent.id, external_id=row.product_external_id,
                name=name, price=row.product_ticket,
            ))
            result.order_bumps_created += 1

    db.flush()


def _auto_create_payt_checkouts(
    db: Session, rows: list[ImportRow], config_map: dict,
    product_db: dict[str, Product],
):
    """
    Auto-cria checkouts PayT a partir dos códigos encontrados no XLSX.
    Se o checkout_code já existe no banco para o mesmo produto, ignora.
    Cria com url vazio (o user preenche depois) e price=0.
    """
    # Coletar checkouts únicos por produto: {product_name: {code: name}}
    product_checkouts: dict[str, dict[str, str]] = {}
    for row in rows:
        if not row.checkout_code:
            continue
        config = config_map.get(row.product_name)
        if not config:
            continue
        # Resolve product name (frontend or parent)
        prod_name = row.product_name if config.type == "frontend" else config.parent_product_name
        if not prod_name or prod_name not in product_db:
            continue
        if prod_name not in product_checkouts:
            product_checkouts[prod_name] = {}
        product_checkouts[prod_name][row.checkout_code] = row.checkout_name or row.checkout_code

    for prod_name, checkouts in product_checkouts.items():
        product = product_db[prod_name]
        for code, name in checkouts.items():
            existing = db.query(Checkout).filter(
                Checkout.product_id == product.id,
                Checkout.checkout_code == code,
            ).first()
            if existing:
                continue
            db.add(Checkout(
                product_id=product.id,
                url="",  # User fills in later
                price=0.0,
                platform=CheckoutPlatform.PAYT,
                checkout_code=code,
            ))
    db.flush()
