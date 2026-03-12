import { useState } from "react";
import { RiAddLine, RiCheckLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ValueFilter } from "./ValueFiltersSection";

const metricOptions = [
  { value: "spend", label: "Gasto" },
  { value: "revenue", label: "Faturamento" },
  { value: "profit", label: "Lucro" },
  { value: "roas", label: "ROAS" },
  { value: "cpa", label: "CPA" },
  { value: "sales", label: "Vendas" },
];

const operatorOptions = [
  { value: "gte", label: "Maior que" },
  { value: "lte", label: "Menor que" },
];

interface AddValueFilterPopoverProps {
  onAdd: (filter: ValueFilter) => void;
}

export function AddValueFilterPopover({ onAdd }: AddValueFilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const [metric, setMetric] = useState("spend");
  const [operator, setOperator] = useState("gte");
  const [value, setValue] = useState("");

  const handleConfirm = () => {
    if (!value) return;
    onAdd({
      id: crypto.randomUUID().slice(0, 8),
      metric,
      operator,
      value,
    });
    setMetric("spend");
    setOperator("gte");
    setValue("");
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleConfirm();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-1 rounded-md border border-dashed px-2 py-1 text-xs font-medium transition-all duration-150",
            "border-border/50 text-muted-foreground hover:bg-muted/70 hover:text-foreground hover:border-border"
          )}
        >
          <RiAddLine className="size-3.5" />
          Valor
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={4} className="w-[300px] p-3 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Filtrar por valor
        </p>
        <div className="flex items-center gap-2">
          <Select value={metric} onValueChange={setMetric}>
            <SelectTrigger className="h-8 flex-1 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {metricOptions.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={operator} onValueChange={setOperator}>
            <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {operatorOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Valor"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 flex-1 text-xs"
            autoFocus
          />
          <Button
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={handleConfirm}
            disabled={!value}
          >
            <RiCheckLine className="size-3.5" />
            Aplicar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
