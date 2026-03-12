import { RiMegaphoneLine, RiSearchLine, RiAddLine } from "@remixicon/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ColumnPreset } from "./columnPresets";
import { BlurToggle, type BlurState } from "./BlurToggle";
import { UtmParamsGuide } from "./UtmParamsGuide";

interface CampaignsHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  presets: ColumnPreset[];
  activePresetId: string;
  onPresetChange: (id: string) => void;
  onCreatePreset: () => void;
  blur: BlurState;
  onBlurChange: (blur: BlurState) => void;
}

export function CampaignsHeader({
  search, onSearchChange,
  presets, activePresetId, onPresetChange, onCreatePreset,
  blur, onBlurChange,
}: CampaignsHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2.5">
            <RiMegaphoneLine className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Campanhas</h1>
            <p className="text-sm text-muted-foreground">
              Performance com vendas reais
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar campanha..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 w-[220px] h-9 text-sm"
            />
          </div>
          <BlurToggle blur={blur} onBlurChange={onBlurChange} />
          <UtmParamsGuide />
        </div>
      </div>

      {/* Preset tabs */}
      <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/60 border border-border/40 w-fit">
        {presets.map((preset) => (
          <Button
            key={preset.id}
            variant="ghost"
            size="sm"
            onClick={() => onPresetChange(preset.id)}
            className={cn(
              "text-xs rounded-md px-3",
              activePresetId === preset.id && "bg-card shadow-sm font-semibold"
            )}
          >
            {preset.name}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-md text-muted-foreground hover:text-foreground"
          onClick={onCreatePreset}
        >
          <RiAddLine className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
