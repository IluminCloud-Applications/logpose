import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiTestTubeLine } from "@remixicon/react";
import type { TrialMetrics } from "@/services/stripe";
import { fmtCompact } from "@/utils/format";

interface TrialCardProps {
  trials: TrialMetrics;
}

export function TrialCard({ trials }: TrialCardProps) {
  return (
    <Card className="border-border/40 transition-all duration-300 hover:shadow-lg hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-amber-500/10 p-2">
            <RiTestTubeLine className="size-4 text-amber-500" />
          </div>
          <CardTitle className="text-base font-semibold">Trials</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Trials Ativos
            </p>
            <p className="text-2xl font-bold tabular-nums text-amber-500 truncate">
              {trials.count}
            </p>
          </div>
          <div className="space-y-1 min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Valor Potencial
            </p>
            <p className="text-2xl font-bold tabular-nums text-primary truncate" title={fmtCompact(trials.potential_value)}>
              {fmtCompact(trials.potential_value)}
            </p>
          </div>
        </div>

        {/* Progress bars */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Conversão para cliente
              </span>
              <span className="text-xs font-semibold text-[var(--color-success)]">
                {trials.conversion_rate}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--color-success)] transition-all duration-500"
                style={{ width: `${Math.min(trials.conversion_rate, 100)}%` }}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Não converteram
              </span>
              <span className="text-xs font-semibold text-destructive">
                {trials.churn_rate}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-destructive transition-all duration-500"
                style={{ width: `${Math.min(trials.churn_rate, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
