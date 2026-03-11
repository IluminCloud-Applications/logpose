import { RiCalendarLine } from "@remixicon/react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type DatePreset = "today" | "7d" | "14d" | "30d" | "90d" | "all" | "custom";

const presetLabels: Record<DatePreset, string> = {
  today: "Hoje",
  "7d": "Últimos 7 dias",
  "14d": "Últimos 14 dias",
  "30d": "Últimos 30 dias",
  "90d": "Últimos 90 dias",
  all: "Tempo inteiro",
  custom: "Personalizado",
};

interface DateFilterProps {
  preset: DatePreset;
  dateStart: string;
  dateEnd: string;
  onPresetChange: (preset: DatePreset) => void;
  onDateStartChange: (value: string) => void;
  onDateEndChange: (value: string) => void;
}

export function DateFilter({
  preset,
  dateStart,
  dateEnd,
  onPresetChange,
  onDateStartChange,
  onDateEndChange,
}: DateFilterProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <RiCalendarLine className="size-4 text-muted-foreground" />
      <Select value={preset} onValueChange={(v) => onPresetChange(v as DatePreset)}>
        <SelectTrigger className="h-9 w-[170px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(presetLabels).map(([key, label]) => (
            <SelectItem key={key} value={key}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {preset === "custom" && (
        <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-200">
          <Input
            type="date"
            value={dateStart}
            onChange={(e) => onDateStartChange(e.target.value)}
            className="h-9 w-[150px] text-xs"
          />
          <span className="text-xs text-muted-foreground">até</span>
          <Input
            type="date"
            value={dateEnd}
            onChange={(e) => onDateEndChange(e.target.value)}
            className="h-9 w-[150px] text-xs"
          />
        </div>
      )}
    </div>
  );
}
