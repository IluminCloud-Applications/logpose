import { useState, useEffect } from "react";
import { getStoredUser } from "@/services/auth";
import { RefreshButton } from "@/components/RefreshButton";

function getGreeting(): string {
  const now = new Date();
  const spHour = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "numeric",
    hour12: false,
  }).format(now);
  const hour = parseInt(spHour, 10);

  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

const WEEKDAY_ABBR: Record<string, string> = {
  domingo: "Dom",
  "segunda-feira": "Seg",
  "terça-feira": "Ter",
  "quarta-feira": "Qua",
  "quinta-feira": "Qui",
  "sexta-feira": "Sex",
  sábado: "Sáb",
};

function formatClock(date: Date) {
  const time = date.toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  });

  const weekdayFull = date.toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
  });

  const weekday = WEEKDAY_ABBR[weekdayFull] || weekdayFull;

  const dateStr = date.toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return { time, label: `${weekday}, ${dateStr}` };
}

interface DashboardHeaderProps {
  onRefresh: () => Promise<void>;
}

export function DashboardHeader({ onRefresh }: DashboardHeaderProps) {
  const user = getStoredUser();
  const firstName = user?.name?.split(" ")[0] || "CEO";
  const greeting = getGreeting();

  const [clock, setClock] = useState(() => formatClock(new Date()));

  useEffect(() => {
    const id = setInterval(() => setClock(formatClock(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Aqui está o resumo da sua operação
        </p>
      </div>
      <div className="flex items-center gap-3">
        <RefreshButton onRefresh={onRefresh} />
        <div className="flex flex-col items-end">
          <span className="text-3xl font-bold tracking-tight tabular-nums">
            {clock.time}
          </span>
          <span className="text-sm text-muted-foreground">
            {clock.label}
          </span>
        </div>
      </div>
    </div>
  );
}
