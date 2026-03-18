import type { CampaignData } from "@/services/campaigns";

export interface FunnelStage {
  label: string;
  getValue: (c: CampaignData) => number;
  /** Rate from previous step */
  getRate: (c: CampaignData) => number;
  /** Rate from clicks */
  getRateFromClicks: (c: CampaignData) => number;
  rateLabel: string;
  rateLabelClicks: string;
  requiresVturb?: boolean;
}

export const allFunnelStages: FunnelStage[] = [
  {
    label: "Cliques",
    getValue: (c) => c.clicks,
    getRate: (c) => c.ctr,
    getRateFromClicks: (c) => c.ctr,
    rateLabel: "CTR",
    rateLabelClicks: "CTR",
  },
  {
    label: "LPV",
    getValue: (c) => c.landing_page_views,
    getRate: (c) => c.clicks > 0 ? (c.landing_page_views / c.clicks) * 100 : 0,
    getRateFromClicks: (c) => c.clicks > 0 ? (c.landing_page_views / c.clicks) * 100 : 0,
    rateLabel: "Connect",
    rateLabelClicks: "LPV/Cliques",
  },
  {
    label: "Plays VSL",
    getValue: (c) => c.plays_vsl ?? 0,
    getRate: (c) => {
      const plays = c.plays_vsl ?? 0;
      return c.clicks > 0 ? (plays / c.clicks) * 100 : 0;
    },
    getRateFromClicks: (c) => {
      const plays = c.plays_vsl ?? 0;
      return c.clicks > 0 ? (plays / c.clicks) * 100 : 0;
    },
    rateLabel: "Play",
    rateLabelClicks: "Play/Cliques",
    requiresVturb: true,
  },
  {
    label: "Checkout",
    getValue: (c) => c.initiate_checkout,
    getRate: (c) => c.landing_page_views > 0 ? (c.initiate_checkout / c.landing_page_views) * 100 : 0,
    getRateFromClicks: (c) => c.clicks > 0 ? (c.initiate_checkout / c.clicks) * 100 : 0,
    rateLabel: "Conv.",
    rateLabelClicks: "IC/Cliques",
  },
  {
    label: "Vendas",
    getValue: (c) => c.sales,
    getRate: (c) => c.initiate_checkout > 0 ? (c.sales / c.initiate_checkout) * 100 : 0,
    getRateFromClicks: (c) => c.clicks > 0 ? (c.sales / c.clicks) * 100 : 0,
    rateLabel: "Conv.",
    rateLabelClicks: "Vendas/Cliques",
  },
];
