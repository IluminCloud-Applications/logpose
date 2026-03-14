import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RiCalendarLine } from "@remixicon/react";

interface DateTimePickerProps {
  /** ISO date string (timezone-aware) */
  value: string;
  onChange: (isoString: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const parsed = React.useMemo(() => {
    if (!value) return { date: undefined as Date | undefined, hh: "00", mm: "00" };
    const d = new Date(value);
    if (isNaN(d.getTime())) return { date: undefined as Date | undefined, hh: "00", mm: "00" };
    return {
      date: d,
      hh: String(d.getHours()).padStart(2, "0"),
      mm: String(d.getMinutes()).padStart(2, "0"),
    };
  }, [value]);

  const [calendarOpen, setCalendarOpen] = React.useState(false);

  const buildISO = React.useCallback(
    (date: Date | undefined, hh: string, mm: string) => {
      if (!date) return "";
      const d = new Date(date);
      d.setHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0);
      return d.toISOString();
    },
    []
  );

  const handleDateSelect = (selected: Date | undefined) => {
    if (!selected) return;
    onChange(buildISO(selected, parsed.hh, parsed.mm));
    setCalendarOpen(false);
  };

  const handleHourChange = (hh: string) => {
    onChange(buildISO(parsed.date ?? new Date(), hh, parsed.mm));
  };

  const handleMinuteChange = (mm: string) => {
    onChange(buildISO(parsed.date ?? new Date(), parsed.hh, mm));
  };

  const dateLabel = parsed.date
    ? format(parsed.date, "dd/MM/yyyy", { locale: ptBR })
    : "Selecionar data";

  return (
    <div className="flex items-end gap-3">
      {/* Date Picker */}
      <div className="flex-1 space-y-1">
        <span className="text-xs text-muted-foreground">Data</span>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between font-normal"
            >
              {dateLabel}
              <RiCalendarLine className="size-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={parsed.date}
              captionLayout="dropdown"
              defaultMonth={parsed.date}
              onSelect={handleDateSelect}
              disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
              fromDate={new Date(new Date().setHours(0, 0, 0, 0))}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Hour Select */}
      <div className="space-y-1">
        <span className="text-xs text-muted-foreground">Hora</span>
        <Select value={parsed.hh} onValueChange={handleHourChange}>
          <SelectTrigger className="w-[70px] font-mono">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[280px]">
            {HOURS.map((h) => (
              <SelectItem key={h} value={h}>{h}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <span className="pb-2 text-muted-foreground font-mono">:</span>

      {/* Minute Select */}
      <div className="space-y-1">
        <span className="text-xs text-muted-foreground">Min</span>
        <Select value={parsed.mm} onValueChange={handleMinuteChange}>
          <SelectTrigger className="w-[70px] font-mono">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[280px]">
            {MINUTES.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
