import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FunnelProduct } from "@/services/funnel";

// Theme madeira bar colors - distinct enough for comparison
const BAR_COLORS = [
  "oklch(0.72 0.17 50)",   // amber primary
  "oklch(0.62 0.19 45)",   // burnt orange
  "oklch(0.82 0.13 65)",   // warm gold
  "oklch(0.52 0.16 42)",   // walnut
];

function formatNumber(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return v.toLocaleString("pt-BR");
}

interface CompareBarChartProps {
  funnels: FunnelProduct[];
  anchor: string;
}

export function CompareBarChart({ funnels, anchor }: CompareBarChartProps) {
  const allStages = useMemo(() => {
    const stageSet = new Set<string>();
    funnels.forEach((f) => f.stages.forEach((s) => stageSet.add(s.name)));
    return Array.from(stageSet);
  }, [funnels]);

  if (funnels.length === 0) {
    return (
      <Card className="border-border/40 border-dashed">
        <CardContent className="flex items-center justify-center py-16">
          <p className="text-sm text-muted-foreground">
            Selecione produtos para comparar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-3 pt-4 px-5">
        <CardTitle className="text-base">Comparativo por Etapa</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-5">
        {allStages.map((stageName) => (
          <StageComparison
            key={stageName}
            stageName={stageName}
            funnels={funnels}
            allStages={allStages}
            anchor={anchor}
          />
        ))}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 pt-2 border-t border-border/30">
          {funnels.map((f, i) => (
            <div key={f.productId} className="flex items-center gap-2">
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }}
              />
              <span className="text-xs text-muted-foreground">
                {f.productName}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StageComparison({
  stageName, funnels, allStages, anchor,
}: {
  stageName: string;
  funnels: FunnelProduct[];
  allStages: string[];
  anchor: string;
}) {
  const maxVal = useMemo(() => {
    let max = 0;
    funnels.forEach((f) => {
      const val = f.stages.find((s) => s.name === stageName)?.value || 0;
      if (val > max) max = val;
    });
    return max || 1;
  }, [funnels, stageName]);

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-foreground">{stageName}</p>
      <div className="space-y-1.5">
        {funnels.map((f, fi) => {
          const stage = f.stages.find((s) => s.name === stageName);
          const value = stage?.value || 0;
          const widthPct = (value / maxVal) * 100;
          const color = BAR_COLORS[fi % BAR_COLORS.length];

          // Conversion
          const stageIdx = allStages.indexOf(stageName);
          let conv: number | null = null;
          if (stageIdx > 0) {
            const baseName =
              anchor === "previous" ? allStages[stageIdx - 1] : anchor;
            const baseVal =
              f.stages.find((s) => s.name === baseName)?.value || 0;
            conv = baseVal > 0 ? (value / baseVal) * 100 : null;
          }

          return (
            <div key={f.productId} className="flex items-center gap-3">
              <div className="flex-1 h-7 bg-muted/30 rounded-md overflow-hidden">
                <div
                  className="h-full rounded-md flex items-center px-2.5 transition-all duration-300"
                  style={{
                    width: `${Math.max(widthPct, 2)}%`,
                    backgroundColor: color,
                  }}
                >
                  {widthPct > 15 && (
                    <span className="text-[11px] font-bold text-white tabular-nums">
                      {formatNumber(value)}
                    </span>
                  )}
                </div>
              </div>
              {widthPct <= 15 && (
                <span className="text-xs font-semibold tabular-nums text-foreground min-w-[40px]">
                  {formatNumber(value)}
                </span>
              )}
              {conv !== null && (
                <span
                  className={`text-[10px] font-bold tabular-nums min-w-[48px] text-right ${
                    conv >= 50
                      ? "text-success"
                      : conv >= 20
                        ? "text-warning"
                        : "text-destructive"
                  }`}
                >
                  {conv.toFixed(1)}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
