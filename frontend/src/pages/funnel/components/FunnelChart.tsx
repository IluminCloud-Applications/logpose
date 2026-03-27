import { useState, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { FunnelProduct } from "@/services/funnel";
import { FunnelTooltip } from "./FunnelTooltip";
import { buildFunnelGeometry, SVG_W, SVG_H } from "./funnelGeometry";

interface FunnelChartProps {
  funnel: FunnelProduct;
  anchor: string;
}

function formatNumber(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return v.toLocaleString("pt-BR");
}

function formatCurrency(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function FunnelChart({ funnel, anchor }: FunnelChartProps) {
  const stages = funnel.stages;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const getConversion = useCallback(
    (index: number): number | null => {
      if (index === 0) return null;
      const base =
        anchor === "previous"
          ? stages[index - 1]?.value
          : stages.find((s) => s.name === anchor)?.value;
      return base ? (stages[index].value / base) * 100 : null;
    },
    [stages, anchor],
  );

  const geo = useMemo(
    () => buildFunnelGeometry(stages.map((s) => s.value), stages.length),
    [stages],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const scaledX = (x / rect.width) * SVG_W;
      const idx = Math.floor(scaledX / geo.stageWidth);
      setHoveredIndex(idx >= 0 && idx < stages.length ? idx : null);
      setMousePos({ x: e.clientX, y: e.clientY });
    },
    [geo.stageWidth, stages.length],
  );

  return (
    <Card className="border-border/40 overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto w-full">
          <div className="min-w-[900px] flex flex-col">
            {/* Header row — stage names + values */}
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
                  ${i > 0 ? "border-l border-border/10" : ""}
                `}
              >
                <p className="text-[11px] text-muted-foreground font-medium truncate mb-0.5">
                  {stage.name}
                </p>
                <p className="text-base font-bold tabular-nums leading-tight">
                  {formatNumber(stage.value)}
                </p>
                {stage.revenue != null && stage.revenue > 0 && (
                  <p className="text-[10px] text-primary font-semibold">
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

        {/* Horizontal flowing funnel SVG */}
        <div className="relative">
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="w-full h-auto"
            preserveAspectRatio="none"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <defs>
              <linearGradient id="funnel-h-grad" x1="0" y1="0" x2="1" y2="0">
                {geo.gradientStops.map((s, i) => (
                  <stop key={i} offset={s.offset} stopColor={s.color} />
                ))}
              </linearGradient>
            </defs>

            {/* Main flowing horizontal funnel shape */}
            {geo.pathD && (
              <path
                d={geo.pathD}
                fill="url(#funnel-h-grad)"
                opacity={0.88}
              />
            )}

            {/* Stage divider lines */}
            {stages.map((_, i) => {
              if (i === 0) return null;
              const x = geo.stageWidth * i;
              return (
                <line
                  key={i}
                  x1={x} y1={0} x2={x} y2={SVG_H}
                  stroke="currentColor"
                  strokeOpacity={0.1}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
              );
            })}

            {/* Hover column highlight */}
            {hoveredIndex !== null && (
              <rect
                x={geo.stageWidth * hoveredIndex}
                y={0}
                width={geo.stageWidth}
                height={SVG_H}
                fill="currentColor"
                opacity={0.05}
              />
            )}
          </svg>

          {/* Tooltip */}
          {hoveredIndex !== null && stages[hoveredIndex] && (
            <FunnelTooltip
              stage={stages[hoveredIndex]}
              conversion={getConversion(hoveredIndex)}
              mouseX={mousePos.x}
              mouseY={mousePos.y}
            />
          )}
        </div>
      </div>
    </div>
      </CardContent>
    </Card>
  );
}
