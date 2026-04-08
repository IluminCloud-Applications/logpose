import type { FunnelProduct } from "@/services/funnel";
import { FunnelTooltip } from "./FunnelTooltip";
import {
  type RecoveryFunnelGeometry,
  RECOVERY_SVG_W,
  RECOVERY_SVG_H,
} from "./recoveryFunnelGeometry";

interface RecoverySvgProps {
  stages: FunnelProduct["stages"];
  geo: RecoveryFunnelGeometry;
  hoveredIndex: number | null;
  mousePos: { x: number; y: number };
  onMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void;
  onMouseLeave: () => void;
  getConversion: (i: number) => number | null;
}

export function RecoverySvg({
  stages, geo, hoveredIndex, mousePos,
  onMouseMove, onMouseLeave, getConversion,
}: RecoverySvgProps) {
  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${RECOVERY_SVG_W} ${RECOVERY_SVG_H}`}
        className="w-full h-auto"
        preserveAspectRatio="none"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        <defs>
          <linearGradient id="recovery-h-grad" x1="0" y1="0" x2="1" y2="0">
            {geo.gradientStops.map((s, i) => (
              <stop key={i} offset={s.offset} stopColor={s.color} />
            ))}
          </linearGradient>
        </defs>

        {geo.pathD && (
          <path d={geo.pathD} fill="url(#recovery-h-grad)" opacity={0.88} />
        )}

        {stages.map((_, i) => {
          if (i === 0) return null;
          const x = geo.stageWidth * i;
          return (
            <line
              key={i}
              x1={x} y1={0} x2={x} y2={RECOVERY_SVG_H}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          );
        })}

        {hoveredIndex !== null && (
          <rect
            x={geo.stageWidth * hoveredIndex}
            y={0}
            width={geo.stageWidth}
            height={RECOVERY_SVG_H}
            fill="currentColor"
            opacity={0.05}
          />
        )}
      </svg>

      {hoveredIndex !== null && stages[hoveredIndex] && (
        <FunnelTooltip
          stage={stages[hoveredIndex]}
          conversion={getConversion(hoveredIndex)}
          mouseX={mousePos.x}
          mouseY={mousePos.y}
        />
      )}
    </div>
  );
}
