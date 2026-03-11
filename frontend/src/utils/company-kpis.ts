import type { MonthlyFinancial, CompanySettings } from "@/types/company";

export interface CompanyKpiResult {
  totalRevenue: number;
  totalSpend: number;
  totalProfit: number;
  taxAmount: number;
  totalOpCosts: number;
  netProfit: number;
  avgMonthlyRevenue: number;
  projectedAnnualRevenue: number;
  currentMonth: number;
  growthRate: number;
  realRoi: number;
  lastMonthRevenue: number;
  totalSales: number;
  aov: number;
  repurchaseRate: number;
}

export function calcCompanyKpis(
  data: MonthlyFinancial[],
  settings: CompanySettings,
  totalSalesCount?: number,
  uniqueCustomersCount?: number
): CompanyKpiResult {
  const activeMonths = data.filter((m) => m.revenue > 0);
  const totalRevenue = activeMonths.reduce((s, m) => s + m.revenue, 0);
  const totalSpend = activeMonths.reduce((s, m) => s + m.spend, 0);
  const totalProfit = totalRevenue - totalSpend;
  const totalOpCosts =
    settings.operational_costs.reduce((s, c) => s + c.amount, 0) *
    activeMonths.length;
  const taxAmount = totalRevenue * (settings.tax_rate / 100);
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
      ? (netProfit / (totalSpend + totalOpCosts)) * 100
      : 0;

  const repurchaseRate =
    totalSalesCount && uniqueCustomersCount && uniqueCustomersCount > 0
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
