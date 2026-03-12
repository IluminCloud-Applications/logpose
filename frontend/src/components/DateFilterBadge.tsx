import { useState } from "react";
import { RiCloseLine, RiArrowDownSLine, RiCalendarLine } from "@remixicon/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { QuickFilter } from "./QuickFiltersBadges";

/** Today in YYYY-MM-DD using local timezone (not UTC — avoids wrong date after 21h in BR) */
function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const datePresets = [
  { value: "today", label: "Hoje" },
  { value: "yesterday", label: "Ontem" },
  { value: "3d", label: "3 dias" },
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
  { value: "all", label: "Máximo" },
];

interface DateFilterBadgeProps {
  filter: QuickFilter;
  onChange: (key: string, value: string) => void;
}

export function DateFilterBadge({ filter, onChange }: DateFilterBadgeProps) {
  const [open, setOpen] = useState(false);
  const [customStart, setCustomStart] = useState(filter.extra?.startDate ?? "");
  const [customEnd, setCustomEnd] = useState(filter.extra?.endDate ?? "");
  const [showCustom, setShowCustom] = useState(filter.value === "custom");
  const todayStr = getTodayStr();

  const isActive = filter.isActive;
  const canClear = filter.value !== "today";
  const displayLabel = filter.extra?.displayLabel
    ?? datePresets.find((p) => p.value === filter.value)?.label
    ?? filter.label;

  const handlePreset = (preset: string) => {
    if (preset === filter.value && preset !== "custom") {
      onChange(filter.key, "today");
    } else {
      onChange(filter.key, preset);
    }
    setShowCustom(false);
    setOpen(false);
  };

  const handleCustomToggle = () => {
    setShowCustom(true);
    setCustomStart(filter.extra?.startDate ?? "");
    setCustomEnd(filter.extra?.endDate ?? "");
  };

  const handleApplyCustom = () => {
    if (!customStart || !customEnd) return;
    onChange(filter.key, `custom|${customStart}|${customEnd}`);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(filter.key, "today");
    setShowCustom(false);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setShowCustom(filter.value === "custom"); }}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-all duration-150",
            "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            isActive
              ? "bg-primary/15 text-primary border-primary/30 hover:bg-primary/20"
              : "bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted/70 hover:text-foreground"
          )}
        >
          <RiCalendarLine className="size-3.5" />
          {displayLabel}
          {canClear ? (
            <span
              role="button"
              onClick={handleClear}
              className="rounded-full p-0.5 hover:bg-destructive/15 hover:text-destructive transition-colors"
            >
              <RiCloseLine className="size-3" />
            </span>
          ) : (
            <RiArrowDownSLine className={cn(
              "size-3.5 transition-transform duration-150",
              open && "rotate-180"
            )} />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={4} className="w-[220px] p-1">
        <div className="space-y-0.5">
          {datePresets.map((p) => {
            const isSelected = filter.value === p.value;
            return (
              <button
                key={p.value}
                onClick={() => handlePreset(p.value)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs transition-colors",
                  isSelected ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"
                )}
              >
                <span className={cn("size-1.5 rounded-full shrink-0", isSelected ? "bg-primary" : "bg-transparent")} />
                {p.label}
              </button>
            );
          })}

          <div className="border-t border-border/40 my-1" />

          <button
            onClick={handleCustomToggle}
            className={cn(
              "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs transition-colors",
              filter.value === "custom"
                ? "bg-primary/10 text-primary font-medium"
                : "text-foreground hover:bg-muted"
            )}
          >
            <span className={cn("size-1.5 rounded-full shrink-0", filter.value === "custom" ? "bg-primary" : "bg-transparent")} />
            Personalizado
          </button>
        </div>

        {showCustom && (
          <div className="border-t border-border/40 mt-1 pt-2 px-1 pb-1 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Início</label>
                <Input
                  type="date"
                  lang="pt-BR"
                  value={customStart}
                  max={customEnd || todayStr}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Fim</label>
                <Input
                  type="date"
                  lang="pt-BR"
                  value={customEnd}
                  min={customStart}
                  max={todayStr}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <Button
              size="sm"
              className="w-full h-8 text-xs"
              onClick={handleApplyCustom}
              disabled={!customStart || !customEnd}
            >
              Aplicar
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
