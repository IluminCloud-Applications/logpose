import {
  RiShoppingCartLine, RiCheckboxCircleLine, RiPercentLine,
  RiMoneyDollarBoxLine, RiCloseCircleLine,
  RiWhatsappLine, RiMailLine, RiMessage2Line,
  RiArrowGoBackLine, RiMoreLine,
} from "@remixicon/react";
import { MetricCard } from "@/components/MetricCard";
import type { RecoverySummary } from "@/services/recovery";
import { fmtCompact, fmtNumber } from "@/utils/format";

interface RecoveryKpisProps {
  summary: RecoverySummary | null;
  loading?: boolean;
}

export function RecoveryKpis({ summary, loading }: RecoveryKpisProps) {
  const total = summary?.total ?? 0;
  const recovered = summary?.recovered ?? 0;
  const recoveryRate = summary?.recovery_rate ?? 0;
  const recoveredAmount = summary?.recovered_amount ?? 0;
  const lostAmount = summary?.lost_amount ?? 0;
  const byChannel = summary?.by_channel ?? {
    whatsapp: 0, email: 0, sms: 0, back_redirect: 0, other: 0,
  };

  const mainMetrics = [
    { label: "Total", value: loading ? "—" : fmtNumber(total), icon: RiShoppingCartLine, color: "text-foreground" },
    { label: "Recuperados", value: loading ? "—" : fmtNumber(recovered), icon: RiCheckboxCircleLine, color: "text-[var(--color-success)]" },
    { label: "Taxa", value: loading ? "—" : `${recoveryRate.toFixed(1)}%`, icon: RiPercentLine, color: "text-primary" },
    { label: "Valor Recuperado", value: loading ? "—" : fmtCompact(recoveredAmount), icon: RiMoneyDollarBoxLine, color: "text-[var(--color-success)]" },
    { label: "Valor Perdido", value: loading ? "—" : fmtCompact(lostAmount), icon: RiCloseCircleLine, color: "text-destructive" },
    { label: "WhatsApp", value: loading ? "—" : fmtNumber(byChannel.whatsapp), icon: RiWhatsappLine, color: "text-[var(--color-success)]" },
    { label: "Email", value: loading ? "—" : fmtNumber(byChannel.email), icon: RiMailLine, color: "text-primary" },
    { label: "SMS", value: loading ? "—" : fmtNumber(byChannel.sms), icon: RiMessage2Line, color: "text-chart-1" },
    { label: "BackRedirect", value: loading ? "—" : fmtNumber(byChannel.back_redirect), icon: RiArrowGoBackLine, color: "text-chart-2" },
    { label: "Outro", value: loading ? "—" : fmtNumber(byChannel.other), icon: RiMoreLine, color: "text-muted-foreground" },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-5 lg:grid-cols-5">
      {mainMetrics.map((m) => (
        <MetricCard key={m.label} {...m} />
      ))}
    </div>
  );
}
