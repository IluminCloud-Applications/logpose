import {
  RiMoneyDollarBoxLine,
  RiLineChartLine,
  RiBarChartLine,
  RiFocus3Line,
  RiCalendarCheckLine,
  RiPercentLine,
  RiShoppingCartLine,
  RiRepeatLine,
} from "@remixicon/react";
import { KpiCard } from "@/pages/dashboard/components/KpiCard";
import { calcCompanyKpis } from "@/utils/company-kpis";
import type { MonthlyFinancial, CompanySettings } from "@/types/company";

function fmt(v: number): string {
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });
}

interface CompanyKpisProps {
  data: MonthlyFinancial[];
  settings: CompanySettings;
  totalSalesCount: number;
  uniqueCustomersCount: number;
}

export function CompanyKpis({ data, settings, totalSalesCount, uniqueCustomersCount }: CompanyKpisProps) {
  const k = calcCompanyKpis(data, settings, totalSalesCount, uniqueCustomersCount);
  const year = new Date().getFullYear();

  const kpis = [
    {
      title: "Faturamento Anual",
      value: fmt(k.totalRevenue),
      icon: RiMoneyDollarBoxLine,
      subtitle: `${k.currentMonth} meses ativos`,
      variant: "primary" as const,
    },
    {
      title: "Lucro Líquido Real",
      value: fmt(k.netProfit),
      icon: RiLineChartLine,
      subtitle: `Após impostos e operacional`,
      variant: k.netProfit > 0 ? ("success" as const) : ("destructive" as const),
    },
    {
      title: "Ticket Médio (AOV)",
      value: fmt(k.aov),
      icon: RiShoppingCartLine,
      subtitle: `${k.totalSales} vendas no período`,
      variant: "primary" as const,
    },
    {
      title: "Média de Recompra",
      value: `${k.repurchaseRate.toFixed(2)}x`,
      icon: RiRepeatLine,
      subtitle: "Compras por cliente",
      variant: "primary" as const,
    },
    {
      title: "ROI Real",
      value: `${k.realRoi.toFixed(1)}%`,
      icon: RiFocus3Line,
      subtitle: "Com impostos + operacional",
      trend: { value: Math.abs(k.realRoi), positive: k.realRoi > 0 },
      variant: k.realRoi > 0 ? ("success" as const) : ("destructive" as const),
    },
    {
      title: "Investido Total",
      value: fmt(k.totalSpend),
      icon: RiBarChartLine,
      subtitle: `Impostos: ${fmt(k.taxAmount)}`,
      variant: "default" as const,
    },
    {
      title: `Projeção ${year}`,
      value: fmt(k.projectedAnnualRevenue),
      icon: RiCalendarCheckLine,
      subtitle: `Média/mês: ${fmt(k.avgMonthlyRevenue)}`,
      variant: "primary" as const,
    },
    {
      title: "Crescimento",
      value: `${k.growthRate >= 0 ? "+" : ""}${k.growthRate.toFixed(1)}%`,
      icon: RiPercentLine,
      subtitle: "vs mês anterior",
      trend: { value: Math.abs(k.growthRate), positive: k.growthRate >= 0 },
      variant: k.growthRate >= 0 ? ("success" as const) : ("destructive" as const),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.title} {...kpi} />
      ))}
    </div>
  );
}
