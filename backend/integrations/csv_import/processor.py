import logging
from sqlalchemy.orm import Session

from integrations.csv_import.schemas import ImportRow, ProductConfig, ImportResultResponse
from integrations.csv_import.transaction_handler import process_transactions
from database.models.product import Product
from database.models.product_items import Upsell, OrderBump
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
