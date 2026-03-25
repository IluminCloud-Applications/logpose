import type { CampaignData } from "@/services/campaigns";
import type { CampaignFilterState } from "./CampaignsInlineFilters";
import type { MarkerMap } from "@/hooks/useCampaignMarkers";
import { campaignToMetricRow } from "./mappers";

/**
 * Filters campaigns based on search text, filter state, tags, and markers.
 */
export function filterCampaigns(
  rows: CampaignData[],
  search: string,
  filters: CampaignFilterState,
  tagsMap: Record<string, string[]>,
  markersMap: MarkerMap,
): CampaignData[] {
  const searchLower = search.toLowerCase();

  return rows.filter((c) => {
    const isUnidentified = c.status === "unidentified";
    if (!c.name.toLowerCase().includes(searchLower)) return false;

    if (!isUnidentified) {
      if (filters.status !== "all" && c.status !== filters.status) return false;
      if (filters.objective !== "all" && c.objective !== filters.objective) return false;
      if (filters.bidStrategy !== "all" && (c.bid_strategy || "volume") !== filters.bidStrategy) return false;
      if (filters.budgetType !== "all" && c.budget_type !== filters.budgetType) return false;
      if (filters.tag !== "all") {
        const cTags = tagsMap[c.id] || [];
        if (!cTags.includes(filters.tag)) return false;
      }
      // Marker-based filters
      const cMarkers = markersMap[c.id];
      if (filters.product !== "all") {
        if (!cMarkers?.product || cMarkers.product.reference_id !== filters.product) return false;
      }
      if (filters.video !== "all") {
        if (!cMarkers?.video || cMarkers.video.reference_id !== filters.video) return false;
      }
      if (filters.checkout !== "all") {
        if (!cMarkers?.checkout || cMarkers.checkout.reference_id !== filters.checkout) return false;
      }
    }

    for (const vf of filters.valueFilters) {
      const num = parseFloat(vf.value);
      if (isNaN(num)) continue;
      const row = campaignToMetricRow(c);
      const fieldMap: Record<string, number> = {
        spend: row.spend, revenue: row.revenue, profit: row.profit,
        roas: row.roas, cpa: row.cpa, sales: row.sales,
      };
      const fieldVal = fieldMap[vf.metric];
      if (fieldVal === undefined) continue;
      if (vf.operator === "gte" ? fieldVal < num : fieldVal > num) return false;
    }

    return true;
  });
}
