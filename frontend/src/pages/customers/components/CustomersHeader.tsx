import { RiGroupLine, RiSearchLine, RiFilterLine } from "@remixicon/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DateRangeFilter, type DateRangeState } from "@/components/DateRangeFilter";

interface CustomersHeaderProps {
  search: string;
  onSearchChange: (v: string) => void;
  dateRange: DateRangeState;
  onDateRangeChange: (v: DateRangeState) => void;
  onToggleFilters: () => void;
  filtersOpen: boolean;
}

export function CustomersHeader({
  search, onSearchChange,
  dateRange, onDateRangeChange,
  onToggleFilters, filtersOpen,
}: CustomersHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2.5">
          <RiGroupLine className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Todos os clientes que compraram seus produtos
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <DateRangeFilter value={dateRange} onChange={onDateRangeChange} />
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar nome, email, CPF..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 w-[240px] h-9 text-sm"
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
