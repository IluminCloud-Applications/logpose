import type { CampaignData } from "@/services/campaigns";
import type { DeactivateMetrics } from "./DeactivateConfirmModal";

/**
 * Finds an entity (campaign, adset, or ad) by ID in the data tree
 * and returns its metrics for the deactivation confirmation modal.
 */
export function findEntityMetrics(
  data: CampaignData[],
  entityId: string,
  entityType: "campaign" | "adset" | "ad",
): { name: string; metrics: DeactivateMetrics } | null {
  if (entityType === "campaign") {
    const c = data.find((c) => c.id === entityId);
    if (!c) return null;
    return { name: c.name, metrics: extractMetrics(c) };
  }

  for (const c of data) {
    if (entityType === "adset") {
      const adset = c.adsets.find((a) => a.id === entityId);
      if (adset) return { name: adset.name, metrics: extractMetrics(adset) };
    }
    if (entityType === "ad") {
      for (const as_ of c.adsets) {
        const ad = as_.ads.find((a) => a.id === entityId);
        if (ad) return { name: ad.name, metrics: extractMetrics(ad) };
      }
    }
  }
  return null;
}

function extractMetrics(entity: {
  spend: number;
  revenue: number;
  profit: number;
  roas: number;
  cpa: number;
  cpc: number;
  ctr: number;
  sales: number;
  clicks: number;
  impressions: number;
  budget: number;
}): DeactivateMetrics {
  return {
    spend: entity.spend,
    revenue: entity.revenue,
    profit: entity.profit,
    roas: entity.roas,
    cpa: entity.cpa,
    cpc: entity.cpc,
    ctr: entity.ctr,
    sales: entity.sales,
    clicks: entity.clicks,
    impressions: entity.impressions,
    budget: entity.budget,
  };
}
