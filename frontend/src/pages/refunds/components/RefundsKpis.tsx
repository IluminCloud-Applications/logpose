import {
  RiRefundLine, RiAlarmWarningLine, RiPercentLine,
  RiQuestionLine, RiCheckboxCircleLine,
} from "@remixicon/react";
import { MetricCard } from "@/components/MetricCard";
import type { RefundsSummary } from "@/services/refunds";
import { fmtCompact } from "@/utils/format";

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
      value: summary ? fmtCompact(summary.refund_amount) : "R$ 0",
      icon: RiRefundLine,
      color: "text-amber-500",
    },
    {
      label: "Chargebacks",
      value: summary ? String(summary.chargebacks) : "0",
      sub: summary ? fmtCompact(summary.chargeback_amount) : "",
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
        <MetricCard key={kpi.label} {...kpi} loading={loading} />
      ))}
    </div>
  );
}
