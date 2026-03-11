import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiCalendarLine,
  RiTrophyLine,
} from "@remixicon/react";
import { calcCompanyKpis } from "@/utils/company-kpis";
import type { MonthlyFinancial, CompanySettings } from "@/types/company";
import { cn } from "@/lib/utils";

interface GrowthForecastProps {
  data: MonthlyFinancial[];
  settings: CompanySettings;
}

function fmt(v: number): string {
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });
}

export function GrowthForecast({ data, settings }: GrowthForecastProps) {
  const k = calcCompanyKpis(data, settings);
  const year = new Date().getFullYear();
  const activeMonths = data.filter((m) => m.revenue > 0);
  const remainingMonths = 12 - activeMonths.length;

  const bestMonth = activeMonths.length > 0
    ? activeMonths.reduce((best, m) => (m.revenue > best.revenue ? m : best), activeMonths[0])
    : null;

  const items = [
    {
      label: `Projeção até 31/12/${year}`,
      value: fmt(k.projectedAnnualRevenue),
      icon: RiCalendarLine,
      desc: `${remainingMonths} meses restantes`,
    },
    {
      label: "Melhor mês",
      value: bestMonth ? `${bestMonth.label} — ${fmt(bestMonth.revenue)}` : "—",
      icon: RiTrophyLine,
      desc: "Maior faturamento",
    },
    {
      label: "Faturamento último mês",
      value: fmt(k.lastMonthRevenue),
      icon: k.growthRate >= 0 ? RiArrowUpSLine : RiArrowDownSLine,
      desc: `${k.growthRate >= 0 ? "+" : ""}${k.growthRate.toFixed(1)}% vs anterior`,
    },
  ];

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Previsão de Crescimento</CardTitle>
        <CardDescription>Projeções baseadas na performance atual</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <item.icon className="size-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-semibold truncate">{item.value}</p>
              <p
                className={cn(
                  "text-xs mt-0.5",
                  item.desc.startsWith("+")
                    ? "text-[var(--color-success)]"
                    : item.desc.startsWith("-")
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                {item.desc}
              </p>
            </div>
          </div>
        ))}

        {activeMonths.length > 0 && (
          <div className="border-t border-border/30 pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Receita por mês
            </p>
            <div className="space-y-2">
              {activeMonths.map((m) => {
                const pct = bestMonth ? (m.revenue / bestMonth.revenue) * 100 : 0;
                return (
                  <div key={m.month} className="flex items-center gap-2">
                    <span className="text-xs w-8 text-muted-foreground">{m.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted/60 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/70 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium tabular-nums w-20 text-right">
                      {fmt(m.revenue)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
