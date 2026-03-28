import {
  RiMoneyDollarBoxLine,
  RiCalendarLine,
  RiGroupLine,
  RiUserAddLine,
  RiPercentLine,
  RiTimerLine,
  RiPriceTag3Line,
  RiArrowUpLine,
  RiVipCrownLine,
} from "@remixicon/react";
import { KpiCard } from "@/pages/dashboard/components/KpiCard";
import type { SubscriptionMetrics } from "@/services/stripe";
import { fmtCompact } from "@/utils/format";

interface SubscriptionKpiGridProps {
  metrics: SubscriptionMetrics;
}

export function SubscriptionKpiGrid({ metrics }: SubscriptionKpiGridProps) {
  const kpiCards = [
    {
      title: "MRR",
      value: fmtCompact(metrics.mrr),
      subtitle: "Receita Recorrente Mensal",
      icon: RiMoneyDollarBoxLine,
      variant: "primary" as const,
    },
    {
      title: "ARR",
      value: fmtCompact(metrics.arr),
      subtitle: "Receita Recorrente Anual",
      icon: RiCalendarLine,
      variant: "primary" as const,
    },
    {
      title: "LTV",
      value: fmtCompact(metrics.ltv),
      subtitle: "Valor vitalício por cliente",
      icon: RiVipCrownLine,
      variant: "success" as const,
    },
    {
      title: "Clientes Ativos",
      value: metrics.active_customers.toLocaleString("pt-BR"),
      icon: RiGroupLine,
      variant: "success" as const,
    },
    {
      title: "Novos no Mês",
      value: metrics.new_customers_month.toLocaleString("pt-BR"),
      icon: RiUserAddLine,
      variant: "success" as const,
    },
    {
      title: "Ticket Médio",
      value: fmtCompact(metrics.ticket_medio),
      subtitle: "Valor médio por assinatura",
      icon: RiPriceTag3Line,
      variant: "default" as const,
    },
    {
      title: "Taxa de Renovação",
      value: `${metrics.renewal_rate}%`,
      icon: RiArrowUpLine,
      variant: metrics.renewal_rate >= 80 ? ("success" as const) : ("destructive" as const),
    },
    {
      title: "Permanência Média",
      value: `${metrics.avg_tenure_months} meses`,
      subtitle: "Tempo médio como assinante",
      icon: RiTimerLine,
      variant: "default" as const,
    },
    {
      title: "Churn Rate",
      value: `${metrics.churn_rate}%`,
      subtitle: `${metrics.total_canceled_period} cancelados no período`,
      icon: RiPercentLine,
      variant: metrics.churn_rate <= 5 ? ("success" as const) : ("destructive" as const),
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
