import { Card, CardContent } from "@/components/ui/card";
import type { RemixiconComponentType } from "@remixicon/react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useValueDisplay } from "@/contexts/ValueDisplayContext";
import { fmtFull } from "@/utils/format";

interface MetricCardProps {
  label: string;
  value: string;
  rawValue?: number;
  icon: RemixiconComponentType;
  color?: string;
  sub?: string;
  loading?: boolean;
}

/**
 * Card compacto de métrica reutilizável com proteção contra overflow.
 * Usado em: Campaigns, Sales, Customers, Recovery, Refunds.
 */
export function MetricCard({ label, value, rawValue, icon: Icon, color = "text-foreground", sub, loading }: MetricCardProps) {
  const { showFull } = useValueDisplay();
  const displayValue = showFull && rawValue != null ? fmtFull(rawValue) : value;
  const titleAttr = rawValue != null
    ? showFull ? value : fmtFull(rawValue)
    : value;
  const isLongValue = displayValue.length > 12;

  return (
    <Card className="border-border/40 hover:border-border/70 transition-colors overflow-hidden">
      <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
        <div className="flex size-7 sm:size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
          <Icon className={cn("size-4", color)} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground truncate">
            {label}
          </p>
          {loading ? (
            <Skeleton className="h-5 w-16 mt-0.5" />
          ) : (
            <>
              <p
                className={cn(
                  "font-bold tabular-nums leading-tight truncate",
                  isLongValue ? "text-[10px] sm:text-xs" : "text-sm sm:text-base",
                )}
                title={titleAttr}
              >
                {displayValue}
              </p>
              {sub && (
                <p className="text-[10px] text-muted-foreground tabular-nums truncate">{sub}</p>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
