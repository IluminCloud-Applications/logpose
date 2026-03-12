import { useState } from "react";
import { RiCalendarLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type DatePreset = "today" | "yesterday" | "3d" | "7d" | "30d" | "90d" | "all" | "custom";

export interface DateRangeState {
  preset: DatePreset;
  startDate: string;
  endDate: string;
}

export const defaultDateRange: DateRangeState = {
  preset: "today",
  startDate: "",
  endDate: "",
};

const presetLabels: Record<DatePreset, string> = {
  today: "Hoje",
  yesterday: "Ontem",
  "3d": "Últimos 3 dias",
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
  "90d": "Últimos 90 dias",
  all: "Todo período",
  custom: "Personalizado",
};

export function getDateRangeLabel(state: DateRangeState): string {
  if (state.preset === "custom" && state.startDate && state.endDate) {
    const start = new Date(state.startDate).toLocaleDateString("pt-BR");
    const end = new Date(state.endDate).toLocaleDateString("pt-BR");
    return `${start} — ${end}`;
  }
  return presetLabels[state.preset];
}

interface DateRangeFilterProps {
  value: DateRangeState;
  onChange: (value: DateRangeState) => void;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);

  const handlePresetChange = (preset: string) => {
    const p = preset as DatePreset;
    if (p === "custom") {
      onChange({ ...value, preset: p });
    } else {
      onChange({ preset: p, startDate: "", endDate: "" });
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-9 gap-1.5 text-xs font-medium px-3"
        >
          <RiCalendarLine className="size-3.5" />
          {getDateRangeLabel(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-3 space-y-3" align="end">
        <div className="space-y-1.5">
          <Label className="text-xs">Período</Label>
          <Select value={value.preset} onValueChange={handlePresetChange}>
            <SelectTrigger className="h-9 w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(presetLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {value.preset === "custom" && (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Início
              </Label>
              <Input
                type="date"
                value={value.startDate}
                onChange={(e) => onChange({ ...value, startDate: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Fim
              </Label>
              <Input
                type="date"
                value={value.endDate}
                onChange={(e) => onChange({ ...value, endDate: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
