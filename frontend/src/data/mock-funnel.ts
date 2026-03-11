export interface FunnelStage {
  name: string;
  value: number;
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
      { name: "Alcance", value: 152000 },
      { name: "Cliques", value: 4594 },
      { name: "Landing Page Views", value: 3980 },
      { name: "Plays VSL", value: 2850 },
      { name: "Iniciação de Compra", value: 312 },
      { name: "Vendas", value: 189 },
      { name: "Order Bump", value: 85 },
      { name: "Upsell 1", value: 42 },
    ],
  },
  {
    productId: "p2",
    productName: "Curso Marketing Digital",
    stages: [
      { name: "Alcance", value: 198000 },
      { name: "Cliques", value: 5802 },
      { name: "Landing Page Views", value: 5100 },
      { name: "Plays VSL", value: 3570 },
      { name: "Iniciação de Compra", value: 420 },
      { name: "Vendas", value: 234 },
      { name: "Order Bump", value: 110 },
      { name: "Upsell 1", value: 38 },
      { name: "Upsell 2", value: 55 },
    ],
  },
  {
    productId: "p3",
    productName: "Mentoria Premium",
    stages: [
      { name: "Alcance", value: 115000 },
      { name: "Cliques", value: 3827 },
      { name: "Landing Page Views", value: 3400 },
      { name: "Plays VSL", value: 2380 },
      { name: "Iniciação de Compra", value: 198 },
      { name: "Vendas", value: 124 },
      { name: "Upsell 1", value: 18 },
    ],
  },
];
