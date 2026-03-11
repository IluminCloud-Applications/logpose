import { Card, CardContent } from "@/components/ui/card";
import {
  RiGroupLine, RiShoppingBagLine, RiMoneyDollarBoxLine, RiPriceTag3Line,
} from "@remixicon/react";
import type { CustomersSummary } from "@/types/customer";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

function fmt(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}

interface CustomersKpisProps {
  summary: CustomersSummary | null;
  loading: boolean;
}

export function CustomersKpis({ summary, loading }: CustomersKpisProps) {
  const metrics = [
    { label: "Total Clientes", value: String(summary?.total_customers ?? 0), icon: RiGroupLine, color: "text-primary" },
    { label: "Total Pedidos", value: String(summary?.total_orders ?? 0), icon: RiShoppingBagLine, color: "text-[var(--color-success)]" },
    { label: "Total Faturado", value: fmt(summary?.total_spent ?? 0), icon: RiMoneyDollarBoxLine, color: "text-primary" },
    { label: "Ticket Médio", value: fmt(summary?.avg_ticket ?? 0), icon: RiPriceTag3Line, color: "text-foreground" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m) => (
        <Card key={m.label} className="border-border/40 hover:border-border/70 transition-colors">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
              <m.icon className={cn("size-4", m.color)} />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {m.label}
              </p>
              {loading ? (
                <Skeleton className="h-5 w-16 mt-0.5" />
              ) : (
                <p className="text-base font-bold tabular-nums leading-tight">{m.value}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
