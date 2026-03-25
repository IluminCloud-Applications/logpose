import { RiCloseLine, RiFilterOffLine } from "@remixicon/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ValueFiltersSection, type ValueFilter } from "@/components/ValueFiltersSection";
import type { DateRangeState } from "@/components/DateRangeFilter";
import { defaultDateRange } from "@/components/DateRangeFilter";

export interface CampaignFilterState {
  status: string;
  objective: string;
  bidStrategy: string;
  budgetType: string;
  account: string;
  product: string;
  video: string;
  checkout: string;
  tag: string;
  dateRange: DateRangeState;
  valueFilters: ValueFilter[];
}

export { type ValueFilter };

const metricOptions = [
  { value: "spend", label: "Gasto" },
  { value: "revenue", label: "Faturamento" },
  { value: "profit", label: "Lucro" },
  { value: "roas", label: "ROAS" },
  { value: "cpa", label: "CPA" },
  { value: "sales", label: "Vendas" },
];

interface CampaignsInlineFiltersProps {
  filters: CampaignFilterState;
  onFiltersChange: (filters: CampaignFilterState) => void;
  onClose: () => void;
  availableTags?: string[];
  availableProducts?: { id: number; name: string }[];
}

export function CampaignsInlineFilters({
  filters, onFiltersChange, onClose,
  availableTags = [], availableProducts = [],
}: CampaignsInlineFiltersProps) {
  const activeCount = [
    filters.status !== "all",
    filters.objective !== "all",
    filters.product !== "all",
    filters.tag !== "all",
    filters.dateRange.preset !== "today",
    ...filters.valueFilters.map((vf) => vf.value !== ""),
  ].filter(Boolean).length;

  const clearAllFilters = () => onFiltersChange(defaultCampaignFilters);

  const addVf = () => {
    onFiltersChange({
      ...filters,
      valueFilters: [...filters.valueFilters, { id: crypto.randomUUID().slice(0, 8), metric: "spend", operator: "gte", value: "" }],
    });
  };

  const updateVf = (id: string, field: keyof ValueFilter, value: string) => {
    onFiltersChange({ ...filters, valueFilters: filters.valueFilters.map((f) => (f.id === id ? { ...f, [field]: value } : f)) });
  };

  const removeVf = (id: string) => {
    onFiltersChange({ ...filters, valueFilters: filters.valueFilters.filter((f) => f.id !== id) });
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Filtros Avançados</h3>
          {activeCount > 0 && (
            <Badge className="bg-primary/15 text-primary border-transparent text-[10px] px-1.5 py-0">
              {activeCount} {activeCount === 1 ? "ativo" : "ativos"}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {activeCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs gap-1 text-muted-foreground hover:text-destructive">
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
        <div className="space-y-1.5">
          <Label className="text-xs">Status</Label>
          <Select value={filters.status} onValueChange={(v) => onFiltersChange({ ...filters, status: v })}>
            <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativa</SelectItem>
              <SelectItem value="paused">Pausada</SelectItem>
              <SelectItem value="completed">Finalizada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Objetivo</Label>
          <Select value={filters.objective} onValueChange={(v) => onFiltersChange({ ...filters, objective: v })}>
            <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="sales">Vendas</SelectItem>
              <SelectItem value="traffic">Tráfego</SelectItem>
              <SelectItem value="engagement">Engajamento</SelectItem>
              <SelectItem value="leads">Leads</SelectItem>
              <SelectItem value="awareness">Reconhecimento</SelectItem>
              <SelectItem value="app_promotion">App</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Produto</Label>
          <Select value={filters.product} onValueChange={(v) => onFiltersChange({ ...filters, product: v })}>
            <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {availableProducts.map((p) => (
                <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Tag</Label>
          <Select value={filters.tag} onValueChange={(v) => onFiltersChange({ ...filters, tag: v })}>
            <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {availableTags.map((tag) => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ValueFiltersSection
        filters={filters.valueFilters}
        metricOptions={metricOptions}
        defaultMetric="spend"
        onAdd={addVf}
        onUpdate={updateVf}
        onRemove={removeVf}
      />
    </div>
  );
}

export const defaultCampaignFilters: CampaignFilterState = {
  status: "active",
  objective: "sales",
  bidStrategy: "all",
  budgetType: "all",
  account: "all",
  product: "all",
  video: "all",
  checkout: "all",
  tag: "all",
  dateRange: defaultDateRange,
  valueFilters: [],
};
