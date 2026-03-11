// ── Dashboard API types ──────────────────────────────────

export interface DashboardKpis {
  total_revenue: number;
  total_spend: number;
  profit: number;
  total_sales: number;
  average_ticket: number;
  cpa: number;
  roas: number;
  profit_margin: number;
  conversion_rate: number;
  total_clicks: number;
  chargeback_amount: number;
  chargeback_rate: number;
  refunded_count: number;
  chargeback_count: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  spend: number;
  profit: number;
  sales: number;
}

export interface PlatformDist {
  name: string;
  value: number;
  sales: number;
  fill: string;
}

export interface TopCampaign {
  name: string;
  spend: number;
  revenue: number;
  sales: number;
  profit: number;
  roas: number;
  cpa: number;
}

export interface HourlySale {
  hour: string;
  sales: number;
  revenue: number;
}

export interface DashboardOverview {
  kpis: DashboardKpis;
  daily_revenue: DailyRevenue[];
  platform_distribution: PlatformDist[];
  top_campaigns: TopCampaign[];
  hourly_sales: HourlySale[];
}
