export interface FunnelStageMeta {
  impressions?: number;
  ctr?: number;
  cpm?: number;
  cpc?: number;
  spend?: number;
}

export interface FunnelStage {
  name: string;
  value: number;
  revenue?: number;
  meta?: FunnelStageMeta;
}

export interface FunnelData {
  productId: string;
  productName: string;
  stages: FunnelStage[];
}

export const funnelData: FunnelData[] = [
  {
    productId: "p1",
    productName: "Ebook Fitness Premium",
    stages: [
      { name: "Alcance", value: 152000, meta: { impressions: 152000, ctr: 3.02, cpm: 18.50, spend: 2814.00 } },
      { name: "Cliques", value: 4594, meta: { ctr: 3.02, cpc: 0.61, spend: 2814.00 } },
      { name: "Landing Page Views", value: 3980 },
      { name: "Iniciação de Compra", value: 312 },
      { name: "Vendas", value: 189, revenue: 18523.00 },
      { name: "Order Bump", value: 85, revenue: 2975.00 },
      { name: "Upsell Premium", value: 42, revenue: 8274.00 },
    ],
  },
  {
    productId: "p2",
    productName: "Curso Marketing Digital",
    stages: [
      { name: "Alcance", value: 198000, meta: { impressions: 198000, ctr: 2.93, cpm: 15.80, spend: 3128.00 } },
      { name: "Cliques", value: 5802, meta: { ctr: 2.93, cpc: 0.54, spend: 3128.00 } },
      { name: "Landing Page Views", value: 5100 },
      { name: "Iniciação de Compra", value: 420 },
      { name: "Vendas", value: 234, revenue: 32760.00 },
      { name: "Order Bump", value: 110, revenue: 5500.00 },
      { name: "Upsell Gold", value: 55, revenue: 13750.00 },
      { name: "Upsell Mentoria", value: 38, revenue: 18620.00 },
    ],
  },
  {
    productId: "p3",
    productName: "Mentoria Premium",
    stages: [
      { name: "Alcance", value: 115000, meta: { impressions: 115000, ctr: 3.33, cpm: 22.10, spend: 2541.00 } },
      { name: "Cliques", value: 3827, meta: { ctr: 3.33, cpc: 0.66, spend: 2541.00 } },
      { name: "Landing Page Views", value: 3400 },
      { name: "Iniciação de Compra", value: 198 },
      { name: "Vendas", value: 124, revenue: 49104.00 },
      { name: "Upsell VIP", value: 18, revenue: 17640.00 },
    ],
  },
];
