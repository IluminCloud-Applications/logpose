import csv
import io
import logging
from integrations.csv_import.schemas import ImportRow

logger = logging.getLogger(__name__)

KIWIFY_STATUS_MAP = {
    "paid": "approved",
    "refunded": "refunded",
    "refused": "pending",
    "waiting_payment": "pending",
    "chargedback": "chargeback",
    "chargeback": "chargeback",
    "canceled": "pending",
    "abandoned": "pending",
}


def _safe_float(val: str) -> float:
    if not val or not val.strip():
        return 0.0
    try:
        return float(val.strip().replace(",", "."))
    except ValueError:
        return 0.0


def parse_kiwify_csv(file_content: bytes) -> list[ImportRow]:
    """
    Parseia o CSV exportado da Kiwify (Relatório de Vendas).
    Retorna lista de ImportRow padronizadas.
    """
    text = file_content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))

    rows: list[ImportRow] = []
    for raw in reader:
        status_raw = raw.get("Status", "").strip().lower()
        status = KIWIFY_STATUS_MAP.get(status_raw, "pending")

        product_name = raw.get("Produto", "").strip()
        if not product_name:
            continue

        src = (
            raw.get("Tracking src", "").strip()
            or raw.get("Tracking sck", "").strip()
            or None
        )

        rows.append(ImportRow(
            external_id=raw.get("ID da venda", "").strip(),
            status=status,
            product_name=product_name,
            product_external_id=product_name,
            product_ticket=_safe_float(raw.get("Preço base do produto", "0")),
            amount=_safe_float(raw.get("Total com acréscimo", "0")),
            customer_name=raw.get("Cliente", "").strip() or None,
            customer_email=raw.get("Email", "").strip(),
            customer_cpf=raw.get("CPF / CNPJ", "").strip() or None,
            customer_phone=raw.get("Celular", "").strip() or None,
            checkout_name=raw.get("Oferta", "").strip() or None,
            checkout_code=None,
            utm_source=raw.get("Tracking utm_source", "").strip() or None,
            utm_medium=raw.get("Tracking utm_medium", "").strip() or None,
            utm_campaign=raw.get("Tracking utm_campaign", "").strip() or None,
            utm_content=raw.get("Tracking utm_content", "").strip() or None,
            utm_term=raw.get("Tracking utm_term", "").strip() or None,
            src=src,
            created_at=raw.get("Data de Criação", "").strip() or None,
        ))

    logger.info(f"Kiwify CSV: {len(rows)} linhas parseadas")
    return rows
