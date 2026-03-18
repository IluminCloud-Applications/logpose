import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  RiEyeLine, RiEyeOffLine, RiLayoutColumnLine,
} from "@remixicon/react";

export type RateMode = "previous" | "clicks";

interface BottleneckToolbarProps {
  showLosses: boolean;
  onShowLossesChange: (v: boolean) => void;
  rateMode: RateMode;
  onRateModeChange: (mode: RateMode) => void;
  /** All funnel stage labels */
  stageLabels: string[];
  /** Currently hidden stage labels */
  hiddenStages: string[];
  onHiddenStagesChange: (hidden: string[]) => void;
}

export function BottleneckToolbar({
  showLosses, onShowLossesChange,
  rateMode, onRateModeChange,
  stageLabels, hiddenStages, onHiddenStagesChange,
}: BottleneckToolbarProps) {
  const [colOpen, setColOpen] = useState(false);
  const hasHidden = hiddenStages.length > 0;

  const toggleStage = (label: string, checked: boolean) => {
    if (checked) {
      onHiddenStagesChange(hiddenStages.filter((l) => l !== label));
    } else {
      onHiddenStagesChange([...hiddenStages, label]);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Rate mode toggle */}
      <div className="flex items-center rounded-md border border-border/40 overflow-hidden text-xs">
        <button
          type="button"
          onClick={() => onRateModeChange("previous")}
          className={`px-2.5 py-1 transition-colors ${
            rateMode === "previous"
              ? "bg-primary text-primary-foreground font-medium"
              : "text-muted-foreground hover:bg-muted/60"
          }`}
        >
          Etapa Anterior
        </button>
        <button
          type="button"
          onClick={() => onRateModeChange("clicks")}
          className={`px-2.5 py-1 transition-colors ${
            rateMode === "clicks"
              ? "bg-primary text-primary-foreground font-medium"
              : "text-muted-foreground hover:bg-muted/60"
          }`}
        >
          A partir do Clique
        </button>
      </div>

      {/* Show losses */}
      <Button
        variant={showLosses ? "default" : "outline"}
        size="xs"
        onClick={() => onShowLossesChange(!showLosses)}
        className="gap-1.5"
      >
        {showLosses ? <RiEyeOffLine className="size-3" /> : <RiEyeLine className="size-3" />}
        {showLosses ? "Ocultar Perdas" : "Mostrar Perdas"}
      </Button>

      {/* Column visibility */}
      <DropdownMenu open={colOpen} onOpenChange={setColOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={hasHidden ? "default" : "outline"}
            size="xs"
            className="gap-1.5"
          >
            <RiLayoutColumnLine className="size-3" />
            Colunas
            {hasHidden && (
              <span className="ml-0.5 text-[10px] opacity-80">
                ({stageLabels.length - hiddenStages.length}/{stageLabels.length})
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="p-3 space-y-2 w-[200px]">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Exibir colunas
          </p>
          {stageLabels.map((label) => {
            const isVisible = !hiddenStages.includes(label);
            return (
              <div key={label} className="flex items-center gap-2">
                <Checkbox
                  id={`col-${label}`}
                  checked={isVisible}
                  onCheckedChange={(v) => toggleStage(label, v === true)}
                />
                <Label htmlFor={`col-${label}`} className="text-sm cursor-pointer">
                  {label}
                </Label>
              </div>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
