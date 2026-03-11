import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RiSearch2Line, RiFilterLine } from "@remixicon/react";
import { DateRangeFilter, type DateRangeState } from "@/components/DateRangeFilter";

interface RefundsHeaderProps {
  search: string;
  onSearchChange: (v: string) => void;
  onToggleFilters: () => void;
  filtersOpen: boolean;
  dateRange: DateRangeState;
  onDateRangeChange: (v: DateRangeState) => void;
}

export function RefundsHeader({
  search, onSearchChange, onToggleFilters, filtersOpen,
  dateRange, onDateRangeChange,
}: RefundsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reembolsos</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie reembolsos e chargebacks. Registre motivos para insights.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <DateRangeFilter value={dateRange} onChange={onDateRangeChange} />
        <div className="relative">
          <RiSearch2Line className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 w-[200px] h-9"
          />
        </div>
        <Button
          variant={filtersOpen ? "default" : "outline"}
          size="sm"
          onClick={onToggleFilters}
        >
          <RiFilterLine className="size-4 mr-1.5" />
          Filtros
        </Button>
      </div>
    </div>
  );
}
