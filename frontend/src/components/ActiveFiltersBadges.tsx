import { RiCloseLine } from "@remixicon/react";
import { Badge } from "@/components/ui/badge";

export interface ActiveFilter {
  key: string;
  label: string;
}

interface ActiveFiltersBadgesProps {
  filters: ActiveFilter[];
  onRemove: (key: string) => void;
}

export function ActiveFiltersBadges({ filters, onRemove }: ActiveFiltersBadgesProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
      <span className="text-xs text-muted-foreground font-medium">Filtros ativos:</span>
      {filters.map((f) => (
        <Badge
          key={f.key}
          variant="secondary"
          className="gap-1 pr-1 text-xs font-medium cursor-default"
        >
          {f.label}
          <button
            onClick={() => onRemove(f.key)}
            className="ml-0.5 rounded-full p-0.5 hover:bg-destructive/15 hover:text-destructive transition-colors"
          >
            <RiCloseLine className="size-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}
