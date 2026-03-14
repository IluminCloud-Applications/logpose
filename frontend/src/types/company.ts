// ── KPI Colors types ───────────────────────────────────
export interface KpiThreshold {
  min?: number | null;
  max?: number | null;
}

export interface KpiColorEntry {
  green: KpiThreshold;
  yellow: KpiThreshold;
  red: KpiThreshold;
}

export interface KpiColorsConfig {
  roas: KpiColorEntry | null;
  cpa: KpiColorEntry | null;
  ctr: KpiColorEntry | null;
  cpc: KpiColorEntry | null;
}

// ── AI Instructions types ──────────────────────────────
export interface MetricRule {
  good: string;
  bad: string;
  average: string;
}

export interface AiMetricsConfig {
  roas: MetricRule | null;
  cpa: MetricRule | null;
  cpc: MetricRule | null;
  connect_rate: MetricRule | null;
}

export interface AiInstructions {
  metrics: AiMetricsConfig;
  additional_prompt: string;
}

// ── Company types ──────────────────────────────────────

export interface OperationalCost {
  id: string;
  name: string;
  amount: number;
}

export interface CompanySettings {
  tax_rate: number;
  operational_costs: OperationalCost[];
}

export interface MonthlyFinancial {
  month: string;
  label: string;
  revenue: number;
  losses: number;
  spend: number;
  profit: number;
}

export interface CompanyDashboard {
  year: number;
  monthly: MonthlyFinancial[];
  total_sales: number;
  unique_customers: number;
}
