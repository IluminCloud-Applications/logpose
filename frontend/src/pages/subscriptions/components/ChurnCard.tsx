import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiUserUnfollowLine } from "@remixicon/react";

interface ChurnCardProps {
  churnRate: number;
  renewalRate: number;
  avgTenure: number;
  avgCancelMonths: number;
  totalCanceled: number;
}

export function ChurnCard({
  churnRate,
  renewalRate,
  avgTenure,
  avgCancelMonths,
  totalCanceled,
}: ChurnCardProps) {
  const isHealthy = churnRate <= 5;

  return (
    <Card className="border-border/40 transition-all duration-300 hover:shadow-lg hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-rose-500/10 p-2">
            <RiUserUnfollowLine className="size-4 text-rose-500" />
          </div>
          <CardTitle className="text-base font-semibold">
            Retenção & Cancelamento
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Churn visual indicator */}
        <div className="flex items-center gap-4">
          <div className="relative size-20 flex-shrink-0">
            <svg className="size-20 -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-muted/30"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeWidth="3"
                strokeDasharray={`${renewalRate}, 100`}
                className={isHealthy ? "stroke-[var(--color-success)]" : "stroke-destructive"}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold tabular-nums">
                {renewalRate}%
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Taxa de Renovação</p>
            <p className="text-xs text-muted-foreground">
              {isHealthy
                ? "Saudável — a maioria dos clientes renova"
                : "Atenção — churn acima do ideal"}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/40">
          <div className="space-y-1 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Cancelados
            </p>
            <p className="text-lg font-bold tabular-nums text-destructive">
              {totalCanceled}
            </p>
          </div>
          <div className="space-y-1 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Média Permanência
            </p>
            <p className="text-lg font-bold tabular-nums">
              {avgTenure}<span className="text-xs text-muted-foreground ml-0.5">m</span>
            </p>
          </div>
          <div className="space-y-1 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Média Cancela
            </p>
            <p className="text-lg font-bold tabular-nums">
              {avgCancelMonths}<span className="text-xs text-muted-foreground ml-0.5">m</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
