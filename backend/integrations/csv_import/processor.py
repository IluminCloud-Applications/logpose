import logging
from sqlalchemy.orm import Session

from integrations.csv_import.schemas import ImportRow, ProductConfig, ImportResultResponse
from integrations.csv_import.transaction_handler import process_transactions
from database.models.product import Product
from database.models.product_items import Upsell, OrderBump, Checkout, CheckoutPlatform
from database.models.product_alias import ProductAlias
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
    # config_map: nome original do CSV -> config
    config_map = {pc.name: pc for pc in products_config}

    result = ImportResultResponse(
        products_created=0, customers_created=0, transactions_created=0,
        upsells_created=0, order_bumps_created=0, skipped_duplicates=0, errors=[],
    )

    # Fase 1: Criar produtos frontend.
    # product_db é indexado pelo nome CANÔNICO (display_name ou name)
    product_db = _create_frontend_products(db, rows, config_map, result)

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
    """
    Cria ou encontra Products para cada produto marcado como frontend.

    product_db é indexado pelo nome CANÔNICO (config.get_canonical_name()).
    Quando display_name está definido (modo avançado com '|'), o nome original
    do CSV é salvo automaticamente como alias para garantir que o filtro funcione.
    """
    product_db: dict[str, Product] = {}
    seen_canonical: set[str] = set()
    # Acumula aliases por produto canônico para salvar após flush
    alias_map: dict[str, set[str]] = {}

    for row in rows:
        config = config_map.get(row.product_name)
        if not config or config.type != "frontend":
            continue

        canonical = config.get_canonical_name()

        # Se nome original != canônico, coletar como alias
        if config.name != canonical:
            alias_map.setdefault(canonical, set()).add(config.name)

        if canonical in seen_canonical:
            continue
        seen_canonical.add(canonical)

        # Se o user selecionou um produto existente (product_id), usar esse
        if config.product_id:
            existing = db.query(Product).filter(
                Product.id == config.product_id
            ).first()
            if existing:
                product_db[canonical] = existing
                continue

        # Buscar pelo nome canônico
        existing = db.query(Product).filter(Product.name == canonical).first()
        if existing:
            product_db[canonical] = existing
            continue

        product = Product(name=canonical)
        db.add(product)
        db.flush()
        product_db[canonical] = product
        result.products_created += 1

    # Salvar aliases coletados
    for canonical, alias_names in alias_map.items():
        product = product_db.get(canonical)
        if not product:
            continue
        for alias_str in alias_names:
            exists = db.query(ProductAlias).filter(
                ProductAlias.product_id == product.id,
                ProductAlias.alias == alias_str,
            ).first()
            if not exists:
                db.add(ProductAlias(product_id=product.id, alias=alias_str))
    db.flush()

    return product_db


def _create_sub_products(
    db: Session, rows: list[ImportRow], config_map: dict,
    product_db: dict[str, Product], result: ImportResultResponse,
):
    """
    Cria Upsells e OrderBumps vinculados aos produtos pai (1 ou N).
    Os pais são identificados pelo nome canônico.
    """
    seen_canonical: set[str] = set()

    for row in rows:
        config = config_map.get(row.product_name)
        if not config or config.type == "frontend":
            continue

        canonical = config.get_canonical_name()
        if canonical in seen_canonical:
            continue
        seen_canonical.add(canonical)

        parents = config.get_parents()
        if not parents:
            result.errors.append(
                f"Produto '{canonical}' ({config.type}) não tem produto(s) pai configurado"
            )
            continue

        for parent_name in parents:
            parent = product_db.get(parent_name)
            if not parent:
                result.errors.append(
                    f"Pai '{parent_name}' não encontrado para '{canonical}'"
                )
                continue

            if config.type == "upsell":
                db.add(Upsell(
                    product_id=parent.id, external_id=row.product_external_id,
                    name=canonical, price=row.product_ticket,
                ))
                result.upsells_created += 1
            elif config.type == "order_bump":
                db.add(OrderBump(
                    product_id=parent.id, external_id=row.product_external_id,
                    name=canonical, price=row.product_ticket,
                ))
                result.order_bumps_created += 1

    db.flush()


def _auto_create_payt_checkouts(
    db: Session, rows: list[ImportRow], config_map: dict,
    product_db: dict[str, Product],
):
    """
    Auto-cria checkouts PayT a partir dos códigos encontrados no XLSX.
    Usa o nome canônico para lookup no product_db.
    """
    product_checkouts: dict[str, dict[str, str]] = {}
    for row in rows:
        if not row.checkout_code:
            continue
        config = config_map.get(row.product_name)
        if not config:
            continue

        if config.type == "frontend":
            prod_names = [config.get_canonical_name()]
        else:
            prod_names = config.get_parents()

        for prod_name in prod_names:
            if prod_name not in product_db:
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
                url="",
                price=0.0,
                platform=CheckoutPlatform.PAYT,
                checkout_code=code,
            ))
    db.flush()
