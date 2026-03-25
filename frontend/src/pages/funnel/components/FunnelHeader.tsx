import { RiFlowChart, RiLayoutLeftLine, RiLayoutColumnLine, RiStarFill } from "@remixicon/react";

const POPULAR_STAGES = ["Cliques", "Alcance"];
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DateFilter, type DatePreset } from "@/components/DateFilter";

interface FunnelHeaderProps {
  products: { id: string; name: string }[];
  selectedProduct: string;
  onProductChange: (id: string) => void;
  anchor: string;
  onAnchorChange: (value: string) => void;
  stages: string[];
  viewMode: "single" | "compare";
  onViewModeChange: (mode: "single" | "compare") => void;
  datePreset: DatePreset;
  dateStart: string;
  dateEnd: string;
  onDatePresetChange: (preset: DatePreset) => void;
  onDateStartChange: (value: string) => void;
  onDateEndChange: (value: string) => void;
}

export function FunnelHeader({
  products, selectedProduct, onProductChange,
  anchor, onAnchorChange, stages,
  viewMode, onViewModeChange,
  datePreset, dateStart, dateEnd,
  onDatePresetChange, onDateStartChange, onDateEndChange,
}: FunnelHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2.5">
            <RiFlowChart className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Funil</h1>
            <p className="text-sm text-muted-foreground">
              Visualize a conversão de cada etapa do seu funil
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/60 border border-border/40">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange("single")}
            className={cn("gap-1.5 text-xs rounded-md", viewMode === "single" && "bg-card shadow-sm")}
          >
            <RiLayoutLeftLine className="size-3.5" />
            Visualização
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange("compare")}
            className={cn("gap-1.5 text-xs rounded-md", viewMode === "compare" && "bg-card shadow-sm")}
          >
            <RiLayoutColumnLine className="size-3.5" />
            Comparar
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <DateFilter
          preset={datePreset}
          dateStart={dateStart}
          dateEnd={dateEnd}
          onPresetChange={onDatePresetChange}
          onDateStartChange={onDateStartChange}
          onDateEndChange={onDateEndChange}
        />

        {viewMode === "single" && products.length > 0 && (
          <>
            <div className="space-y-1.5 min-w-[220px]">
              <Label className="text-xs">Produto</Label>
              <Select value={selectedProduct} onValueChange={onProductChange}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 min-w-[220px]">
              <Label className="text-xs">Conversão baseada em</Label>
              <Select value={anchor} onValueChange={onAnchorChange}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="previous">Etapa Anterior</SelectItem>
                  {stages.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      <span className="flex items-center gap-1.5">
                        {stage}
                        {POPULAR_STAGES.includes(stage) && (
                          <RiStarFill className="size-3 text-amber-400" />
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
