import { RiCloseLine, RiFilterOffLine } from "@remixicon/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { CustomersFilterOptions } from "@/types/customer";
import type { CustomersFilters } from "@/hooks/use-customers";
import { defaultCustomersFilters } from "@/hooks/use-customers";

interface CustomersInlineFiltersProps {
  filters: CustomersFilters;
  onFiltersChange: (f: CustomersFilters) => void;
  onClose: () => void;
  filterOptions: CustomersFilterOptions;
}

export function CustomersInlineFilters({
  filters, onFiltersChange, onClose, filterOptions,
}: CustomersInlineFiltersProps) {
  const activeCount = [
    filters.platform !== "all",
    filters.productId !== "all",
    filters.campaign !== "all",
    !!filters.src,
  ].filter(Boolean).length;

  const clearAll = () =>
    onFiltersChange({
      ...defaultCustomersFilters,
      search: filters.search,
      dateRange: filters.dateRange,
    });

  return (
    <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Filtros de Clientes</h3>
          {activeCount > 0 && (
            <Badge className="bg-primary/15 text-primary border-transparent text-[10px] px-1.5 py-0">
              {activeCount} {activeCount === 1 ? "ativo" : "ativos"}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {activeCount > 0 && (
            <Button
              variant="ghost" size="sm" onClick={clearAll}
              className="text-xs gap-1 text-muted-foreground hover:text-destructive"
            >
              <RiFilterOffLine className="size-3.5" />
              Limpar
            </Button>
          )}
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <RiCloseLine className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Plataforma */}
        <div className="space-y-1.5">
          <Label className="text-xs">Plataforma</Label>
          <Select
            value={filters.platform}
            onValueChange={(v) => onFiltersChange({ ...filters, platform: v })}
          >
            <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {filterOptions.platforms?.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Produto */}
        <div className="space-y-1.5">
          <Label className="text-xs">Produto</Label>
          <Select
            value={filters.productId}
            onValueChange={(v) => onFiltersChange({ ...filters, productId: v })}
          >
            <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {filterOptions.products.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Campanha (utm_campaign) */}
        <div className="space-y-1.5">
          <Label className="text-xs">Campanha</Label>
          <Select
            value={filters.campaign}
            onValueChange={(v) => onFiltersChange({ ...filters, campaign: v })}
          >
            <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {filterOptions.campaigns?.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* SRC */}
        <div className="space-y-1.5">
          <Label className="text-xs">SRC</Label>
          <Input
            placeholder="Digitar src..."
            value={filters.src}
            onChange={(e) => onFiltersChange({ ...filters, src: e.target.value })}
            className="h-9 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
