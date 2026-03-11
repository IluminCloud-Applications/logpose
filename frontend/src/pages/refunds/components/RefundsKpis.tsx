import { Card, CardContent } from "@/components/ui/card";
import {
  RiRefundLine, RiAlarmWarningLine, RiPercentLine,
  RiQuestionLine, RiCheckboxCircleLine,
} from "@remixicon/react";
import { Skeleton } from "@/components/ui/skeleton";
import type { RefundsSummary } from "@/services/refunds";

function fmt(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}

interface RefundsKpisProps {
  summary: RefundsSummary | undefined;
  loading: boolean;
}

export function RefundsKpis({ summary, loading }: RefundsKpisProps) {
  const kpis = [
    {
      label: "Total Reembolsos",
      value: summary ? String(summary.total_refunds) : "0",
      icon: RiRefundLine,
      color: "text-orange-500",
    },
    {
      label: "Valor Reembolsos",
      value: summary ? fmt(summary.refund_amount) : "R$ 0",
      icon: RiRefundLine,
      color: "text-amber-500",
    },
    {
      label: "Chargebacks",
      value: summary ? String(summary.chargebacks) : "0",
      sub: summary ? fmt(summary.chargeback_amount) : "",
      icon: RiAlarmWarningLine,
      color: "text-destructive",
    },
    {
      label: "Taxa de Reembolso",
      value: summary ? `${summary.refund_rate}%` : "0%",
      icon: RiPercentLine,
      color: "text-blue-500",
    },
    {
      label: "Com Motivo",
      value: summary ? String(summary.with_reason) : "0",
      icon: RiCheckboxCircleLine,
      color: "text-[var(--color-success)]",
    },
    {
      label: "Sem Motivo",
      value: summary ? String(summary.without_reason) : "0",
      icon: RiQuestionLine,
      color: "text-muted-foreground",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="border-border/40">
          <CardContent className="p-4">
            {loading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-muted/50 ${kpi.color}`}>
                  <kpi.icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                    {kpi.label}
                  </p>
                  <p className="text-lg font-bold tabular-nums leading-tight">{kpi.value}</p>
                  {"sub" in kpi && kpi.sub && (
                    <p className="text-[11px] text-muted-foreground tabular-nums">{kpi.sub}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
