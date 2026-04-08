import { useState, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { FunnelProduct } from "@/services/funnel";
import { RecoveryStageHeader } from "./RecoveryStageHeader";
import { RecoverySvg } from "./RecoverySvg";
import {
  buildRecoveryFunnelGeometry,
  RECOVERY_SVG_W,
} from "./recoveryFunnelGeometry";

interface RecoveryFunnelChartProps {
  funnel: FunnelProduct;
}

export function RecoveryFunnelChart({ funnel }: RecoveryFunnelChartProps) {
  const stages = funnel.stages;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const getConversion = useCallback(
    (index: number): number | null => {
      if (index === 0) return null;
      const base = stages[0]?.value; // Recovery always uses "Totais" as base
      return base ? (stages[index].value / base) * 100 : null;
    },
    [stages],
  );

  const geo = useMemo(
    () => buildRecoveryFunnelGeometry(stages.map((s) => s.value), stages.length),
    [stages],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const scaledX = (x / rect.width) * RECOVERY_SVG_W;
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
            <RecoveryStageHeader
              stages={stages}
              hoveredIndex={hoveredIndex}
              getConversion={getConversion}
            />
            <RecoverySvg
              stages={stages}
              geo={geo}
              hoveredIndex={hoveredIndex}
              mousePos={mousePos}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoveredIndex(null)}
              getConversion={getConversion}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
