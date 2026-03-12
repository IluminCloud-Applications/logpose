import { useState } from "react";
import { RiCloseLine, RiArrowDownSLine } from "@remixicon/react";
import { Badge } from "@/components/ui/badge";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DropdownOptionsList } from "./DropdownOptionsList";
import { DateFilterBadge } from "./DateFilterBadge";

export interface QuickFilterOption {
  value: string;
  label: string;
}

export interface QuickFilter {
  key: string;
  label: string;
  value: string;
  isActive: boolean;
  options: QuickFilterOption[];
  /** Value that means "reset/no filter". Defaults to "all" */
  defaultValue?: string;
  /** Extra data for specialized badges (e.g. startDate/endDate) */
  extra?: Record<string, string>;
}

interface QuickFiltersBadgesProps {
  filters: QuickFilter[];
  onChange: (key: string, value: string) => void;
}

export function QuickFiltersBadges({ filters, onChange }: QuickFiltersBadgesProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
      {filters.map((f) =>
        f.key === "dateRange" ? (
          <DateFilterBadge key={f.key} filter={f} onChange={onChange} />
        ) : (
          <DropdownBadge key={f.key} filter={f} onChange={onChange} />
        )
      )}
    </div>
  );
}

/**
 * Badge que exibe um label/valor e abre um dropdown com opções ao clicar.
 * Quando ativo: fica colorido com "x" para limpar o filtro.
 */
function DropdownBadge({
  filter,
  onChange,
}: {
  filter: QuickFilter;
  onChange: (key: string, value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasOptions = filter.options.length > 0;

  const resetValue = filter.defaultValue ?? "all";
  const selectedOption = filter.options.find((o) => o.value === filter.value);
  const isActive = filter.isActive;
  const canClear = filter.value !== resetValue;
  const displayLabel = isActive && selectedOption ? selectedOption.label : filter.label;

  const handleSelect = (value: string) => {
    onChange(filter.key, value);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(filter.key, resetValue);
    setOpen(false);
  };

  // Badges sem options (removable only — ex: value filters)
  if (!hasOptions) {
    return (
      <Badge
        variant="secondary"
        className={cn(
          "gap-1.5 pr-1 py-1 px-2.5 text-xs font-medium cursor-default transition-all",
          isActive && "bg-primary/15 text-primary border-primary/30 hover:bg-primary/20"
        )}
      >
        {filter.label}
        <button
          onClick={() => onChange(filter.key, resetValue)}
          className="ml-0.5 rounded-full p-0.5 hover:bg-destructive/15 hover:text-destructive transition-colors"
        >
          <RiCloseLine className="size-3" />
        </button>
      </Badge>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-auto min-w-[140px] p-1"
      >
        <DropdownOptionsList
          options={filter.options}
          currentValue={filter.value}
          resetValue={resetValue}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
