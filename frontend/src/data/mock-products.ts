export interface Checkout {
  id: string;
  url: string;
  price: number;
  sales: number;
  revenue: number;
  abandons: number;
  conversionRate: number;
}

export interface OrderBump {
  id: string;
  name: string;
  price: number;
  sales: number;
  revenue: number;
  conversionRate: number;
}

export interface Upsell {
  id: string;
  name: string;
  price: number;
  sales: number;
  revenue: number;
  conversionRate: number;
}

export interface Product {
  id: string;
  externalId: string;
  name: string;
  ticket: number;
  idealCpa: number;
  platform: "kiwify" | "payt";
  checkouts: Checkout[];
  orderBumps: OrderBump[];
  upsells: Upsell[];
}

export const productsData: Product[] = [
  {
    id: "p1",
    externalId: "KW-12345",
    name: "Ebook Fitness Premium",
    ticket: 197,
    idealCpa: 45,
    platform: "kiwify",
    checkouts: [
      { id: "ch1", url: "https://pay.kiwify.com.br/checkout-a", price: 197, sales: 120, revenue: 23640, abandons: 210, conversionRate: 36.36 },
      { id: "ch2", url: "https://pay.kiwify.com.br/checkout-b", price: 197, sales: 69, revenue: 13593, abandons: 102, conversionRate: 40.35 },
    ],
    orderBumps: [
      { id: "ob1", name: "E-book Receitas Fit", price: 37, sales: 85, revenue: 3145, conversionRate: 44.97 },
    ],
    upsells: [
      { id: "up1", name: "Plano de Treino 90 dias", price: 97, sales: 42, revenue: 4074, conversionRate: 22.22 },
    ],
  },
  {
    id: "p2",
    externalId: "KW-67890",
    name: "Curso Marketing Digital",
    ticket: 297,
    idealCpa: 55,
    platform: "kiwify",
    checkouts: [
      { id: "ch3", url: "https://pay.kiwify.com.br/checkout-mkt", price: 297, sales: 234, revenue: 69498, abandons: 420, conversionRate: 35.78 },
    ],
    orderBumps: [
      { id: "ob2", name: "Pack de Templates", price: 47, sales: 110, revenue: 5170, conversionRate: 47.01 },
    ],
    upsells: [
      { id: "up2", name: "Mentoria Grupo 30d", price: 197, sales: 38, revenue: 7486, conversionRate: 16.24 },
      { id: "up3", name: "Comunidade VIP", price: 97, sales: 55, revenue: 5335, conversionRate: 23.50 },
    ],
  },
  {
    id: "p3",
    externalId: "PT-11111",
    name: "Mentoria Premium",
    ticket: 497,
    idealCpa: 80,
    platform: "payt",
    checkouts: [
      { id: "ch4", url: "https://app.payt.com/checkout-mentoria", price: 497, sales: 124, revenue: 61628, abandons: 198, conversionRate: 38.51 },
    ],
    orderBumps: [],
    upsells: [
      { id: "up4", name: "Sessão Individual", price: 297, sales: 18, revenue: 5346, conversionRate: 14.52 },
    ],
  },
];
