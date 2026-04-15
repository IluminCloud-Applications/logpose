import {
  RiShoppingBagLine,
  RiCheckboxCircleLine,
  RiMoneyDollarBoxLine,
  RiPriceTag3Line,
  RiRefundLine,
  RiErrorWarningLine,
} from "@remixicon/react";
import { MetricCard } from "@/components/MetricCard";
import type { SalesSummary } from "@/types/sale";
import { fmtCompact } from "@/utils/format";

interface SalesKpisProps {
  summary: SalesSummary | null;
  loading: boolean;
}

export function SalesKpis({ summary, loading }: SalesKpisProps) {
  const metrics = [
    { label: "Total", value: String(summary?.total ?? 0), icon: RiShoppingBagLine, color: "text-foreground" },
    { label: "Aprovadas", value: String(summary?.approved ?? 0), icon: RiCheckboxCircleLine, color: "text-[var(--color-success)]" },
    { label: "Faturamento", value: fmtCompact(summary?.revenue ?? 0), rawValue: summary?.revenue ?? 0, icon: RiMoneyDollarBoxLine, color: "text-primary" },
    { label: "Ticket Médio", value: fmtCompact(summary?.avg_ticket ?? 0), rawValue: summary?.avg_ticket ?? 0, icon: RiPriceTag3Line, color: "text-primary" },
    { label: "Reembolsos", value: String(summary?.refunded ?? 0), icon: RiRefundLine, color: "text-[var(--color-warning)]" },
    { label: "Chargebacks", value: String(summary?.chargebacks ?? 0), icon: RiErrorWarningLine, color: "text-destructive" },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-6">
      {metrics.map((m) => (
        <MetricCard key={m.label} {...m} loading={loading} />
      ))}
    </div>
  );
}
