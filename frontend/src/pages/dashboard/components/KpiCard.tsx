import { Card, CardContent } from "@/components/ui/card";
import type { RemixiconComponentType } from "@remixicon/react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
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
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: KpiCardProps) {
  return (
    <Card className="group relative overflow-hidden border-border/40 transition-all duration-300 hover:shadow-lg hover:border-primary/20">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p className={cn("text-2xl font-bold tabular-nums", variantStyles[variant])}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
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
          <div className={cn("rounded-lg p-2.5", iconBgStyles[variant])}>
            <Icon className={cn("size-5", variantStyles[variant])} />
          </div>
        </div>
      </CardContent>
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </Card>
  );
}
