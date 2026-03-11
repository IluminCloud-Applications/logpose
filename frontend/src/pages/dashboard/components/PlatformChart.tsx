import { Pie, PieChart, Cell } from "recharts";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { RiShoppingBag3Line, RiMoneyDollarBoxLine } from "@remixicon/react";
import type { PlatformDist } from "@/types/dashboard";

const chartConfig = {
  value: { label: "Faturamento" },
  Kiwify: { label: "Kiwify", color: "var(--chart-1)" },
  PayT: { label: "PayT", color: "var(--chart-2)" },
} satisfies ChartConfig;

const COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)"];

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload;
  if (!entry) return null;

  return (
    <div className="rounded-xl border border-border/60 bg-card/95 backdrop-blur-md p-3 shadow-xl min-w-[190px]">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.fill }} />
        <p className="text-xs font-semibold">{entry.name}</p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-full"
               style={{ backgroundColor: `color-mix(in oklch, ${entry.fill}, transparent 85%)` }}>
            <RiShoppingBag3Line className="size-3.5" style={{ color: entry.fill }} />
          </div>
          <div className="flex flex-1 items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground">Vendas</span>
            <span className="text-sm font-semibold tabular-nums">{entry.sales}</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-full"
               style={{ backgroundColor: `color-mix(in oklch, ${entry.fill}, transparent 85%)` }}>
            <RiMoneyDollarBoxLine className="size-3.5" style={{ color: entry.fill }} />
          </div>
          <div className="flex flex-1 items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground">Faturamento</span>
            <span className="text-sm font-semibold tabular-nums">
              R$ {Number(entry.value).toLocaleString("pt-BR")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PlatformChartProps {
  data: PlatformDist[];
}

export function PlatformChart({ data }: PlatformChartProps) {
  const total = data.reduce((sum, i) => sum + i.value, 0);

  if (data.length === 0) {
    return (
      <Card className="border-border/40">
        <CardContent className="flex items-center justify-center h-[280px] text-muted-foreground">
          Sem dados
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Plataformas</CardTitle>
        <CardDescription>Distribuição de faturamento por plataforma</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px]">
          <PieChart>
            <ChartTooltip content={<CustomTooltip />} />
            <Pie data={data} dataKey="value" nameKey="name"
                 cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                 strokeWidth={2} stroke="var(--background)">
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="mt-3 flex flex-col gap-2">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground tabular-nums">{item.sales} vendas</span>
                <span className="text-sm font-semibold tabular-nums">
                  {total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
