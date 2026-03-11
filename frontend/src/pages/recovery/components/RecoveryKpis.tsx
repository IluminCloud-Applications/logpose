import { Card, CardContent } from "@/components/ui/card";
import {
  RiShoppingCartLine, RiCheckboxCircleLine, RiPercentLine,
  RiMoneyDollarBoxLine, RiCloseCircleLine,
  RiWhatsappLine, RiMailLine, RiMessage2Line,
  RiArrowGoBackLine, RiMoreLine,
} from "@remixicon/react";
import type { RecoveryRow } from "@/services/recovery";
import { cn } from "@/lib/utils";

function fmt(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}

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
    { label: "Total", value: String(total), icon: RiShoppingCartLine, color: "text-foreground" },
    { label: "Recuperados", value: String(recovered.length), icon: RiCheckboxCircleLine, color: "text-[var(--color-success)]" },
    { label: "Taxa", value: `${recoveryRate.toFixed(1)}%`, icon: RiPercentLine, color: "text-primary" },
    { label: "Valor Recuperado", value: fmt(recoveredAmount), icon: RiMoneyDollarBoxLine, color: "text-[var(--color-success)]" },
    { label: "Valor Perdido", value: fmt(lostAmount), icon: RiCloseCircleLine, color: "text-destructive" },
    { label: "WhatsApp", value: String(byChannel.whatsapp), icon: RiWhatsappLine, color: "text-[var(--color-success)]" },
    { label: "Email", value: String(byChannel.email), icon: RiMailLine, color: "text-primary" },
    { label: "SMS", value: String(byChannel.sms), icon: RiMessage2Line, color: "text-chart-1" },
    { label: "BackRedirect", value: String(byChannel.back_redirect), icon: RiArrowGoBackLine, color: "text-chart-2" },
    { label: "Outro", value: String(byChannel.other), icon: RiMoreLine, color: "text-muted-foreground" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-5 lg:grid-cols-5">
      {mainMetrics.map((m) => (
        <Card key={m.label} className="border-border/40 hover:border-border/70 transition-colors">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
              <m.icon className={cn("size-4", m.color)} />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {m.label}
              </p>
              <p className="text-base font-bold tabular-nums leading-tight">{m.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
