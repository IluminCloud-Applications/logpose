import { RiCloseLine } from "@remixicon/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface QuickFilter {
  key: string;
  label: string;
  value: string;
  isActive: boolean;
  /** If options exist, clicking cycles/shows inline options */
  options: { value: string; label: string }[];
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
        f.options.length > 0 ? (
          <InlineFilterBadge key={f.key} filter={f} onChange={onChange} />
        ) : (
          <RemovableBadge key={f.key} filter={f} onRemove={() => onChange(f.key, "all")} />
        )
      )}
    </div>
  );
}

/** Badge with inline clickable options (Status, Objetivos, etc.) */
function InlineFilterBadge({
  filter,
  onChange,
}: {
  filter: QuickFilter;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/30 px-0.5 py-0.5">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-2 pr-1">
        {filter.label}
      </span>
      {filter.options.map((opt) => {
        const isSelected = filter.value === opt.value;
        const isAll = opt.value === "all";
        // Don't show "Todos" as a pill — it's the default when nothing is selected
        if (isAll) return null;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(filter.key, isSelected ? "all" : opt.value)}
            className={cn(
              "text-xs px-2 py-1 rounded-md font-medium transition-all duration-150",
              isSelected
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Simple badge with X to remove */
function RemovableBadge({
  filter,
  onRemove,
}: {
  filter: QuickFilter;
  onRemove: () => void;
}) {
  return (
    <Badge variant="secondary" className="gap-1 pr-1 text-xs font-medium cursor-default">
      {filter.label}
      <button
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 hover:bg-destructive/15 hover:text-destructive transition-colors"
      >
        <RiCloseLine className="size-3" />
      </button>
    </Badge>
  );
}
