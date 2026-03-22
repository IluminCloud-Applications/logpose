import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SubscriptionFilters as FiltersType } from "@/hooks/use-subscriptions";
import type { StripeProduct } from "@/services/stripe";

interface SubscriptionFiltersProps {
  filters: FiltersType;
  onFiltersChange: (patch: Partial<FiltersType>) => void;
  products: StripeProduct[];
}

export function SubscriptionFilters({
  filters,
  onFiltersChange,
  products,
}: SubscriptionFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Data Início</Label>
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onFiltersChange({ dateFrom: e.target.value })}
          className="h-9 w-[150px] text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Data Fim</Label>
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onFiltersChange({ dateTo: e.target.value })}
          className="h-9 w-[150px] text-sm"
        />
      </div>
      {products.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Produto</Label>
          <Select
            value={filters.productId || "all"}
            onValueChange={(v) =>
              onFiltersChange({ productId: v === "all" ? "" : v })
            }
          >
            <SelectTrigger className="h-9 w-[200px] text-sm">
              <SelectValue placeholder="Todos os Produtos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Produtos</SelectItem>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
