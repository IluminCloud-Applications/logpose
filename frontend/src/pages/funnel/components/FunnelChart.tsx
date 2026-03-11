import { Card, CardContent } from "@/components/ui/card";
import type { FunnelProduct } from "@/services/funnel";

interface FunnelChartProps {
  funnel: FunnelProduct;
  anchor: string;
}

function formatNumber(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return v.toLocaleString("pt-BR");
}

// Deep navy → teal gradient palette for a modern premium look
const stageColors = [
  { bg: "#1e3a5f", text: "#e8f0fe" },
  { bg: "#1d4e7e", text: "#e0ecf9" },
  { bg: "#1a6493", text: "#d6e8f5" },
  { bg: "#1878a6", text: "#cce3f0" },
  { bg: "#178db5", text: "#c0dfeb" },
  { bg: "#17a2b8", text: "#b5dce5" },
  { bg: "#20b1b0", text: "#aad8d8" },
  { bg: "#2cc4a4", text: "#a0d4cc" },
  { bg: "#3cd194", text: "#97d0c0" },
  { bg: "#4ede84", text: "#8eccb4" },
];

export function FunnelChart({ funnel, anchor }: FunnelChartProps) {
  const stages = funnel.stages;
  const total = stages.length;

  const getConversion = (index: number): number | null => {
    if (index === 0) return null;
    const base = anchor === "previous"
      ? stages[index - 1]?.value
      : stages.find((s) => s.name === anchor)?.value;
    return base ? (stages[index].value / base) * 100 : null;
  };

  const getDropoff = (index: number): number | null => {
    if (index === 0) return null;
    const conv = getConversion(index);
    return conv !== null ? 100 - conv : null;
  };

  return (
    <Card className="border-border/40 overflow-hidden">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col items-center gap-0">
          {stages.map((stage, index) => {
            const widthPercent = 100 - ((index / Math.max(total - 1, 1)) * 70);
            const conversion = getConversion(index);
            const dropoff = getDropoff(index);
            const color = stageColors[index % stageColors.length];

            return (
              <div key={stage.name} className="flex flex-col items-center w-full">
                {index > 0 && (
                  <div className="flex items-center justify-center gap-3 h-8">
                    <div className="w-px h-full bg-border/50" />
                    {conversion !== null && (
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold tabular-nums px-2 py-0.5 rounded-full ${
                          conversion >= 50 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                          conversion >= 20 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                          "bg-red-500/10 text-red-600 dark:text-red-400"
                        }`}>
                          ✓ {conversion.toFixed(1)}%
                        </span>
                        {dropoff !== null && dropoff > 0 && (
                          <span className="text-[10px] tabular-nums text-muted-foreground/60">
                            ✕ {dropoff.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div
                  className="relative group transition-all duration-300 hover:scale-[1.01] cursor-default"
                  style={{ width: `${widthPercent}%` }}
                >
                  <div
                    className="flex items-center justify-between px-5 py-4 rounded-xl transition-shadow duration-200 group-hover:shadow-lg"
                    style={{ backgroundColor: color.bg, color: color.text }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-white/15 text-[11px] font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm font-semibold tracking-tight">{stage.name}</span>
                    </div>
                    <span className="text-base font-bold tabular-nums tracking-tight">
                      {formatNumber(stage.value)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
