from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from api.auth.deps import get_current_user
from integrations.csv_import.kiwify_csv import parse_kiwify_csv
from integrations.csv_import.payt_xlsx import parse_payt_xlsx
from integrations.csv_import.schemas import ImportPreviewResponse, DetectedProduct, ImportRow

router = APIRouter(prefix="/import", tags=["import"])


@router.post("/preview", response_model=ImportPreviewResponse)
async def preview_import(
    platform: str = Form(...),
    file: UploadFile = File(None),
    file_vendas: UploadFile = File(None),
    file_origem: UploadFile = File(None),
    _=Depends(get_current_user),
):
    """
    Faz preview do CSV/XLSX antes de importar.
    Retorna produtos detectados, totais e resumo.
    """
    rows = await _parse_files(platform, file, file_vendas, file_origem)

    if not rows:
        raise HTTPException(422, "Nenhuma transação encontrada no arquivo")

    products = _detect_products(rows)
    approved = [r for r in rows if r.status == "approved"]
    refunded = [r for r in rows if r.status == "refunded"]
    pending = [r for r in rows if r.status not in ("approved", "refunded")]

    return ImportPreviewResponse(
        platform=platform,
        total_rows=len(rows),
        approved_count=len(approved),
        refunded_count=len(refunded),
        pending_count=len(pending),
        unique_customers=len({r.customer_email for r in rows if r.customer_email}),
        total_revenue=round(sum(r.amount for r in approved), 2),
        products=products,
    )


async def _parse_files(
    platform: str,
    file: UploadFile | None,
    file_vendas: UploadFile | None,
    file_origem: UploadFile | None,
) -> list[ImportRow]:
    """Parseia os arquivos de acordo com a plataforma."""
    if platform == "kiwify":
        if not file:
            raise HTTPException(400, "Arquivo CSV é obrigatório para Kiwify")
        content = await file.read()
        return parse_kiwify_csv(content)

    if platform == "payt":
        if not file_vendas or not file_origem:
            raise HTTPException(
                400, "Ambos arquivos (vendas e origem) são obrigatórios para PayT"
            )
        vendas = await file_vendas.read()
        origem = await file_origem.read()
        return parse_payt_xlsx(vendas, origem)

    raise HTTPException(400, f"Plataforma '{platform}' inválida")


def _detect_products(rows: list[ImportRow]) -> list[DetectedProduct]:
    """Agrupa linhas por produto e gera um resumo."""
    product_map: dict[str, dict] = {}

    for row in rows:
        name = row.product_name
        if not name:
            continue

        if name not in product_map:
            product_map[name] = {
                "name": name,
                "external_id": row.product_external_id,
                "tickets": set(),
                "sales_count": 0,
                "total_revenue": 0.0,
                "checkouts": set(),
            }

        p = product_map[name]
        p["tickets"].add(row.product_ticket)

        if row.status == "approved":
            p["sales_count"] += 1
            p["total_revenue"] += row.amount

        if row.checkout_name:
            p["checkouts"].add(row.checkout_name)

    detected = []
    for p in product_map.values():
        tickets = sorted(p["tickets"], reverse=True)
        detected.append(DetectedProduct(
            name=p["name"],
            external_id=p["external_id"],
            ticket=tickets[0] if tickets else 0.0,
            sales_count=p["sales_count"],
            total_revenue=round(p["total_revenue"], 2),
            checkouts=sorted(p["checkouts"]),
        ))

    return sorted(detected, key=lambda x: x.total_revenue, reverse=True)
