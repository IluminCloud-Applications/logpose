import { useState, useMemo } from "react";
import type { CampaignData } from "@/services/campaigns";

export type SortKey =
  | "spend" | "sales" | "revenue" | "profit" | "roas" | "cpa"
  | "cpc" | "ctr" | "clicks" | "impressions" | "lpv" | "ic"
  | "connectRate" | "budget" | null;

/** Colunas que suportam ordenação DESC */
export const sortableColumns: Record<string, SortKey> = {
  spend: "spend",
  sales: "sales",
  revenue: "revenue",
  profit: "profit",
  roas: "roas",
  cpa: "cpa",
  cpc: "cpc",
  ctr: "ctr",
  clicks: "clicks",
  impressions: "impressions",
  lpv: "lpv",
  ic: "ic",
  connectRate: "connectRate",
  budget: "budget",
};

/** Mapeia SortKey para propriedade numérica do CampaignData */
function getSortValue(c: CampaignData, key: SortKey): number {
  if (!key) return 0;
  const map: Record<string, number> = {
    spend: c.spend,
    sales: c.sales,
    revenue: c.revenue,
    profit: c.profit,
    roas: c.spend > 0 ? c.revenue / c.spend : 0,
    cpa: c.cpa,
    cpc: c.cpc,
    ctr: c.ctr,
    clicks: c.clicks,
    impressions: c.impressions,
    lpv: c.landing_page_views,
    ic: c.initiate_checkout,
    connectRate: c.clicks > 0 ? (c.landing_page_views / c.clicks) * 100 : 0,
    budget: c.budget || 0,
  };
  return map[key] ?? 0;
}

export function useCampaignSort(campaigns: CampaignData[]) {
  const [sortKey, setSortKey] = useState<SortKey>(null);

  const sorted = useMemo(() => {
    if (!sortKey) return campaigns;
    return [...campaigns].sort((a, b) => getSortValue(b, sortKey) - getSortValue(a, sortKey));
  }, [campaigns, sortKey]);

  const toggleSort = (col: string) => {
    const key = sortableColumns[col] ?? null;
    // Se clicar na mesma coluna, remove a ordenação
    setSortKey((prev) => (prev === key ? null : key));
  };

  return { sorted, sortKey, toggleSort };
}
