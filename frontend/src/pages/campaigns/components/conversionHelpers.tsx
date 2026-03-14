import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function fmt(n: number): string {
  return n.toLocaleString("pt-BR");
}

export function fmtMoney(n: number): string {
  return `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function pct(n: number): string {
  return `${n.toFixed(1)}%`;
}

export function RateBadge({ rate, good }: { rate: number; good: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] font-medium tabular-nums",
        good
          ? "text-[var(--color-success)] border-[var(--color-success)]/30"
          : "text-destructive border-destructive/30",
      )}
    >
      {pct(rate)}
    </Badge>
  );
}
