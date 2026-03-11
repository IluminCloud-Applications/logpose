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
