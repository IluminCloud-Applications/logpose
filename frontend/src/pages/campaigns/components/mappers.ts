import type { CampaignData, CampaignAdSetData, CampaignAdData } from "@/services/campaigns";
import type { MetricRow } from "./campaignCellHelpers";

/**
 * Converte CampaignData (API) para o MetricRow (usado na tabela).
 */
export function campaignToMetricRow(c: CampaignData): MetricRow & {
  id: string;
  status: string;
  noIdSales: number;
} {
  return {
    id: c.id,
    name: c.name,
    status: c.status,
    budget: c.budget,
    spend: c.spend,
    revenue: c.revenue,
    sales: c.sales,
    roas: c.roas,
    cpa: c.cpa,
    cpc: c.cpc,
    clicks: c.clicks,
    impressions: c.impressions,
    ctr: c.ctr,
    landingPageViews: c.landing_page_views,
    initiateCheckout: c.initiate_checkout,
    connectRate: c.connect_rate,
    profit: c.profit,
    noIdSales: c.no_id_sales,
    playsVsl: c.plays_vsl ?? 0,
    playRate: c.play_rate ?? 0,
  };
}

/**
 * Converte AdSetData (API) para o MetricRow (usado na subtabela).
 */
export function adsetToMetricRow(a: CampaignAdSetData): MetricRow & {
  id: string;
  campaignId: string;
  status: string;
  noIdSales: number;
} {
  return {
    id: a.id,
    campaignId: a.campaign_id,
    name: a.name,
    status: a.status,
    budget: a.budget,
    spend: a.spend,
    revenue: a.revenue,
    sales: a.sales,
    roas: a.roas,
    cpa: a.cpa,
    cpc: a.cpc,
    clicks: a.clicks,
    impressions: a.impressions,
    ctr: a.ctr,
    landingPageViews: a.landing_page_views,
    initiateCheckout: a.initiate_checkout,
    connectRate: a.connect_rate,
    profit: a.profit,
    noIdSales: a.no_id_sales,
    playsVsl: a.plays_vsl ?? 0,
    playRate: a.play_rate ?? 0,
  };
}

/**
 * Converte AdData (API) para o MetricRow (usado na subtabela).
 */
export function adToMetricRow(a: CampaignAdData): MetricRow & {
  id: string;
  adSetId: string;
  status: string;
  noIdSales: number;
} {
  return {
    id: a.id,
    adSetId: a.ad_set_id,
    name: a.name,
    status: a.status,
    budget: a.budget,
    spend: a.spend,
    revenue: a.revenue,
    sales: a.sales,
    roas: a.roas,
    cpa: a.cpa,
    cpc: a.cpc,
    clicks: a.clicks,
    impressions: a.impressions,
    ctr: a.ctr,
    landingPageViews: a.landing_page_views,
    initiateCheckout: a.initiate_checkout,
    connectRate: a.connect_rate,
    profit: a.profit,
    noIdSales: a.no_id_sales,
    playsVsl: a.plays_vsl ?? 0,
    playRate: a.play_rate ?? 0,
  };
}
