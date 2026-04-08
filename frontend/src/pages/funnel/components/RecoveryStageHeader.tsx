import type { FunnelProduct } from "@/services/funnel";

function formatNumber(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return v.toLocaleString("pt-BR");
}

function formatCurrency(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface RecoveryStageHeaderProps {
  stages: FunnelProduct["stages"];
  hoveredIndex: number | null;
  getConversion: (i: number) => number | null;
}

export function RecoveryStageHeader({
  stages, hoveredIndex, getConversion,
}: RecoveryStageHeaderProps) {
  return (
    <div
      className="grid border-b border-border/30 w-full"
      style={{ gridTemplateColumns: `repeat(${stages.length}, 1fr)` }}
    >
      {stages.map((stage, i) => {
        const conversion = getConversion(i);
        const isHovered = hoveredIndex === i;
        return (
          <div
            key={stage.name}
            className={`
              px-3 py-3 border-r border-border/20 last:border-r-0
              transition-colors duration-150
              ${isHovered ? "bg-muted/40" : ""}
            `}
          >
            <p className="text-[11px] text-muted-foreground font-medium truncate mb-0.5">
              {stage.name}
            </p>
            <p className="text-base font-bold tabular-nums leading-tight">
              {formatNumber(stage.value)}
            </p>
            {stage.revenue != null && stage.revenue > 0 && (
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                {formatCurrency(stage.revenue)}
              </p>
            )}
            {conversion !== null && (
              <p
                className={`text-[10px] font-bold mt-0.5 ${
                  conversion >= 50
                    ? "text-success"
                    : conversion >= 20
                      ? "text-warning"
                      : "text-destructive"
                }`}
              >
                ↓ {conversion.toFixed(1)}%
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
