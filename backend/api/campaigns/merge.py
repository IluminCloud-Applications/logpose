"""
Lógica de merge entre dados do Meta Ads e transações do banco.
Cruza por ID (confiável) ou por nome (fallback).
"""
from collections import defaultdict
from typing import Any

from database.models.transaction import Transaction
from integrations.meta_ads.schemas import CampaignInsights, AdSetInsights, AdInsights
from api.campaigns.helpers import (
    parse_utm_campaign, parse_utm_medium, parse_utm_content, safe_division,
)


def _group_transactions_by_level(transactions: list[Transaction]) -> dict:
    """
    Agrupa transações por campaign_id, adset_id e ad_id.
    Usa o formato name|id para extrair IDs.
    """
    by_campaign_id: dict[str, list[Transaction]] = defaultdict(list)
    by_campaign_name: dict[str, list[Transaction]] = defaultdict(list)
    by_adset_id: dict[str, list[Transaction]] = defaultdict(list)
    by_adset_name: dict[str, list[Transaction]] = defaultdict(list)
    by_ad_id: dict[str, list[Transaction]] = defaultdict(list)
    by_ad_name: dict[str, list[Transaction]] = defaultdict(list)

    for tx in transactions:
        # Campaign level
        camp_name, camp_id = parse_utm_campaign(tx.utm_campaign)
        if camp_id:
            by_campaign_id[camp_id].append(tx)
        elif camp_name:
            by_campaign_name[camp_name.lower()].append(tx)

        # AdSet level
        adset_name, adset_id = parse_utm_medium(tx.utm_medium)
        if adset_id:
            by_adset_id[adset_id].append(tx)
        elif adset_name:
            by_adset_name[adset_name.lower()].append(tx)

        # Ad level
        ad_name, ad_id = parse_utm_content(tx.utm_content)
        if ad_id:
            by_ad_id[ad_id].append(tx)
        elif ad_name:
            by_ad_name[ad_name.lower()].append(tx)

    return {
        "campaign_id": dict(by_campaign_id),
        "campaign_name": dict(by_campaign_name),
        "adset_id": dict(by_adset_id),
        "adset_name": dict(by_adset_name),
        "ad_id": dict(by_ad_id),
        "ad_name": dict(by_ad_name),
    }


def _calc_sales_metrics(txs: list[Transaction]) -> dict:
    """Calcula métricas de vendas a partir de transações."""
    sales = len(txs)
    revenue = sum(t.amount for t in txs)
    return {"sales": sales, "revenue": revenue}


def _match_transactions(
    entity_id: str,
    entity_name: str,
    grouped: dict,
    id_key: str,
    name_key: str,
) -> tuple[list[Transaction], int]:
    """
    Tenta match por ID primeiro, depois por nome.
    Retorna (transactions, unmatched_by_id_count).
    """
    # Match por ID (confiável)
    by_id = grouped[id_key].get(entity_id, [])

    # Match por nome (fallback)
    by_name = grouped[name_key].get(entity_name.lower(), [])

    # Se tem match por ID, usa ele e conta as vendas por nome-only
    if by_id:
        name_only = [t for t in by_name if t not in by_id]
        return by_id + name_only, len(name_only)

    # Se não tem ID match, usa o nome inteiro
    return by_name, len(by_name) if by_name else 0


