import { createPortal } from "react-dom";
import type { FunnelStage } from "@/services/funnel";

interface FunnelTooltipProps {
  stage: FunnelStage;
  conversion: number | null;
  mouseX: number;
  mouseY: number;
}

function formatMetricValue(key: string, val: number): string {
  if (key === "spend") {
    return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
  if (key === "ctr" || key === "cpm" || key === "cpc") {
    if (key === "ctr") return `${val.toFixed(2)}%`;
    return val.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  }
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
  return val.toLocaleString("pt-BR");
}

const META_LABELS: Record<string, string> = {
  impressions: "Impressões",
  ctr: "CTR Médio",
  cpm: "CPM Médio",
  cpc: "CPC Médio",
  spend: "Investido",
};

export function FunnelTooltip({ stage, conversion, mouseX, mouseY }: FunnelTooltipProps) {
  const meta = stage.meta;
  const hasExtra = meta && Object.keys(meta).length > 0;
  const hasRevenue = stage.revenue != null && stage.revenue > 0;

  if (!hasExtra && !hasRevenue && conversion === null) return null;

  const content = (
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{
        left: mouseX + 16,
        top: mouseY - 12,
      }}
    >
      <div className="bg-popover border border-border/60 rounded-lg shadow-xl px-4 py-3 min-w-[200px] max-w-[280px]">
        <p className="text-sm font-semibold text-foreground mb-2">
          {stage.name}
        </p>

        <div className="space-y-1.5">
          {/* Value */}
          <TooltipRow
            label="Total"
            value={formatMetricValue("impressions", stage.value)}
          />

          {/* Revenue */}
          {hasRevenue && (
            <TooltipRow
              label="Faturamento"
              value={formatMetricValue("spend", stage.revenue!)}
              highlight
            />
          )}

          {/* Conversion */}
          {conversion !== null && (
            <TooltipRow
              label="Conversão"
              value={`${conversion.toFixed(2)}%`}
              color={
                conversion >= 50
                  ? "text-success"
                  : conversion >= 20
                    ? "text-warning"
                    : "text-destructive"
              }
            />
          )}

          {/* Extra meta data */}
          {hasExtra && (
            <>
              <div className="border-t border-border/40 my-1.5" />
              {Object.entries(meta!).map(([key, val]) => (
                <TooltipRow
                  key={key}
                  label={META_LABELS[key] || key}
                  value={formatMetricValue(key, val)}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

function TooltipRow({
  label,
  value,
  color,
  highlight,
}: {
  label: string;
  value: string;
  color?: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={`text-xs font-semibold tabular-nums ${
          color || (highlight ? "text-primary" : "text-foreground")
        }`}
      >
        {value}
      </span>
    </div>
  );
}
