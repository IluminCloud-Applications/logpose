import json
import logging
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session

from database.core.connection import get_db
from api.auth.deps import get_current_user
from api.csv_import.preview import _parse_files
from integrations.csv_import.schemas import ProductConfig, ImportResultResponse
from integrations.csv_import.processor import process_import

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/import", tags=["import"])


@router.post("/execute", response_model=ImportResultResponse)
async def execute_import(
    platform: str = Form(...),
    products_config: str = Form(...),
    file: UploadFile = File(None),
    file_vendas: UploadFile = File(None),
    file_origem: UploadFile = File(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """
    Executa a importação dos dados.
    Recebe os mesmos arquivos + configuração dos produtos (JSON).
    Cria Products, Customers, Transactions no banco.
    """
    # Parsear config dos produtos
    try:
        config_list = json.loads(products_config)
        configs = [ProductConfig(**c) for c in config_list]
    except Exception as e:
        raise HTTPException(400, f"Erro no products_config: {e}")

    if not configs:
        raise HTTPException(400, "Configuração de produtos é obrigatória")

    # Validar: pelo menos 1 frontend
    frontends = [c for c in configs if c.type == "frontend"]
    if not frontends:
        raise HTTPException(400, "Pelo menos 1 produto deve ser marcado como Frontend")

    # Validar: upsells/orderbumps precisam de ao menos 1 parent
    for c in configs:
        if c.type in ("upsell", "order_bump") and not c.get_parents():
            raise HTTPException(
                400, f"Produto '{c.name}' ({c.type}) precisa de pelo menos um produto pai"
            )


    # Re-parsear arquivos
    rows = await _parse_files(platform, file, file_vendas, file_origem)
    if not rows:
        raise HTTPException(422, "Nenhuma transação encontrada")

    # Processar importação
    try:
        result = process_import(db, rows, configs, platform)
    except Exception as e:
        logger.error(f"Erro na importação: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(500, f"Erro ao processar importação: {str(e)}")

    return result
