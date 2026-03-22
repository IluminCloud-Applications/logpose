import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { RiMoneyDollarBoxLine } from "@remixicon/react";
import type { MrrHistoryPoint } from "@/services/stripe";

const chartConfig = {
  mrr: { label: "MRR", color: "var(--chart-1)" },
} satisfies ChartConfig;

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const [year, month] = (label as string).split("-");
  const date = new Date(Number(year), Number(month) - 1);
  const monthStr = date.toLocaleDateString("pt-BR", {
    month: "long", year: "numeric",
  });

  return (
    <div className="rounded-xl border border-border/60 bg-card/95 backdrop-blur-md p-3 shadow-xl min-w-[180px]">
      <p className="text-xs font-medium text-muted-foreground mb-2 capitalize">{monthStr}</p>
      <div className="flex items-center gap-2.5">
        <div
          className="flex size-7 items-center justify-center rounded-full"
          style={{ backgroundColor: "color-mix(in oklch, var(--chart-1), transparent 85%)" }}
        >
          <RiMoneyDollarBoxLine className="size-3.5" style={{ color: "var(--chart-1)" }} />
        </div>
        <div className="flex flex-1 items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground">MRR</span>
          <span className="text-sm font-semibold tabular-nums">
            R$ {Number(payload[0].value).toLocaleString("pt-BR")}
          </span>
        </div>
      </div>
    </div>
  );
}

interface MrrEvolutionChartProps {
  data: MrrHistoryPoint[];
}

export function MrrEvolutionChart({ data }: MrrEvolutionChartProps) {
  if (data.length === 0) {
    return (
      <Card className="border-border/40">
        <CardContent className="flex items-center justify-center h-[340px] text-muted-foreground">
          Sem dados de histórico
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Evolução do MRR</CardTitle>
        <CardDescription>
          Receita Recorrente Mensal ao longo dos últimos meses
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillMrr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-mrr)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-mrr)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(v) => {
                const [y, m] = v.split("-");
                return new Date(Number(y), Number(m) - 1).toLocaleDateString("pt-BR", {
                  month: "short",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            />
            <ChartTooltip content={<CustomTooltip />} cursor={false} />
            <Area
              dataKey="mrr"
              type="monotone"
              fill="url(#fillMrr)"
              stroke="var(--color-mrr)"
              strokeWidth={2.5}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
