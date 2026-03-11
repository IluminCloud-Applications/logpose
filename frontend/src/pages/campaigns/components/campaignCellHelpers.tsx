import { RiArrowUpSLine, RiArrowDownSLine } from "@remixicon/react";
import { productsData } from "@/data/mock-products";
import { cn } from "@/lib/utils";

/** Shared metric fields used by Campaign, AdSet and Ad rows */
export interface MetricRow {
  name: string;
  spend: number;
  revenue: number;
  sales: number;
  roas: number;
  cpa: number;
  cpc: number;
  clicks: number;
  impressions: number;
  ctr: number;
  landingPageViews: number;
  initiateCheckout: number;
  connectRate: number;
  profit: number;
  budget: number;
}

function getCpaStatus(
  cpa: number,
  name: string
): "good" | "bad" | "neutral" {
  const product = productsData.find((p) =>
    name
      .toLowerCase()
      .includes(
        p.name.toLowerCase().split(" ").slice(0, 2).join(" ").toLowerCase()
      )
  );
  if (!product) return "neutral";
  return cpa <= product.idealCpa ? "good" : "bad";
}

export function fmt(v: number): string {
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });
}

export function getCellValue(c: MetricRow, col: string): React.ReactNode {
  const checkoutConv =
    c.landingPageViews > 0
      ? (c.initiateCheckout / c.landingPageViews) * 100
      : 0;
  const saleRate =
    c.initiateCheckout > 0 ? (c.sales / c.initiateCheckout) * 100 : 0;

  const map: Record<string, React.ReactNode> = {
    spend: fmt(c.spend),
    sales: c.sales,
    revenue: fmt(c.revenue),
    profit: (
      <span className={cn(
        "font-medium",
        c.profit >= 0 ? "text-[var(--color-success)]" : "text-destructive"
      )}>
        {fmt(c.profit)}
      </span>
    ),
    roas: (
      <span
        className={cn(
          "font-semibold",
          c.roas >= 3
            ? "text-[var(--color-success)]"
            : c.roas >= 2
            ? "text-[var(--color-warning)]"
            : "text-destructive"
        )}
      >
        {c.roas.toFixed(2)}x
      </span>
    ),
    cpa: (
      <span
        className={cn(
          "inline-flex items-center gap-0.5 font-medium",
          getCpaStatus(c.cpa, c.name) === "good"
            ? "text-[var(--color-success)]"
            : getCpaStatus(c.cpa, c.name) === "bad"
            ? "text-destructive"
            : ""
        )}
      >
        {getCpaStatus(c.cpa, c.name) === "good" && (
          <RiArrowDownSLine className="size-3.5" />
        )}
        {getCpaStatus(c.cpa, c.name) === "bad" && (
          <RiArrowUpSLine className="size-3.5" />
        )}
        {fmt(c.cpa)}
      </span>
    ),
    cpc: `R$ ${c.cpc.toFixed(2)}`,
    ctr: `${c.ctr.toFixed(2)}%`,
    clicks: c.clicks.toLocaleString("pt-BR"),
    impressions: c.impressions.toLocaleString("pt-BR"),
    lpv: c.landingPageViews.toLocaleString("pt-BR"),
    ic: c.initiateCheckout,
    connectRate: `${c.connectRate.toFixed(1)}%`,
    playsVsl: "—",
    playRate: "—",
    checkoutConversion: `${checkoutConv.toFixed(1)}%`,
    checkoutToSaleRate: `${saleRate.toFixed(1)}%`,
    budget: fmt(c.budget),
  };
  return map[col] ?? "—";
}

export function getFooterValue(data: MetricRow[], col: string): string {
  const sums: Record<string, () => string> = {
    spend: () => fmt(data.reduce((s, c) => s + c.spend, 0)),
    sales: () => String(data.reduce((s, c) => s + c.sales, 0)),
    revenue: () => fmt(data.reduce((s, c) => s + c.revenue, 0)),
    profit: () => fmt(data.reduce((s, c) => s + c.profit, 0)),
    roas: () => {
      const spend = data.reduce((s, c) => s + c.spend, 0);
      return spend > 0
        ? `${(data.reduce((s, c) => s + c.revenue, 0) / spend).toFixed(2)}x`
        : "—";
    },
    clicks: () =>
      data.reduce((s, c) => s + c.clicks, 0).toLocaleString("pt-BR"),
    lpv: () =>
      data
        .reduce((s, c) => s + c.landingPageViews, 0)
        .toLocaleString("pt-BR"),
    ic: () =>
      String(data.reduce((s, c) => s + c.initiateCheckout, 0)),
  };
  return sums[col]?.() ?? "—";
}
