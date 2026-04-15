import { Card, CardContent } from "@/components/ui/card";
import type { RemixiconComponentType } from "@remixicon/react";
import { cn } from "@/lib/utils";
import { useValueDisplay } from "@/contexts/ValueDisplayContext";
import { fmtFull } from "@/utils/format";

interface KpiCardProps {
  title: string;
  value: string;
  rawValue?: number;
  subtitle?: string;
  icon: RemixiconComponentType;
  trend?: {
    value: number;
    positive: boolean;
  };
  variant?: "default" | "primary" | "success" | "destructive";
}

const variantStyles = {
  default: "text-foreground",
  primary: "text-primary",
  success: "text-[var(--color-success)]",
  destructive: "text-destructive",
};

const iconBgStyles = {
  default: "bg-muted",
  primary: "bg-primary/10",
  success: "bg-[var(--color-success)]/10",
  destructive: "bg-destructive/10",
};

export function KpiCard({
  title,
  value,
  rawValue,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: KpiCardProps) {
  const { showFull } = useValueDisplay();
  const displayValue = showFull && rawValue != null ? fmtFull(rawValue) : value;
  const titleAttr = rawValue != null
    ? showFull ? value : fmtFull(rawValue)
    : value;
  const isLongValue = displayValue.length > 12;

  return (
    <Card className="group relative overflow-hidden border-border/40 transition-all duration-300 hover:shadow-lg hover:border-primary/20">
      <CardContent className="p-3 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground truncate">
              {title}
            </p>
            <p
              className={cn(
                "font-bold tabular-nums truncate",
                isLongValue ? "text-sm sm:text-base" : "text-lg sm:text-2xl",
                variantStyles[variant],
              )}
              title={titleAttr}
            >
              {displayValue}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend.positive ? "text-[var(--color-success)]" : "text-destructive"
                  )}
                >
                  {trend.positive ? "↑" : "↓"} {Math.abs(trend.value).toFixed(2)}%
                </span>
                <span className="text-xs text-muted-foreground">vs período anterior</span>
              </div>
            )}
          </div>
          <div className={cn("rounded-lg p-1.5 sm:p-2.5 shrink-0", iconBgStyles[variant])}>
            <Icon className={cn("size-4 sm:size-5", variantStyles[variant])} />
          </div>
        </div>
      </CardContent>
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </Card>
  );
}
