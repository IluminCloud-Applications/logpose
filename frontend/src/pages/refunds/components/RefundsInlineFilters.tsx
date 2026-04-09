import { RiCloseLine, RiFilterOffLine } from "@remixicon/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { SalesFilterOptions } from "@/types/sale";
import type { RefundsFilters } from "@/hooks/useRefunds";
import { defaultRefundsFilters } from "@/hooks/useRefunds";

interface RefundsInlineFiltersProps {
  filters: RefundsFilters;
  onFiltersChange: (f: RefundsFilters) => void;
  onClose: () => void;
  filterOptions: SalesFilterOptions;
}

const platformLabels: Record<string, string> = { kiwify: "Kiwify", payt: "PayT", api: "API" };

export function RefundsInlineFilters({
  filters, onFiltersChange, onClose, filterOptions,
}: RefundsInlineFiltersProps) {
  const activeCount = [
    filters.status !== "all",
    filters.platform !== "all",
    filters.productId !== "all",
    filters.hasReason !== "all",
    filters.accountSlug !== "all",
  ].filter(Boolean).length;

  const clearAll = () =>
    onFiltersChange({
      ...defaultRefundsFilters,
      search: filters.search,
      dateRange: filters.dateRange,
    });

  return (
    <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Filtros de Reembolsos</h3>
          {activeCount > 0 && (
            <Badge className="bg-primary/15 text-primary border-transparent text-[10px] px-1.5 py-0">
              {activeCount} {activeCount === 1 ? "ativo" : "ativos"}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {activeCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs gap-1 text-muted-foreground hover:text-destructive">
              <RiFilterOffLine className="size-3.5" />
              Limpar
            </Button>
          )}
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <RiCloseLine className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Tipo */}
        <div className="space-y-1.5">
          <Label className="text-xs">Tipo</Label>
          <Select value={filters.status} onValueChange={(v) => onFiltersChange({ ...filters, status: v })}>
            <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="refunded">Reembolso</SelectItem>
              <SelectItem value="chargeback">Chargeback</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Plataforma */}
        <div className="space-y-1.5">
          <Label className="text-xs">Plataforma</Label>
          <Select value={filters.platform} onValueChange={(v) => onFiltersChange({ ...filters, platform: v })}>
            <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {filterOptions.platforms?.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Conta */}
        <div className="space-y-1.5">
          <Label className="text-xs">Conta</Label>
          <Select value={filters.accountSlug} onValueChange={(v) => onFiltersChange({ ...filters, accountSlug: v })}>
            <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as contas</SelectItem>
              {filterOptions.accounts?.map((a) => (
                <SelectItem key={a.slug} value={a.slug}>
                  {a.name} ({platformLabels[a.platform] || a.platform})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Produto */}
        <div className="space-y-1.5">
          <Label className="text-xs">Produto</Label>
          <Select value={filters.productId} onValueChange={(v) => onFiltersChange({ ...filters, productId: v })}>
            <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {filterOptions.products.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Motivo registrado */}
        <div className="space-y-1.5">
          <Label className="text-xs">Motivo registrado</Label>
          <Select value={filters.hasReason} onValueChange={(v) => onFiltersChange({ ...filters, hasReason: v })}>
            <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="yes">Com motivo</SelectItem>
              <SelectItem value="no">Sem motivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
