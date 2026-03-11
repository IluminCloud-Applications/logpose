import { RiGroupLine, RiSearchLine } from "@remixicon/react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import type { CustomersFilters } from "@/hooks/use-customers";
import type { CustomersFilterOptions } from "@/types/customer";

interface CustomersHeaderProps {
  filters: CustomersFilters;
  onFiltersChange: (filters: CustomersFilters) => void;
  filterOptions: CustomersFilterOptions;
}

export function CustomersHeader({ filters, onFiltersChange, filterOptions }: CustomersHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Title row */}
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
        <DateRangeFilter
          value={filters.dateRange}
          onChange={(v) => onFiltersChange({ ...filters, dateRange: v })}
        />
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar nome, email, CPF..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-9 w-[240px] h-9 text-sm"
          />
        </div>
        <Select
          value={filters.platform}
          onValueChange={(v) => onFiltersChange({ ...filters, platform: v })}
        >
          <SelectTrigger className="h-9 w-[120px] text-sm">
            <SelectValue placeholder="Plataforma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {filterOptions.platforms?.map((p) => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.productId}
          onValueChange={(v) => onFiltersChange({ ...filters, productId: v })}
        >
          <SelectTrigger className="h-9 w-[180px] text-sm">
            <SelectValue placeholder="Produto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {filterOptions.products.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
