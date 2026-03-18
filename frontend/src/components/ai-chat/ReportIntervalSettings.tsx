import { useState } from "react";
import { RiSettings3Line } from "@remixicon/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const INTERVAL_KEY = "logpose-report-interval";
const DEFAULT_INTERVAL = 60; // minutes

export function getReportIntervalMs(): number {
  try {
    const val = localStorage.getItem(INTERVAL_KEY);
    const min = val ? parseInt(val, 10) : DEFAULT_INTERVAL;
    return (min > 0 ? min : DEFAULT_INTERVAL) * 60 * 1000;
  } catch {
    return DEFAULT_INTERVAL * 60 * 1000;
  }
}

export function getReportIntervalMinutes(): number {
  try {
    const val = localStorage.getItem(INTERVAL_KEY);
    const min = val ? parseInt(val, 10) : DEFAULT_INTERVAL;
    return min > 0 ? min : DEFAULT_INTERVAL;
  } catch {
    return DEFAULT_INTERVAL;
  }
}

interface ReportIntervalSettingsProps {
  onIntervalChange?: (minutes: number) => void;
}

export function ReportIntervalSettings({ onIntervalChange }: ReportIntervalSettingsProps) {
  const [open, setOpen] = useState(false);
  const [minutes, setMinutes] = useState(() => String(getReportIntervalMinutes()));

  const handleSave = () => {
    const parsed = parseInt(minutes, 10);
    const value = parsed > 0 ? parsed : DEFAULT_INTERVAL;
    localStorage.setItem(INTERVAL_KEY, String(value));
    setMinutes(String(value));
    onIntervalChange?.(value);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          title="Configurações do relatório"
        >
          <RiSettings3Line className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[240px] p-4 space-y-3">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Relatório automático
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Intervalo entre os relatórios do dia
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="report-interval" className="text-xs">
            Intervalo (minutos)
          </Label>
          <Input
            id="report-interval"
            type="number"
            min={1}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="h-8 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
          />
        </div>
        <Button size="sm" onClick={handleSave} className="w-full h-8 text-xs">
          Salvar
        </Button>
      </PopoverContent>
    </Popover>
  );
}
