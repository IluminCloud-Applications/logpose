import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RiAlertLine } from "@remixicon/react";
import { cn } from "@/lib/utils";

interface DeactivateConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityName: string;
  entityType: "campaign" | "adset" | "ad";
  metrics: DeactivateMetrics;
  onConfirm: () => void;
  loading?: boolean;
}

export interface DeactivateMetrics {
  spend: number;
  revenue: number;
  profit: number;
  roas: number;
  cpa: number;
  cpc: number;
  ctr: number;
  sales: number;
  clicks: number;
  impressions: number;
  budget: number;
}

const entityLabels: Record<string, string> = {
  campaign: "Campanha",
  adset: "Conjunto",
  ad: "Anúncio",
};

function fmt(v: number): string {
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export function DeactivateConfirmModal({
  open,
  onOpenChange,
  entityName,
  entityType,
  metrics,
  onConfirm,
  loading,
}: DeactivateConfirmModalProps) {
  const label = entityLabels[entityType] || "Entidade";

  const metricItems = [
    { label: "Vendas", value: String(metrics.sales), highlight: metrics.sales > 0 },
    { label: "Faturamento", value: fmt(metrics.revenue), highlight: metrics.revenue > 0 },
    { label: "Investimento", value: fmt(metrics.spend) },
    { label: "Lucro", value: fmt(metrics.profit), highlight: metrics.profit > 0, isProfit: true },
    { label: "ROAS", value: `${metrics.roas.toFixed(2)}x`, highlight: metrics.roas >= 2 },
    { label: "CPA", value: fmt(metrics.cpa) },
    { label: "Orçamento/dia", value: fmt(metrics.budget) },
    { label: "Cliques", value: metrics.clicks.toLocaleString("pt-BR") },
    { label: "Impressões", value: metrics.impressions.toLocaleString("pt-BR") },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-8 rounded-full bg-[var(--color-warning)]/10">
              <RiAlertLine className="size-4 text-[var(--color-warning)]" />
            </div>
            <DialogTitle>Desativar {label}</DialogTitle>
          </div>
          <DialogDescription
            className="line-clamp-2 break-words pt-1"
            title={entityName}
          >
            {entityName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2 py-3">
          {metricItems.map((item) => (
            <MetricCard key={item.label} {...item} />
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Ao desativar, esta {label.toLowerCase()} será pausada no Facebook Ads.
          Você pode reativá-la a qualquer momento.
        </p>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="default"
            className="bg-[var(--color-warning)] hover:bg-[var(--color-warning)]/90 text-white"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Desativando..." : `Desativar ${label}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MetricCard({
  label,
  value,
  highlight,
  isProfit,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  isProfit?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-border/50 p-2.5">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <span
        className={cn(
          "text-sm font-semibold tabular-nums",
          isProfit && parseFloat(value) < 0 && "text-destructive",
          highlight && "text-[var(--color-success)]"
        )}
      >
        {value}
      </span>
    </div>
  );
}
