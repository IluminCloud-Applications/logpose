/**
 * Builds the recovery funnel SVG path — same horizontal flowing shape
 * but using recovery-themed colors (green/teal gradient).
 */
export interface RecoveryFunnelGeometry {
  svgWidth: number;
  svgHeight: number;
  stageWidth: number;
  pathD: string;
  gradientStops: { offset: string; color: string }[];
  stagePoints: { cx: number; topY: number; bottomY: number }[];
}

// Recovery theme — green/teal palette (recovered = positive)
const RECOVERY_COLORS = [
  "oklch(0.72 0.14 160)",
  "oklch(0.65 0.16 155)",
  "oklch(0.58 0.17 150)",
  "oklch(0.52 0.16 145)",
  "oklch(0.46 0.14 142)",
  "oklch(0.40 0.12 140)",
  "oklch(0.36 0.10 138)",
  "oklch(0.32 0.08 136)",
];

export const RECOVERY_SVG_W = 900;
export const RECOVERY_SVG_H = 260;
const CENTER_Y = RECOVERY_SVG_H / 2;
const MAX_HALF_H = RECOVERY_SVG_H / 2 - 10;
const MIN_HALF_H = 4;

export function buildRecoveryFunnelGeometry(
  values: number[],
  stageCount: number,
): RecoveryFunnelGeometry {
  if (stageCount === 0) {
    return {
      svgWidth: RECOVERY_SVG_W,
      svgHeight: RECOVERY_SVG_H,
      stageWidth: 0,
      pathD: "",
      gradientStops: [],
      stagePoints: [],
    };
  }

  const stageWidth = RECOVERY_SVG_W / stageCount;
  const maxValue = Math.max(...values, 1);

  const stagePoints = values.map((v, i) => {
    const halfH = Math.max((v / maxValue) * MAX_HALF_H, MIN_HALF_H);
    const cx = stageWidth * i + stageWidth / 2;
    return { cx, topY: CENTER_Y - halfH, bottomY: CENTER_Y + halfH };
  });

  const topPts = stagePoints.map((p) => ({ x: p.cx, y: p.topY }));
  const botPts = stagePoints
    .map((p) => ({ x: p.cx, y: p.bottomY }))
    .reverse();

  const buildCurve = (
    pts: { x: number; y: number }[],
    startCmd: string,
  ): string => {
    let d = `${startCmd} ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const dx = (curr.x - prev.x) * 0.5;
      d += ` C ${prev.x + dx} ${prev.y}, ${curr.x - dx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
  };

  const pathD =
    buildCurve(topPts, "M") +
    ` L ${botPts[0].x} ${botPts[0].y}` +
    buildCurve(botPts, "").replace(/^[ML] \d+\.?\d* \d+\.?\d* ?/, "") +
    " Z";

  const gradientStops = Array.from({ length: stageCount }, (_, i) => ({
    offset: `${(i / Math.max(stageCount - 1, 1)) * 100}%`,
    color: RECOVERY_COLORS[i % RECOVERY_COLORS.length],
  }));

  return {
    svgWidth: RECOVERY_SVG_W,
    svgHeight: RECOVERY_SVG_H,
    stageWidth,
    pathD,
    gradientStops,
    stagePoints,
  };
}
