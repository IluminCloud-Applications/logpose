import { useState, useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { RiMoneyDollarBoxLine, RiBarChartLine, RiLineChartLine } from "@remixicon/react";
import type { MonthlyFinancial, CompanySettings } from "@/types/company";

const chartConfig = {
  revenue: { label: "Faturamento", color: "var(--chart-1)" },
  spend: { label: "Investido", color: "var(--chart-4)" },
  profit: { label: "Lucro", color: "var(--chart-2)" },
} satisfies ChartConfig;

const metricIcons = {
  revenue: RiMoneyDollarBoxLine,
  spend: RiBarChartLine,
  profit: RiLineChartLine,
};

const metricColors = {
  revenue: "var(--chart-1)",
  spend: "var(--chart-4)",
  profit: "var(--chart-2)",
};

function MonthlyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/60 bg-card/95 backdrop-blur-md p-3 shadow-xl min-w-[200px]">
      <p className="text-xs font-medium text-muted-foreground mb-2.5">{label}</p>
      <div className="space-y-2">
        {payload.map((entry: any) => {
          const key = entry.dataKey as keyof typeof metricIcons;
          const Icon = metricIcons[key];
          const color = metricColors[key];
          return (
            <div key={key} className="flex items-center gap-2.5">
              <div
                className="flex size-7 items-center justify-center rounded-full"
                style={{ backgroundColor: `color-mix(in oklch, ${color}, transparent 85%)` }}
              >
                <Icon className="size-3.5" style={{ color }} />
              </div>
              <div className="flex flex-1 items-center justify-between gap-4">
                <span className="text-xs text-muted-foreground">{chartConfig[key]?.label}</span>
                <span className="text-sm font-semibold tabular-nums">
                  R$ {Number(entry.value).toLocaleString("pt-BR")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface MonthlyChartProps {
  data: MonthlyFinancial[];
  settings: CompanySettings;
}

export function MonthlyChart({ data, settings }: MonthlyChartProps) {
  const availableYears = useMemo(() => {
    const years = [...new Set(data.map((m) => m.month.slice(0, 4)))];
    return years.sort((a, b) => b.localeCompare(a));
  }, [data]);

  const [selectedYear, setSelectedYear] = useState(availableYears[0] || String(new Date().getFullYear()));

  const filteredData = data.filter((m) => m.month.startsWith(selectedYear));

  const chartData = filteredData.map((m) => ({
    ...m,
    profit: m.revenue > 0
      ? m.profit - (m.revenue * settings.tax_rate / 100)
        - settings.operational_costs.reduce((s, c) => s + c.amount, 0)
      : 0,
  }));

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Faturamento Mensal</CardTitle>
            <CardDescription>
              Investido, faturamento e lucro líquido por mês
            </CardDescription>
          </div>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="h-9 w-[100px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              tickLine={false} axisLine={false} tickMargin={8}
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            />
            <ChartTooltip content={<MonthlyTooltip />} cursor={false} />
            <Bar dataKey="spend" fill="var(--color-spend)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="profit" fill="var(--color-profit)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
