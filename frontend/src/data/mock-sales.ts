export type SaleOrigin = "facebook" | "email" | "whatsapp";

export interface SaleRow {
  id: string;
  date: string;
  product: string;
  platform: "kiwify" | "payt";
  status: "approved" | "refunded" | "chargeback" | "pending" | "trial";
  amount: number;
  customerEmail: string;
  utmCampaign: string;
  utmContent: string;
  utmMedium: string;
  utmSource: string;
  src: string;
  origin: SaleOrigin;
}

export const salesData: SaleRow[] = [
  {
    id: "TXN-001",
    date: "2026-03-09T14:32:00",
    product: "Ebook Fitness Premium",
    platform: "kiwify",
    status: "approved",
    amount: 197.0,
    customerEmail: "jo***@gmail.com",
    utmCampaign: "Campaign - Ebook Fitness",
    utmContent: "Ad - Transformação 30 dias",
    utmMedium: "Conjunto - Interesse Fitness",
    utmSource: "facebook_feed",
    src: "fb_campaign_fitness",
    origin: "facebook",
  },
  {
    id: "TXN-002",
    date: "2026-03-09T13:15:00",
    product: "Curso Marketing Digital",
    platform: "kiwify",
    status: "approved",
    amount: 297.0,
    customerEmail: "ma***@hotmail.com",
    utmCampaign: "Campaign - Curso Marketing Digital",
    utmContent: "Ad - Depoimento Aluno",
    utmMedium: "Conjunto - Lookalike 1%",
    utmSource: "instagram_stories",
    src: "fb_campaign_mkt",
    origin: "facebook",
  },
  {
    id: "TXN-003",
    date: "2026-03-09T12:45:00",
    product: "Mentoria Premium",
    platform: "payt",
    status: "approved",
    amount: 497.0,
    customerEmail: "pe***@yahoo.com",
    utmCampaign: "",
    utmContent: "",
    utmMedium: "",
    utmSource: "",
    src: "email_sequencia_mentoria",
    origin: "email",
  },
  {
    id: "TXN-004",
    date: "2026-03-09T11:20:00",
    product: "PLR Bundle Pack",
    platform: "kiwify",
    status: "refunded",
    amount: 97.0,
    customerEmail: "ca***@gmail.com",
    utmCampaign: "Campaign - PLR Bundle Pack",
    utmContent: "Ad - Carrossel Produtos",
    utmMedium: "Conjunto - Broad",
    utmSource: "facebook_marketplace",
    src: "fb_campaign_plr",
    origin: "facebook",
  },
  {
    id: "TXN-005",
    date: "2026-03-09T10:05:00",
    product: "Ebook Fitness Premium",
    platform: "kiwify",
    status: "approved",
    amount: 197.0,
    customerEmail: "lu***@gmail.com",
    utmCampaign: "",
    utmContent: "",
    utmMedium: "",
    utmSource: "",
    src: "whatsapp_grupo_fitness",
    origin: "whatsapp",
  },
  {
    id: "TXN-006",
    date: "2026-03-09T09:30:00",
    product: "Curso Marketing Digital",
    platform: "payt",
    status: "chargeback",
    amount: 297.0,
    customerEmail: "an***@outlook.com",
    utmCampaign: "Campaign - Curso Marketing Digital",
    utmContent: "Ad - Resultado Real",
    utmMedium: "Conjunto - Lookalike 2%",
    utmSource: "facebook_feed",
    src: "fb_campaign_mkt_2",
    origin: "facebook",
  },
  {
    id: "TXN-007",
    date: "2026-03-09T08:12:00",
    product: "Lançamento VIP",
    platform: "kiwify",
    status: "approved",
    amount: 147.0,
    customerEmail: "fe***@gmail.com",
    utmCampaign: "",
    utmContent: "",
    utmMedium: "",
    utmSource: "",
    src: "email_lancamento_vip",
    origin: "email",
  },
  {
    id: "TXN-008",
    date: "2026-03-08T22:45:00",
    product: "Mentoria Premium",
    platform: "payt",
    status: "pending",
    amount: 497.0,
    customerEmail: "ro***@gmail.com",
    utmCampaign: "Campaign - Mentoria Premium",
    utmContent: "Ad - Live Replay",
    utmMedium: "Conjunto - Engajamento 30d",
    utmSource: "instagram_stories",
    src: "whatsapp_lista_broadcast",
    origin: "whatsapp",
  },
];
