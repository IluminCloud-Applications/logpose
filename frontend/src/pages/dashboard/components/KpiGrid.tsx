import {
  RiMoneyDollarBoxLine,
  RiLineChartLine,
  RiBarChartLine,
  RiFocus3Line,
  RiShoppingBagLine,
  RiPercentLine,
  RiCursorLine,
  RiErrorWarningLine,
} from "@remixicon/react";
import { KpiCard } from "./KpiCard";
import type { DashboardKpis } from "@/types/dashboard";
import { fmtCompact } from "@/utils/format";

interface KpiGridProps {
  kpis: DashboardKpis;
  taxEnabled: boolean;
  taxRate: number;
  opCostsEnabled: boolean;
  opCostsTotal: number;
}

export function KpiGrid({ kpis, taxEnabled, taxRate, opCostsEnabled, opCostsTotal }: KpiGridProps) {
  const taxDeduction = taxEnabled ? kpis.total_revenue * (taxRate / 100) : 0;
  const opDeduction = opCostsEnabled ? opCostsTotal : 0;
  const revenue = kpis.total_revenue - taxDeduction;
  const profit = kpis.profit - taxDeduction - opDeduction;
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
  const roas = kpis.total_spend > 0 ? revenue / kpis.total_spend : 0;

  const revenueLabel = [
    "Faturamento",
    taxEnabled ? "- impostos" : "",
    opCostsEnabled ? "- custos" : "",
  ].filter(Boolean).join(" ");

  const profitLabel = [
    "Lucro",
    taxEnabled ? "- impostos" : "",
    opCostsEnabled ? "- custos" : "",
  ].filter(Boolean).join(" ");

  const kpiCards = [
    {
      title: revenueLabel,
      value: fmtCompact(revenue),
      icon: RiMoneyDollarBoxLine,
      variant: "primary" as const,
    },
    {
      title: profitLabel,
      value: fmtCompact(profit),
      icon: RiLineChartLine,
      variant: profit >= 0 ? ("success" as const) : ("destructive" as const),
    },
    {
      title: "Investido",
      value: fmtCompact(kpis.total_spend),
      icon: RiBarChartLine,
      subtitle: `CPA: ${fmtCompact(kpis.cpa)}`,
      variant: "default" as const,
    },
    {
      title: "ROAS",
      value: `${roas.toFixed(2)}x`,
      icon: RiFocus3Line,
      variant: "primary" as const,
    },
    {
      title: "Vendas",
      value: kpis.total_sales.toLocaleString("pt-BR"),
      icon: RiShoppingBagLine,
      subtitle: `Ticket Médio: ${fmtCompact(kpis.average_ticket)}`,
      variant: "success" as const,
    },
    {
      title: "Margem de Lucro",
      value: `${profitMargin.toFixed(1)}%`,
      icon: RiPercentLine,
      variant: "default" as const,
    },
    {
      title: "Taxa de Conversão",
      value: `${kpis.conversion_rate}%`,
      icon: RiCursorLine,
      subtitle: `${kpis.total_clicks.toLocaleString("pt-BR")} cliques`,
      variant: "default" as const,
    },
    {
      title: "Chargebacks",
      value: fmtCompact(kpis.chargeback_amount),
      icon: RiErrorWarningLine,
      subtitle: `Taxa: ${kpis.chargeback_rate}%`,
      variant: "destructive" as const,
    },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {kpiCards.map((kpi) => (
        <KpiCard key={kpi.title} {...kpi} />
      ))}
    </div>
  );
}