def merge_campaigns(
    meta_campaigns: list[CampaignInsights],
    meta_adsets: list[AdSetInsights],
    meta_ads: list[AdInsights],
    transactions: list[Transaction],
) -> list[dict[str, Any]]:
    """Cruza campanhas do Meta com transações do DB."""
    grouped = _group_transactions_by_level(transactions)
    results = []

    for camp in meta_campaigns:
        txs, no_id_count = _match_transactions(
            camp.id, camp.name, grouped, "campaign_id", "campaign_name",
        )
        sales_data = _calc_sales_metrics(txs)

        # Buscar adsets desta campanha
        camp_adsets = [a for a in meta_adsets if a.campaign_id == camp.id]
        adsets_merged = _merge_adsets_for_campaign(
            camp_adsets, meta_ads, grouped,
        )

        profit = sales_data["revenue"] - camp.spend
        roas = safe_division(sales_data["revenue"], camp.spend)
        cpa = safe_division(camp.spend, sales_data["sales"]) if sales_data["sales"] > 0 else 0

        # Determinar tipo de orçamento: CBO (campanha) ou ABO (conjuntos)
        is_cbo = camp.budget > 0
        budget_type = "CBO" if is_cbo else "ABO"

        results.append({
            "id": camp.id,
            "name": camp.name,
            "status": camp.status,
            "objective": camp.objective,
            "bid_strategy": camp.bid_strategy,
            "budget_type": budget_type,
            "budget": camp.budget,
            "spend": camp.spend,
            "clicks": camp.clicks,
            "impressions": camp.impressions,
            "cpc": camp.cpc,
            "ctr": camp.ctr,
            "landing_page_views": camp.landing_page_views,
            "initiate_checkout": camp.initiate_checkout,
            "connect_rate": camp.connect_rate,
            **sales_data,
            "profit": profit,
            "roas": roas,
            "cpa": cpa,
            "no_id_sales": no_id_count,
            "views_vsl": 0,
            "plays_vsl": 0,
            "play_rate": 0,
            "adsets": adsets_merged,
        })

    return results


def _merge_adsets_for_campaign(
    meta_adsets: list[AdSetInsights],
    meta_ads: list[AdInsights],
    grouped: dict,
) -> list[dict[str, Any]]:
    """Merge adsets level."""
    results = []
    for adset in meta_adsets:
        txs, no_id_count = _match_transactions(
            adset.id, adset.name, grouped, "adset_id", "adset_name",
        )
        sales_data = _calc_sales_metrics(txs)

        # Ads deste adset
        adset_ads = [a for a in meta_ads if a.ad_set_id == adset.id]
        ads_merged = merge_ads(adset_ads, grouped)

        profit = sales_data["revenue"] - adset.spend
        roas = safe_division(sales_data["revenue"], adset.spend)
        cpa = safe_division(adset.spend, sales_data["sales"]) if sales_data["sales"] > 0 else 0

        results.append({
            "id": adset.id,
            "campaign_id": adset.campaign_id,
            "name": adset.name,
            "status": adset.status,
            "budget": adset.budget,
            "spend": adset.spend,
            "clicks": adset.clicks,
            "impressions": adset.impressions,
            "cpc": adset.cpc,
            "ctr": adset.ctr,
            "landing_page_views": adset.landing_page_views,
            "initiate_checkout": adset.initiate_checkout,
            "connect_rate": adset.connect_rate,
            **sales_data,
            "profit": profit,
            "roas": roas,
            "cpa": cpa,
            "no_id_sales": no_id_count,
            "views_vsl": 0,
            "plays_vsl": 0,
            "play_rate": 0,
            "ads": ads_merged,
        })

    return results


def merge_ads(
    meta_ads: list[AdInsights],
    grouped: dict,
) -> list[dict[str, Any]]:
    """Merge ads level."""
    results = []
    for ad in meta_ads:
        txs, no_id_count = _match_transactions(
            ad.id, ad.name, grouped, "ad_id", "ad_name",
        )
        sales_data = _calc_sales_metrics(txs)

        profit = sales_data["revenue"] - ad.spend
        roas = safe_division(sales_data["revenue"], ad.spend)
        cpa = safe_division(ad.spend, sales_data["sales"]) if sales_data["sales"] > 0 else 0

        results.append({
            "id": ad.id,
            "ad_set_id": ad.ad_set_id,
            "name": ad.name,
            "status": ad.status,
            "budget": ad.budget,
            "spend": ad.spend,
            "clicks": ad.clicks,
            "impressions": ad.impressions,
            "cpc": ad.cpc,
            "ctr": ad.ctr,
            "landing_page_views": ad.landing_page_views,
            "initiate_checkout": ad.initiate_checkout,
            "connect_rate": ad.connect_rate,
            **sales_data,
            "profit": profit,
            "roas": roas,
            "cpa": cpa,
            "no_id_sales": no_id_count,
            "views_vsl": 0,
            "plays_vsl": 0,
            "play_rate": 0,
        })

    return results
