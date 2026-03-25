import { RiShoppingCartLine, RiSearchLine, RiFilterLine, RiSettings3Line } from "@remixicon/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DateRangeFilter, type DateRangeState } from "@/components/DateRangeFilter";

interface RecoveryHeaderProps {
  search: string;
  onSearchChange: (v: string) => void;
  dateRange: DateRangeState;
  onDateRangeChange: (v: DateRangeState) => void;
  onToggleFilters: () => void;
  filtersOpen: boolean;
  onOpenConfig: () => void;
}

export function RecoveryHeader({
  search, onSearchChange,
  dateRange, onDateRangeChange,
  onToggleFilters, filtersOpen,
  onOpenConfig,
}: RecoveryHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2.5">
          <RiShoppingCartLine className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recuperação</h1>
          <p className="text-sm text-muted-foreground">
            Carrinhos abandonados, cartões recusados e PIX não pagos
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <DateRangeFilter value={dateRange} onChange={onDateRangeChange} />
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
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
        <Button
          variant="outline"
          size="icon"
          className="size-9"
          onClick={onOpenConfig}
          title="Configurar canais de recuperação"
        >
          <RiSettings3Line className="size-4" />
        </Button>
      </div>
    </div>
  );
}
