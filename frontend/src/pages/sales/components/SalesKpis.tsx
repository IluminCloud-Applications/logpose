import { Card, CardContent } from "@/components/ui/card";
import {
  RiShoppingBagLine,
  RiCheckboxCircleLine,
  RiMoneyDollarBoxLine,
  RiPriceTag3Line,
  RiRefundLine,
  RiErrorWarningLine,
} from "@remixicon/react";
import type { SalesSummary } from "@/types/sale";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

function fmt(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}

interface SalesKpisProps {
  summary: SalesSummary | null;
  loading: boolean;
}

export function SalesKpis({ summary, loading }: SalesKpisProps) {
  const metrics = [
    { label: "Total", value: String(summary?.total ?? 0), icon: RiShoppingBagLine, color: "text-foreground" },
    { label: "Aprovadas", value: String(summary?.approved ?? 0), icon: RiCheckboxCircleLine, color: "text-[var(--color-success)]" },
    { label: "Faturamento", value: fmt(summary?.revenue ?? 0), icon: RiMoneyDollarBoxLine, color: "text-primary" },
    { label: "Ticket Médio", value: fmt(summary?.avg_ticket ?? 0), icon: RiPriceTag3Line, color: "text-primary" },
    { label: "Reembolsos", value: String(summary?.refunded ?? 0), icon: RiRefundLine, color: "text-[var(--color-warning)]" },
    { label: "Chargebacks", value: String(summary?.chargebacks ?? 0), icon: RiErrorWarningLine, color: "text-destructive" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
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
