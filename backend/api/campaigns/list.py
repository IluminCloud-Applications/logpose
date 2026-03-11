"""
API principal de campanhas: cruza dados Meta Ads com transações do DB.
Retorna campanhas com métricas de Ad Spend + Vendas unificadas.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from database.core.connection import get_db
from database.models.facebook_account import FacebookAccount
from database.models.transaction import Transaction, TransactionStatus
from api.auth.deps import get_current_user
from api.campaigns.helpers import (
    parse_utm_campaign, parse_utm_medium, parse_utm_content, safe_division,
)
from api.campaigns.merge import merge_campaigns, merge_ads
from integrations.meta_ads.service import MetaAdsService

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


@router.get("/data")
async def get_campaigns_data(
    date_start: str = Query(..., description="YYYY-MM-DD"),
    date_end: str = Query(..., description="YYYY-MM-DD"),
    account_id: Optional[int] = Query(None),
    status_filter: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """
    Endpoint principal: busca dados do Meta Ads + transações.
    Cruza campanhas com vendas pelo utm_campaign (name|id).
    Retorna hierarquia: campaigns -> adsets -> ads, cada um com métricas.
    """
    # 1. Selecionar conta Facebook
    fb_account = _get_fb_account(db, account_id)
    if not fb_account:
        return {"campaigns": [], "unidentified": _build_unidentified(db, date_start, date_end)}

    # 2. Buscar dados do Meta Ads
    service = MetaAdsService(fb_account.access_token, fb_account.account_id)
    try:
        meta_campaigns = await service.get_campaigns(date_start, date_end)
        meta_adsets = await service.get_adsets(date_start, date_end)
        meta_ads = await service.get_ads(date_start, date_end)
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Erro ao buscar dados do Meta Ads: {e}")
        await service.close()
        # Retornar vazio com unidentified para não crashar o frontend
        return {
            "campaigns": [],
            "unidentified": _build_unidentified(db, date_start, date_end),
            "error": str(e),
        }
    finally:
        await service.close()

    # 3. Buscar transações aprovadas no período com utm_source=FB
    transactions = _get_fb_transactions(db, date_start, date_end)

    # 4. Fazer o merge
    campaigns = merge_campaigns(meta_campaigns, meta_adsets, meta_ads, transactions)

    # 5. Filtrar por status se necessário
    if status_filter and status_filter != "all":
        campaigns = [c for c in campaigns if c["status"] == status_filter]

    # 6. Vendas sem UTM (não identificadas)
    unidentified = _build_unidentified(db, date_start, date_end)

    return {"campaigns": campaigns, "unidentified": unidentified}


def _get_fb_account(db: Session, account_id: Optional[int]) -> Optional[FacebookAccount]:
    """Retorna a conta FB selecionada ou a primeira disponível."""
    if account_id:
        return db.query(FacebookAccount).filter(FacebookAccount.id == account_id).first()
    return db.query(FacebookAccount).first()


def _get_fb_transactions(db: Session, date_start: str, date_end: str) -> list[Transaction]:
    """Busca transações aprovadas com utm_source FB no período."""
    query = db.query(Transaction).filter(
        Transaction.status == TransactionStatus.APPROVED,
        Transaction.created_at >= date_start,
        Transaction.created_at <= f"{date_end} 23:59:59",
    )
    return query.all()


def _build_unidentified(db: Session, date_start: str, date_end: str) -> dict:
    """Vendas aprovadas sem utm_campaign (não atribuídas a nenhuma campanha)."""
    unid = db.query(Transaction).filter(
        Transaction.status == TransactionStatus.APPROVED,
        Transaction.created_at >= date_start,
        Transaction.created_at <= f"{date_end} 23:59:59",
        (Transaction.utm_campaign.is_(None)) | (Transaction.utm_campaign == ""),
    ).all()

    revenue = sum(t.amount for t in unid)
    return {
        "id": "unidentified",
        "name": "Não identificado",
        "status": "unidentified",
        "objective": "",
        "sales": len(unid),
        "revenue": revenue,
        "profit": revenue,
        "spend": 0, "budget": 0, "clicks": 0, "impressions": 0,
        "cpc": 0, "ctr": 0, "cpa": 0, "roas": 0,
        "landing_page_views": 0, "initiate_checkout": 0,
        "connect_rate": 0, "no_id_sales": 0,
    }
