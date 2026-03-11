export interface AdRow {
  id: string;
  adSetId: string;
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

export const adsData: AdRow[] = [
  // AdSet as-1-1: Mulheres 25-34 - Feed
  { id: "ad-1-1-1", adSetId: "as-1-1", name: "Criativo Depoimento Ana", status: "active", budget: 80, spend: 1600, revenue: 7200, sales: 48, roas: 4.5, cpa: 33.33, cpc: 1.68, clicks: 952, impressions: 29000, ctr: 3.28, profit: 5600, landingPageViews: 830, initiateCheckout: 78, connectRate: 87.2 },
  { id: "ad-1-1-2", adSetId: "as-1-1", name: "Criativo Antes/Depois", status: "active", budget: 70, spend: 1100, revenue: 3800, sales: 25, roas: 3.45, cpa: 44.0, cpc: 1.75, clicks: 629, impressions: 19500, ctr: 3.23, profit: 2700, landingPageViews: 545, initiateCheckout: 42, connectRate: 86.6 },
  { id: "ad-1-1-3", adSetId: "as-1-1", name: "Criativo Carrossel Tips", status: "paused", budget: 50, spend: 500, revenue: 1500, sales: 12, roas: 3.0, cpa: 41.67, cpc: 1.79, clicks: 279, impressions: 9500, ctr: 2.94, profit: 1000, landingPageViews: 245, initiateCheckout: 20, connectRate: 87.8 },

  // AdSet as-1-2: Homens 25-44 - Stories
  { id: "ad-1-2-1", adSetId: "as-1-2", name: "Story VSL Curto", status: "active", budget: 100, spend: 1500, revenue: 5200, sales: 32, roas: 3.47, cpa: 46.88, cpc: 1.88, clicks: 798, impressions: 26000, ctr: 3.07, profit: 3700, landingPageViews: 690, initiateCheckout: 55, connectRate: 86.5 },
  { id: "ad-1-2-2", adSetId: "as-1-2", name: "Story UGC Review", status: "active", budget: 80, spend: 1300, revenue: 3700, sales: 26, roas: 2.85, cpa: 50.0, cpc: 2.04, clicks: 637, impressions: 22000, ctr: 2.90, profit: 2400, landingPageViews: 550, initiateCheckout: 43, connectRate: 86.3 },

  // AdSet as-1-3: Lookalike 2% - Reels
  { id: "ad-1-3-1", adSetId: "as-1-3", name: "Reel Transformação", status: "paused", budget: 65, spend: 1400, revenue: 4000, sales: 26, roas: 2.86, cpa: 53.85, cpc: 1.87, clicks: 749, impressions: 25000, ctr: 3.00, profit: 2600, landingPageViews: 640, initiateCheckout: 42, connectRate: 85.4 },
  { id: "ad-1-3-2", adSetId: "as-1-3", name: "Reel Resultado 30d", status: "paused", budget: 55, spend: 1100, revenue: 3000, sales: 20, roas: 2.73, cpa: 55.0, cpc: 2.00, clicks: 550, impressions: 21000, ctr: 2.62, profit: 1900, landingPageViews: 480, initiateCheckout: 32, connectRate: 87.3 },

  // AdSet as-2-1: Empreendedores - Feed
  { id: "ad-2-1-1", adSetId: "as-2-1", name: "VSL Completo 15min", status: "active", budget: 180, spend: 2800, revenue: 9500, sales: 62, roas: 3.39, cpa: 45.16, cpc: 1.98, clicks: 1414, impressions: 46000, ctr: 3.07, profit: 6700, landingPageViews: 1230, initiateCheckout: 105, connectRate: 87.0 },
  { id: "ad-2-1-2", adSetId: "as-2-1", name: "Imagem Autoridade", status: "active", budget: 170, spend: 2300, revenue: 6700, sales: 46, roas: 2.91, cpa: 50.0, cpc: 2.14, clicks: 1074, impressions: 36000, ctr: 2.98, profit: 4400, landingPageViews: 950, initiateCheckout: 80, connectRate: 88.5 },

  // AdSet as-2-2: Retargeting 7d
  { id: "ad-2-2-1", adSetId: "as-2-2", name: "Retarget Escassez", status: "active", budget: 150, spend: 2200, revenue: 7200, sales: 45, roas: 3.27, cpa: 48.89, cpc: 2.10, clicks: 1048, impressions: 35000, ctr: 2.99, profit: 5000, landingPageViews: 910, initiateCheckout: 76, connectRate: 86.8 },
  { id: "ad-2-2-2", adSetId: "as-2-2", name: "Retarget Depoimento", status: "active", budget: 130, spend: 2000, revenue: 5600, sales: 37, roas: 2.8, cpa: 54.05, cpc: 2.28, clicks: 877, impressions: 30000, ctr: 2.92, profit: 3600, landingPageViews: 770, initiateCheckout: 66, connectRate: 87.8 },

  // AdSet as-2-3: Broad 18-55
  { id: "ad-2-3-1", adSetId: "as-2-3", name: "Broad VSL Teste A", status: "paused", budget: 100, spend: 1700, revenue: 3600, sales: 26, roas: 2.12, cpa: 65.38, cpc: 2.08, clicks: 817, impressions: 28000, ctr: 2.92, profit: 1900, landingPageViews: 720, initiateCheckout: 54, connectRate: 88.1 },
  { id: "ad-2-3-2", adSetId: "as-2-3", name: "Broad Imagem Teste B", status: "paused", budget: 70, spend: 1300, revenue: 2600, sales: 18, roas: 2.0, cpa: 72.22, cpc: 2.22, clicks: 585, impressions: 23000, ctr: 2.54, profit: 1300, landingPageViews: 520, initiateCheckout: 39, connectRate: 88.9 },

  // AdSet as-3-1: High Ticket Interest
  { id: "ad-3-1-1", adSetId: "as-3-1", name: "VSL Mentoria Case", status: "active", budget: 110, spend: 2000, revenue: 9000, sales: 42, roas: 4.5, cpa: 47.62, cpc: 1.48, clicks: 1351, impressions: 38000, ctr: 3.56, profit: 7000, landingPageViews: 1190, initiateCheckout: 70, connectRate: 88.1 },
  { id: "ad-3-1-2", adSetId: "as-3-1", name: "Carrossel Resultados", status: "active", budget: 90, spend: 1500, revenue: 6000, sales: 30, roas: 4.0, cpa: 50.0, cpc: 1.65, clicks: 909, impressions: 27000, ctr: 3.37, profit: 4500, landingPageViews: 790, initiateCheckout: 48, connectRate: 86.9 },

  // AdSet as-3-2: Lookalike Compradores
  { id: "ad-3-2-1", adSetId: "as-3-2", name: "Look. Copy Longa", status: "active", budget: 80, spend: 1500, revenue: 5500, sales: 28, roas: 3.67, cpa: 53.57, cpc: 1.67, clicks: 898, impressions: 28000, ctr: 3.21, profit: 4000, landingPageViews: 790, initiateCheckout: 44, connectRate: 88.0 },
  { id: "ad-3-2-2", adSetId: "as-3-2", name: "Look. Video Curto", status: "active", budget: 70, spend: 1200, revenue: 4300, sales: 24, roas: 3.58, cpa: 50.0, cpc: 1.79, clicks: 670, impressions: 22000, ctr: 3.05, profit: 3100, landingPageViews: 630, initiateCheckout: 36, connectRate: 94.0 },

  // AdSet as-4-1: Broad Interesse Digital
  { id: "ad-4-1-1", adSetId: "as-4-1", name: "PLR Feed Scroll", status: "paused", budget: 170, spend: 2800, revenue: 6500, sales: 52, roas: 2.32, cpa: 53.85, cpc: 2.32, clicks: 1207, impressions: 50000, ctr: 2.41, profit: 3700, landingPageViews: 1060, initiateCheckout: 82, connectRate: 87.8 },
  { id: "ad-4-1-2", adSetId: "as-4-1", name: "PLR Stories Quick", status: "paused", budget: 150, spend: 2400, revenue: 5500, sales: 43, roas: 2.29, cpa: 55.81, cpc: 2.45, clicks: 980, impressions: 42000, ctr: 2.33, profit: 3100, landingPageViews: 850, initiateCheckout: 66, connectRate: 86.7 },

  // AdSet as-4-2: Retargeting Carrinho
  { id: "ad-4-2-1", adSetId: "as-4-2", name: "Retarget Urgência", status: "paused", budget: 150, spend: 2500, revenue: 5500, sales: 44, roas: 2.2, cpa: 56.82, cpc: 2.48, clicks: 1008, impressions: 43000, ctr: 2.34, profit: 3000, landingPageViews: 880, initiateCheckout: 73, connectRate: 87.3 },
  { id: "ad-4-2-2", adSetId: "as-4-2", name: "Retarget Bônus", status: "paused", budget: 130, spend: 2100, revenue: 4550, sales: 36, roas: 2.17, cpa: 58.33, cpc: 2.59, clicks: 811, impressions: 35000, ctr: 2.32, profit: 2450, landingPageViews: 710, initiateCheckout: 59, connectRate: 87.5 },

  // AdSet as-5-1: Lista VIP Lookalike
  { id: "ad-5-1-1", adSetId: "as-5-1", name: "VIP Exclusivo Feed", status: "active", budget: 110, spend: 1500, revenue: 5200, sales: 38, roas: 3.47, cpa: 39.47, cpc: 1.58, clicks: 949, impressions: 28000, ctr: 3.39, profit: 3700, landingPageViews: 820, initiateCheckout: 60, connectRate: 86.4 },
  { id: "ad-5-1-2", adSetId: "as-5-1", name: "VIP Countdown", status: "active", budget: 90, spend: 1300, revenue: 4300, sales: 30, roas: 3.31, cpa: 43.33, cpc: 1.74, clicks: 747, impressions: 24000, ctr: 3.11, profit: 3000, landingPageViews: 650, initiateCheckout: 48, connectRate: 87.0 },

  // AdSet as-5-2: Cold Audience
  { id: "ad-5-2-1", adSetId: "as-5-2", name: "Cold Lead Magnet", status: "active", budget: 110, spend: 1400, revenue: 4200, sales: 32, roas: 3.0, cpa: 43.75, cpc: 1.87, clicks: 749, impressions: 24000, ctr: 3.12, profit: 2800, landingPageViews: 660, initiateCheckout: 50, connectRate: 88.1 },
  { id: "ad-5-2-2", adSetId: "as-5-2", name: "Cold Social Proof", status: "active", budget: 90, spend: 1150, revenue: 3300, sales: 25, roas: 2.87, cpa: 46.0, cpc: 2.06, clicks: 558, impressions: 19000, ctr: 2.94, profit: 2150, landingPageViews: 520, initiateCheckout: 37, connectRate: 93.2 },

  // AdSet as-6-1: Fitness Lovers
  { id: "ad-6-1-1", adSetId: "as-6-1", name: "Desafio Chamada", status: "completed", budget: 80, spend: 1300, revenue: 3200, sales: 26, roas: 2.46, cpa: 50.0, cpc: 1.86, clicks: 699, impressions: 25000, ctr: 2.80, profit: 1900, landingPageViews: 600, initiateCheckout: 40, connectRate: 85.8 },
  { id: "ad-6-1-2", adSetId: "as-6-1", name: "Desafio Resultado", status: "completed", budget: 60, spend: 1100, revenue: 2600, sales: 22, roas: 2.36, cpa: 50.0, cpc: 2.00, clicks: 550, impressions: 20000, ctr: 2.75, profit: 1500, landingPageViews: 480, initiateCheckout: 32, connectRate: 87.3 },

  // AdSet as-6-2: Weight Loss Interest
  { id: "ad-6-2-1", adSetId: "as-6-2", name: "Weight Loss Story", status: "completed", budget: 60, spend: 1000, revenue: 2200, sales: 18, roas: 2.2, cpa: 55.56, cpc: 2.08, clicks: 481, impressions: 19000, ctr: 2.53, profit: 1200, landingPageViews: 440, initiateCheckout: 32, connectRate: 91.5 },
  { id: "ad-6-2-2", adSetId: "as-6-2", name: "Weight Loss Before/After", status: "completed", budget: 50, spend: 800, revenue: 1800, sales: 16, roas: 2.25, cpa: 50.0, cpc: 2.22, clicks: 360, impressions: 14000, ctr: 2.57, profit: 1000, landingPageViews: 330, initiateCheckout: 26, connectRate: 91.7 },
];
