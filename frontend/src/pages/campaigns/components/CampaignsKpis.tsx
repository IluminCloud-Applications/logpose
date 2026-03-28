import {
  RiFlashlightLine,
  RiMoneyDollarBoxLine,
  RiBarChartLine,
  RiLineChartLine,
  RiShoppingBagLine,
  RiFocus3Line,
} from "@remixicon/react";
import { MetricCard } from "@/components/MetricCard";
import type { MetricRow } from "./campaignCellHelpers";
import { fmtCompact, fmtNumber } from "@/utils/format";

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
    { label: "Investido", value: fmtCompact(totalSpend), icon: RiBarChartLine, color: "text-foreground" },
    { label: "Faturamento", value: fmtCompact(totalRevenue), icon: RiMoneyDollarBoxLine, color: "text-primary" },
    { label: "Lucro", value: fmtCompact(totalProfit), icon: RiLineChartLine, color: "text-[var(--color-success)]" },
    { label: "Vendas", value: fmtNumber(totalSales), icon: RiShoppingBagLine, color: "text-foreground" },
    { label: "ROAS", value: `${avgRoas.toFixed(2)}x`, icon: RiFocus3Line, color: "text-primary" },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
      {metrics.map((m) => (
        <MetricCard key={m.label} {...m} />
      ))}
    </div>
  );
}
