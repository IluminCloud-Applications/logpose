import { RiCloseLine, RiAddCircleLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ValueFilter {
  id: string;
  metric: string;
  operator: string;
  value: string;
}

interface MetricOption {
  value: string;
  label: string;
}

const operatorOptions = [
  { value: "gte", label: "Maior que" },
  { value: "lte", label: "Menor que" },
];

interface ValueFiltersProps {
  filters: ValueFilter[];
  metricOptions: MetricOption[];
  defaultMetric: string;
  onAdd: () => void;
  onUpdate: (id: string, field: keyof ValueFilter, value: string) => void;
  onRemove: (id: string) => void;
}

export function ValueFiltersSection({
  filters,
  metricOptions,
  onAdd,
  onUpdate,
  onRemove,
}: ValueFiltersProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Filtros por Valor
        </span>
        <Button variant="outline" size="sm" onClick={onAdd} className="text-xs gap-1">
          <RiAddCircleLine className="size-3.5" />
          Adicionar
        </Button>
      </div>
      {filters.map((vf) => (
        <div key={vf.id} className="flex items-center gap-2">
          <Select value={vf.metric} onValueChange={(v) => onUpdate(vf.id, "metric", v)}>
            <SelectTrigger className="h-9 w-[130px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {metricOptions.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={vf.operator} onValueChange={(v) => onUpdate(vf.id, "operator", v)}>
            <SelectTrigger className="h-9 w-[130px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {operatorOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Valor"
            value={vf.value}
            onChange={(e) => onUpdate(vf.id, "value", e.target.value)}
            className="h-9 w-[120px] text-xs"
          />
          <Button variant="ghost" size="icon-sm" className="shrink-0" onClick={() => onRemove(vf.id)}>
            <RiCloseLine className="size-3.5 text-muted-foreground" />
          </Button>
        </div>
      ))}
    </div>
  );
}
