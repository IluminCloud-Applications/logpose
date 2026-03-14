import { Card, CardContent } from "@/components/ui/card";
import {
  RiFlashlightLine,
  RiMoneyDollarBoxLine,
  RiBarChartLine,
  RiLineChartLine,
  RiShoppingBagLine,
  RiFocus3Line,
} from "@remixicon/react";
import type { MetricRow } from "./campaignCellHelpers";
import { cn } from "@/lib/utils";

function fmt(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}

interface CampaignsKpisProps {
  data: (MetricRow & { status?: string })[];
}

export function CampaignsKpis({ data }: CampaignsKpisProps) {
  const totalSpend = data.reduce((s, c) => s + c.spend, 0);
  const totalRevenue = data.reduce((s, c) => s + c.revenue, 0);
  const totalSales = data.reduce((s, c) => s + c.sales, 0);
  const totalProfit = data.reduce((s, c) => s + c.profit, 0);
  const avgRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
  const activeCampaigns = data.filter((c) => c.status === "active").length;

  const metrics = [
    { label: "Ativas", value: String(activeCampaigns), icon: RiFlashlightLine, color: "text-primary" },
    { label: "Investido", value: fmt(totalSpend), icon: RiBarChartLine, color: "text-foreground" },
    { label: "Faturamento", value: fmt(totalRevenue), icon: RiMoneyDollarBoxLine, color: "text-primary" },
    { label: "Lucro", value: fmt(totalProfit), icon: RiLineChartLine, color: "text-[var(--color-success)]" },
    { label: "Vendas", value: totalSales.toLocaleString("pt-BR"), icon: RiShoppingBagLine, color: "text-foreground" },
    { label: "ROAS", value: `${avgRoas.toFixed(2)}x`, icon: RiFocus3Line, color: "text-primary" },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
      {metrics.map((m) => (
        <Card key={m.label} className="border-border/40 hover:border-border/70 transition-colors">
          <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="flex size-7 sm:size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
              <m.icon className={cn("size-4", m.color)} />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {m.label}
              </p>
              <p className="text-sm sm:text-base font-bold tabular-nums leading-tight truncate">{m.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
