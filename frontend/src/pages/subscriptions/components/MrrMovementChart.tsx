import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from "recharts";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import {
  RiArrowUpCircleLine,
  RiArrowDownCircleLine,
} from "@remixicon/react";
import type { MrrHistoryPoint } from "@/services/stripe";

const chartConfig = {
  new_mrr: { label: "Novo MRR", color: "var(--color-success)" },
  churned_mrr: { label: "MRR Perdido", color: "var(--destructive)" },
} satisfies ChartConfig;

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const [year, month] = (label as string).split("-");
  const date = new Date(Number(year), Number(month) - 1);
  const monthStr = date.toLocaleDateString("pt-BR", {
    month: "long", year: "numeric",
  });

  const newMrr = payload.find((p: any) => p.dataKey === "new_mrr")?.value ?? 0;
  const churned = payload.find((p: any) => p.dataKey === "churned_neg")?.value ?? 0;
  const netMrr = newMrr + churned; // churned is already negative

  return (
    <div className="rounded-xl border border-border/60 bg-card/95 backdrop-blur-md p-3 shadow-xl min-w-[200px]">
      <p className="text-xs font-medium text-muted-foreground mb-2.5 capitalize">
        {monthStr}
      </p>
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-full bg-[var(--color-success)]/15">
            <RiArrowUpCircleLine className="size-3.5 text-[var(--color-success)]" />
          </div>
          <div className="flex flex-1 items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground">Novo</span>
            <span className="text-sm font-semibold tabular-nums text-[var(--color-success)]">
              +R$ {Number(newMrr).toLocaleString("pt-BR")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-full bg-destructive/15">
            <RiArrowDownCircleLine className="size-3.5 text-destructive" />
          </div>
          <div className="flex flex-1 items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground">Perdido</span>
            <span className="text-sm font-semibold tabular-nums text-destructive">
              -R$ {Math.abs(churned).toLocaleString("pt-BR")}
            </span>
          </div>
        </div>
        <div className="pt-1.5 border-t border-border/40 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Saldo</span>
          <span
            className={`text-sm font-bold tabular-nums ${
              netMrr >= 0 ? "text-[var(--color-success)]" : "text-destructive"
            }`}
          >
            {netMrr >= 0 ? "+" : ""}R$ {netMrr.toLocaleString("pt-BR")}
          </span>
        </div>
      </div>
    </div>
  );
}

interface MrrMovementChartProps {
  data: MrrHistoryPoint[];
}

export function MrrMovementChart({ data }: MrrMovementChartProps) {
  // Transform: churned as negative for stacked display
  const chartData = data.map((d) => ({
    ...d,
    churned_neg: -d.churned_mrr,
  }));

  if (data.length === 0) {
    return (
      <Card className="border-border/40">
        <CardContent className="flex items-center justify-center h-[340px] text-muted-foreground">
          Sem dados de movimentação
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Movimento do MRR</CardTitle>
        <CardDescription>
          Novo MRR vs MRR perdido por cancelamento a cada mês
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
          <BarChart data={chartData}>
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
            <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="3 3" />
            <ChartTooltip content={<CustomTooltip />} cursor={false} />
            <Bar
              dataKey="new_mrr"
              fill="var(--color-success)"
              radius={[4, 4, 0, 0]}
              fillOpacity={0.85}
            />
            <Bar
              dataKey="churned_neg"
              fill="var(--destructive)"
              radius={[0, 0, 4, 4]}
              fillOpacity={0.85}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
