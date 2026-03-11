// Mock data for company health page

export interface MonthlyFinancial {
  month: string;
  label: string;
  revenue: number;
  spend: number;
  profit: number;
}

export interface CompanySettings {
  taxRate: number;
  operationalCosts: OperationalCost[];
}

export interface OperationalCost {
  id: string;
  name: string;
  amount: number;
}

export const monthlyFinancialData: MonthlyFinancial[] = [
  { month: "2026-01", label: "Jan", revenue: 98500, spend: 32100, profit: 66400 },
  { month: "2026-02", label: "Fev", revenue: 127450, spend: 42150, profit: 85300 },
  { month: "2026-03", label: "Mar", revenue: 115200, spend: 38400, profit: 76800 },
  { month: "2026-04", label: "Abr", revenue: 0, spend: 0, profit: 0 },
  { month: "2026-05", label: "Mai", revenue: 0, spend: 0, profit: 0 },
  { month: "2026-06", label: "Jun", revenue: 0, spend: 0, profit: 0 },
  { month: "2026-07", label: "Jul", revenue: 0, spend: 0, profit: 0 },
  { month: "2026-08", label: "Ago", revenue: 0, spend: 0, profit: 0 },
  { month: "2026-09", label: "Set", revenue: 0, spend: 0, profit: 0 },
  { month: "2026-10", label: "Out", revenue: 0, spend: 0, profit: 0 },
  { month: "2026-11", label: "Nov", revenue: 0, spend: 0, profit: 0 },
  { month: "2026-12", label: "Dez", revenue: 0, spend: 0, profit: 0 },
];

export const defaultCompanySettings: CompanySettings = {
  taxRate: 12.3,
  operationalCosts: [
    { id: "1", name: "Funcionários", amount: 15000 },
    { id: "2", name: "Ferramentas/Apps", amount: 2500 },
    { id: "3", name: "Escritório", amount: 3000 },
  ],
};

// Company KPI calculations helper
export function calcCompanyKpis(
  data: MonthlyFinancial[],
  settings: CompanySettings,
  totalSalesCount?: number,
  uniqueCustomersCount?: number
) {
  const activeMonths = data.filter((m) => m.revenue > 0);
  const totalRevenue = activeMonths.reduce((s, m) => s + m.revenue, 0);
  const totalSpend = activeMonths.reduce((s, m) => s + m.spend, 0);
  const totalProfit = totalRevenue - totalSpend;
  const totalOpCosts =
    settings.operationalCosts.reduce((s, c) => s + c.amount, 0) *
    activeMonths.length;
  const taxAmount = totalRevenue * (settings.taxRate / 100);
  const netProfit = totalProfit - taxAmount - totalOpCosts;
  const avgMonthlyRevenue =
    activeMonths.length > 0 ? totalRevenue / activeMonths.length : 0;
  const projectedAnnualRevenue = avgMonthlyRevenue * 12;
  const currentMonth = activeMonths.length;
  const prevMonthRevenue = activeMonths.length >= 2
    ? activeMonths[activeMonths.length - 2].revenue
    : 0;
  const lastMonthRevenue = activeMonths.length >= 1
    ? activeMonths[activeMonths.length - 1].revenue
    : 0;
  const growthRate =
    prevMonthRevenue > 0
      ? ((lastMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
      : 0;
  const realRoi =
    totalSpend + totalOpCosts > 0
      ? ((netProfit) / (totalSpend + totalOpCosts)) * 100
      : 0;
      
  const repurchaseRate = totalSalesCount && uniqueCustomersCount && uniqueCustomersCount > 0
    ? totalSalesCount / uniqueCustomersCount
    : 0;

  return {
    totalRevenue,
    totalSpend,
    totalProfit,
    taxAmount,
    totalOpCosts,
    netProfit,
    avgMonthlyRevenue,
    projectedAnnualRevenue,
    currentMonth,
    growthRate,
    realRoi,
    lastMonthRevenue,
    totalSales: totalSalesCount ?? 0,
    aov: totalSalesCount && totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0,
    repurchaseRate,
  };
}
