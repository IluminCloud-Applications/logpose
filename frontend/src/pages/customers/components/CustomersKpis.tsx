import {
  RiGroupLine, RiShoppingBagLine, RiMoneyDollarBoxLine, RiPriceTag3Line,
} from "@remixicon/react";
import { MetricCard } from "@/components/MetricCard";
import type { CustomersSummary } from "@/types/customer";
import { fmtCompact, fmtNumber } from "@/utils/format";

interface CustomersKpisProps {
  summary: CustomersSummary | null;
  loading: boolean;
}

export function CustomersKpis({ summary, loading }: CustomersKpisProps) {
  const metrics = [
    { label: "Total Clientes", value: fmtNumber(summary?.total_customers ?? 0), icon: RiGroupLine, color: "text-primary" },
    { label: "Total Pedidos", value: fmtNumber(summary?.total_orders ?? 0), icon: RiShoppingBagLine, color: "text-[var(--color-success)]" },
    { label: "Total Faturado", value: fmtCompact(summary?.total_spent ?? 0), rawValue: summary?.total_spent ?? 0, icon: RiMoneyDollarBoxLine, color: "text-primary" },
    { label: "Ticket Médio", value: fmtCompact(summary?.avg_ticket ?? 0), rawValue: summary?.avg_ticket ?? 0, icon: RiPriceTag3Line, color: "text-foreground" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m) => (
        <MetricCard key={m.label} {...m} loading={loading} />
      ))}
    </div>
  );
}
