export interface ColumnPreset {
  id: string;
  name: string;
  columns: string[];
}

export const defaultPresets: ColumnPreset[] = [
  {
    id: "vendas",
    name: "Vendas",
    columns: [
      "name", "spend", "sales", "revenue", "profit", "roas", "cpa", "cpc", "ctr", "lpv", "ic",
    ],
  },
  {
    id: "gargalos",
    name: "Gargalos",
    columns: [
      "name", "clicks", "lpv", "connectRate",
      "ic", "checkoutConversion", "sales", "checkoutToSaleRate",
    ],
  },
];

export const allColumns: Record<string, string> = {
  name: "Campanha",
  spend: "Gastos",
  sales: "Vendas",
  revenue: "Faturamento",
  profit: "Lucro",
  roas: "ROAS",
  cpa: "CPA",
  cpc: "CPC",
  ctr: "CTR",
  clicks: "Cliques",
  impressions: "Impressões",
  lpv: "LPV",
  ic: "IC",
  connectRate: "Connect Rate",
  playsVsl: "Plays VSL",
  playRate: "Play Rate",
  checkoutConversion: "Conv. Checkout",
  checkoutToSaleRate: "Conv. Venda",
  budget: "Orçamento",
};
