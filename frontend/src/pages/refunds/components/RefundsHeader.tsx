import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RiSearch2Line, RiFilterLine, RiRefundLine } from "@remixicon/react";
import { DateRangeFilter, type DateRangeState } from "@/components/DateRangeFilter";
import { cn } from "@/lib/utils";

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
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2.5">
          <RiRefundLine className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reembolsos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie reembolsos e chargebacks. Registre motivos para insights.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <DateRangeFilter value={dateRange} onChange={onDateRangeChange} />
        <div className="relative">
          <RiSearch2Line className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 w-full sm:w-[200px] h-9 text-sm"
          />
        </div>
        <Button
          variant={filtersOpen ? "default" : "outline"}
          onClick={onToggleFilters}
          className={cn("gap-1.5 h-9", filtersOpen && "shadow-sm")}
        >
          <RiFilterLine className="size-4" />
          Filtros
        </Button>
      </div>
    </div>
  );
}
