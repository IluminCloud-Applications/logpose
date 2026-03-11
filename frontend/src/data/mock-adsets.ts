export interface AdSetRow {
  id: string;
  campaignId: string;
  name: string;
  status: "active" | "paused" | "completed";
  budget: number;
  spend: number;
  revenue: number;
  sales: number;
  roas: number;
  cpa: number;
  cpc: number;
  clicks: number;
  impressions: number;
  ctr: number;
  landingPageViews: number;
  initiateCheckout: number;
  connectRate: number;
  profit: number;
}

export const adSetsData: AdSetRow[] = [
  // Campaign 1 - Ebook Fitness
  {
    id: "as-1-1", campaignId: "1",
    name: "Mulheres 25-34 - Feed", status: "active", budget: 200,
    spend: 3200, revenue: 12500, sales: 85, roas: 3.91, cpa: 37.65,
    cpc: 1.72, clicks: 1860, impressions: 58000, ctr: 3.21, profit: 9300,
    landingPageViews: 1620, initiateCheckout: 140, connectRate: 87.1,
  },
  {
    id: "as-1-2", campaignId: "1",
    name: "Homens 25-44 - Stories", status: "active", budget: 180,
    spend: 2800, revenue: 8900, sales: 58, roas: 3.18, cpa: 48.28,
    cpc: 1.95, clicks: 1435, impressions: 48000, ctr: 2.99, profit: 6100,
    landingPageViews: 1240, initiateCheckout: 98, connectRate: 86.4,
  },
  {
    id: "as-1-3", campaignId: "1",
    name: "Lookalike 2% - Reels", status: "paused", budget: 120,
    spend: 2500, revenue: 7000, sales: 46, roas: 2.80, cpa: 54.35,
    cpc: 1.92, clicks: 1299, impressions: 46000, ctr: 2.82, profit: 4500,
    landingPageViews: 1120, initiateCheckout: 74, connectRate: 86.2,
  },
  // Campaign 2 - Curso Marketing Digital
  {
    id: "as-2-1", campaignId: "2",
    name: "Empreendedores - Feed", status: "active", budget: 350,
    spend: 5100, revenue: 16200, sales: 108, roas: 3.18, cpa: 47.22,
    cpc: 2.05, clicks: 2488, impressions: 82000, ctr: 3.03, profit: 11100,
    landingPageViews: 2180, initiateCheckout: 185, connectRate: 87.6,
  },
  {
    id: "as-2-2", campaignId: "2",
    name: "Retargeting 7d", status: "active", budget: 280,
    spend: 4200, revenue: 12800, sales: 82, roas: 3.05, cpa: 51.22,
    cpc: 2.18, clicks: 1927, impressions: 65000, ctr: 2.96, profit: 8600,
    landingPageViews: 1680, initiateCheckout: 142, connectRate: 87.2,
  },
  {
    id: "as-2-3", campaignId: "2",
    name: "Broad 18-55", status: "paused", budget: 170,
    spend: 3000, revenue: 6200, sales: 44, roas: 2.07, cpa: 68.18,
    cpc: 2.14, clicks: 1402, impressions: 51000, ctr: 2.75, profit: 3200,
    landingPageViews: 1240, initiateCheckout: 93, connectRate: 88.4,
  },
  // Campaign 3 - Mentoria Premium
  {
    id: "as-3-1", campaignId: "3",
    name: "High Ticket Interest", status: "active", budget: 200,
    spend: 3500, revenue: 15000, sales: 72, roas: 4.29, cpa: 48.61,
    cpc: 1.55, clicks: 2258, impressions: 65000, ctr: 3.47, profit: 11500,
    landingPageViews: 1980, initiateCheckout: 118, connectRate: 87.7,
  },
  {
    id: "as-3-2", campaignId: "3",
    name: "Lookalike Compradores", status: "active", budget: 150,
    spend: 2700, revenue: 9800, sales: 52, roas: 3.63, cpa: 51.92,
    cpc: 1.72, clicks: 1570, impressions: 50000, ctr: 3.14, profit: 7100,
    landingPageViews: 1420, initiateCheckout: 80, connectRate: 90.4,
  },
  // Campaign 4 - PLR Bundle Pack
  {
    id: "as-4-1", campaignId: "4",
    name: "Broad Interesse Digital", status: "paused", budget: 320,
    spend: 5200, revenue: 12000, sales: 95, roas: 2.31, cpa: 54.74,
    cpc: 2.38, clicks: 2185, impressions: 92000, ctr: 2.38, profit: 6800,
    landingPageViews: 1910, initiateCheckout: 148, connectRate: 87.4,
  },
  {
    id: "as-4-2", campaignId: "4",
    name: "Retargeting Carrinho", status: "paused", budget: 280,
    spend: 4600, revenue: 10050, sales: 80, roas: 2.18, cpa: 57.50,
    cpc: 2.53, clicks: 1818, impressions: 78000, ctr: 2.33, profit: 5450,
    landingPageViews: 1590, initiateCheckout: 132, connectRate: 87.5,
  },
  // Campaign 5 - Lançamento VIP
  {
    id: "as-5-1", campaignId: "5",
    name: "Lista VIP Lookalike", status: "active", budget: 200,
    spend: 2800, revenue: 9500, sales: 68, roas: 3.39, cpa: 41.18,
    cpc: 1.65, clicks: 1697, impressions: 52000, ctr: 3.26, profit: 6700,
    landingPageViews: 1470, initiateCheckout: 108, connectRate: 86.6,
  },
  {
    id: "as-5-2", campaignId: "5",
    name: "Cold Audience", status: "active", budget: 200,
    spend: 2550, revenue: 7500, sales: 57, roas: 2.94, cpa: 44.74,
    cpc: 1.95, clicks: 1308, impressions: 43000, ctr: 3.04, profit: 4950,
    landingPageViews: 1180, initiateCheckout: 87, connectRate: 90.2,
  },
  // Campaign 6 - Desafio 21 Dias
  {
    id: "as-6-1", campaignId: "6",
    name: "Fitness Lovers", status: "completed", budget: 140,
    spend: 2400, revenue: 5800, sales: 48, roas: 2.42, cpa: 50.00,
    cpc: 1.92, clicks: 1250, impressions: 45000, ctr: 2.78, profit: 3400,
    landingPageViews: 1080, initiateCheckout: 72, connectRate: 86.4,
  },
  {
    id: "as-6-2", campaignId: "6",
    name: "Weight Loss Interest", status: "completed", budget: 110,
    spend: 1800, revenue: 4000, sales: 34, roas: 2.22, cpa: 52.94,
    cpc: 2.14, clicks: 841, impressions: 33000, ctr: 2.55, profit: 2200,
    landingPageViews: 770, initiateCheckout: 58, connectRate: 91.6,
  },
];
