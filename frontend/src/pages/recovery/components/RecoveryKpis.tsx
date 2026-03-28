import {
  RiShoppingCartLine, RiCheckboxCircleLine, RiPercentLine,
  RiMoneyDollarBoxLine, RiCloseCircleLine,
  RiWhatsappLine, RiMailLine, RiMessage2Line,
  RiArrowGoBackLine, RiMoreLine,
} from "@remixicon/react";
import { MetricCard } from "@/components/MetricCard";
import type { RecoveryRow } from "@/services/recovery";
import { fmtCompact, fmtNumber } from "@/utils/format";

interface RecoveryKpisProps {
  data: RecoveryRow[];
}

export function RecoveryKpis({ data }: RecoveryKpisProps) {
  const total = data.length;
  const recovered = data.filter((r) => r.recovered);
  
  const recoveryRate = total > 0 ? ((recovered.length / total) * 100) : 0;
  const recoveredAmount = recovered.reduce((s, r) => s + r.amount, 0);
  const lostAmount = data.filter((r) => !r.recovered).reduce((s, r) => s + r.amount, 0);
  const byChannel = {
    whatsapp: recovered.filter((r) => r.channel === "whatsapp").length,
    email: recovered.filter((r) => r.channel === "email").length,
    sms: recovered.filter((r) => r.channel === "sms").length,
    back_redirect: recovered.filter((r) => r.channel === "back_redirect").length,
    other: recovered.filter((r) => r.channel === "other").length,
  };

  const mainMetrics = [
    { label: "Total", value: fmtNumber(total), icon: RiShoppingCartLine, color: "text-foreground" },
    { label: "Recuperados", value: fmtNumber(recovered.length), icon: RiCheckboxCircleLine, color: "text-[var(--color-success)]" },
    { label: "Taxa", value: `${recoveryRate.toFixed(1)}%`, icon: RiPercentLine, color: "text-primary" },
    { label: "Valor Recuperado", value: fmtCompact(recoveredAmount), icon: RiMoneyDollarBoxLine, color: "text-[var(--color-success)]" },
    { label: "Valor Perdido", value: fmtCompact(lostAmount), icon: RiCloseCircleLine, color: "text-destructive" },
    { label: "WhatsApp", value: fmtNumber(byChannel.whatsapp), icon: RiWhatsappLine, color: "text-[var(--color-success)]" },
    { label: "Email", value: fmtNumber(byChannel.email), icon: RiMailLine, color: "text-primary" },
    { label: "SMS", value: fmtNumber(byChannel.sms), icon: RiMessage2Line, color: "text-chart-1" },
    { label: "BackRedirect", value: fmtNumber(byChannel.back_redirect), icon: RiArrowGoBackLine, color: "text-chart-2" },
    { label: "Outro", value: fmtNumber(byChannel.other), icon: RiMoreLine, color: "text-muted-foreground" },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-5 lg:grid-cols-5">
      {mainMetrics.map((m) => (
        <MetricCard key={m.label} {...m} />
      ))}
    </div>
  );
}
