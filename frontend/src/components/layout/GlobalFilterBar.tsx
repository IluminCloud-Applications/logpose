import { useState, useEffect, useRef } from "react";
import {
  RiCalendarLine, RiFilterLine, RiCloseLine, RiPercentLine, RiBuildingLine,
} from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { DashboardFilters, DatePreset } from "@/hooks/use-dashboard";
import type { CompanySettings } from "@/types/company";

const presetLabels: Record<DatePreset, string> = {
  today: "Hoje",
  "7d": "Últimos 7 dias",
  "14d": "Últimos 14 dias",
  "30d": "Últimos 30 dias",
  "90d": "Últimos 90 dias",
  all: "Tempo inteiro",
  custom: "Personalizado",
};

interface GlobalFilterBarProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  settings: CompanySettings | null;
  products: { id: number; name: string }[];
  platforms?: { value: string; label: string }[];
}

export function GlobalFilterBar({
  filters, onFiltersChange, settings, products, platforms = [],
}: GlobalFilterBarProps) {
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const isCustom = filters.datePreset === "custom";
  const taxRate = settings?.tax_rate ?? 0;
  const opCostsTotal = settings?.operational_costs.reduce((s, c) => s + c.amount, 0) ?? 0;

  const activeCount = [
    filters.datePreset !== "today" ? "1" : "",
    filters.product !== "all" ? "1" : "",
    filters.platform !== "all" ? "1" : "",
    filters.taxEnabled ? "1" : "",
    filters.opCostsEnabled ? "1" : "",
  ].filter(Boolean).length;

  const handleClear = () => onFiltersChange({
    datePreset: "today", dateStart: "", dateEnd: "",
    product: "all", platform: "all",
    taxEnabled: false, opCostsEnabled: false,
  });

  return (
    <>
      <div ref={sentinelRef} className="h-0 w-full" />
      <div
        className={`flex flex-wrap items-center gap-2.5 p-3 rounded-xl border transition-all duration-300 ${isSticky ? "sticky top-0 z-30 bg-card/95 backdrop-blur-md shadow-lg border-border/60" : "bg-card/50 border-border/30"}`}
      >
        <div className="flex items-center gap-1.5 text-muted-foreground mr-1">
          <RiFilterLine className="size-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Filtros</span>
          {activeCount > 0 && (
            <span className="ml-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </div>

        {/* Date Preset */}
        <div className="flex items-center gap-1.5">
          <RiCalendarLine className="size-3.5 text-muted-foreground" />
          <Select
            value={filters.datePreset}
            onValueChange={(v) => onFiltersChange({ ...filters, datePreset: v as DatePreset })}
          >
            <SelectTrigger className="h-9 w-[170px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(presetLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isCustom && (
          <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-200">
            <Input
              type="date" value={filters.dateStart}
              onChange={(e) => onFiltersChange({ ...filters, dateStart: e.target.value })}
              className="h-9 w-[150px] text-xs"
            />
            <span className="text-xs text-muted-foreground">até</span>
            <Input
              type="date" value={filters.dateEnd}
              onChange={(e) => onFiltersChange({ ...filters, dateEnd: e.target.value })}
              className="h-9 w-[150px] text-xs"
            />
          </div>
        )}

        <Select
          value={filters.product}
          onValueChange={(v) => onFiltersChange({ ...filters, product: v })}
        >
          <SelectTrigger className="h-9 w-[170px] text-xs">
            <SelectValue placeholder="Produto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Produtos</SelectItem>
            {products.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.platform}
          onValueChange={(v) => onFiltersChange({ ...filters, platform: v })}
        >
          <SelectTrigger className="h-9 w-[140px] text-xs">
            <SelectValue placeholder="Plataforma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {platforms.map((p) => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tax toggle */}
        <div className="flex items-center gap-2 border-l border-border/30 pl-2.5 ml-0.5">
          <RiPercentLine className="size-3.5 text-muted-foreground" />
          <Label htmlFor="tax-toggle" className="text-xs cursor-pointer select-none">
            Impostos
          </Label>
          <Switch
            id="tax-toggle"
            checked={filters.taxEnabled}
            onCheckedChange={(v) => onFiltersChange({ ...filters, taxEnabled: v })}
            className="scale-90"
          />
          {filters.taxEnabled && (
            <span className="text-xs font-semibold text-destructive tabular-nums">
              -{taxRate}%
            </span>
          )}
        </div>

        {/* Operational cost toggle */}
        <div className="flex items-center gap-2 border-l border-border/30 pl-2.5">
          <RiBuildingLine className="size-3.5 text-muted-foreground" />
          <Label htmlFor="opcost-toggle" className="text-xs cursor-pointer select-none">
            Custos
          </Label>
          <Switch
            id="opcost-toggle"
            checked={filters.opCostsEnabled}
            onCheckedChange={(v) => onFiltersChange({ ...filters, opCostsEnabled: v })}
            className="scale-90"
          />
          {filters.opCostsEnabled && opCostsTotal > 0 && (
            <span className="text-xs font-semibold text-destructive tabular-nums">
              -R${opCostsTotal.toLocaleString("pt-BR")}
            </span>
          )}
        </div>

        {activeCount > 0 && (
          <Button
            variant="ghost" size="sm"
            onClick={handleClear}
            className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RiCloseLine className="size-3.5" />
            Limpar
          </Button>
        )}
      </div>
    </>
  );
}
