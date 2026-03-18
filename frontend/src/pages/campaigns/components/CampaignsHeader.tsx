import { RiMegaphoneLine, RiSearchLine, RiAddLine, RiSettings3Line } from "@remixicon/react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ColumnPreset } from "./columnPresets";
import { BlurToggle, type BlurState } from "./BlurToggle";
import { UtmParamsGuide } from "./UtmParamsGuide";
import { RefreshButton } from "@/components/RefreshButton";
import type { UnidentifiedProduct } from "@/services/campaigns";

interface CampaignsHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  presets: ColumnPreset[];
  activePresetId: string;
  onPresetChange: (id: string) => void;
  onCreatePreset: () => void;
  blur: BlurState;
  onBlurChange: (blur: BlurState) => void;
  unidentifiedProducts?: UnidentifiedProduct[];
  onRefresh: () => Promise<void>;
  onOpenSettings: () => void;
}

export function CampaignsHeader({
  search, onSearchChange,
  presets, activePresetId, onPresetChange, onCreatePreset,
  blur, onBlurChange, unidentifiedProducts, onRefresh, onOpenSettings,
}: CampaignsHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2.5">
            <RiMegaphoneLine className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Campanhas</h1>
            <p className="text-sm text-muted-foreground">
              Performance com vendas reais
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          {/* Search - full width on mobile, own row */}
          <div className="relative w-full sm:w-auto">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar campanha..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 w-full sm:w-[220px] h-9 text-sm"
            />
          </div>
          {/* Action buttons row */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="gap-1.5 h-9 hidden sm:flex"
              onClick={() => navigate("/campaigns/create")}
            >
              <RiAddLine className="size-4" />
              Nova Campanha
            </Button>
            <BlurToggle
              blur={blur}
              onBlurChange={onBlurChange}
              unidentifiedProducts={unidentifiedProducts}
            />
            <UtmParamsGuide />
            <Button
              variant="outline"
              size="icon"
              className="size-9"
              onClick={onOpenSettings}
              title="Configurações dos KPIs"
            >
              <RiSettings3Line className="size-4" />
            </Button>
            <RefreshButton onRefresh={onRefresh} />
          </div>
        </div>
      </div>

      {/* Preset tabs */}
      <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/60 border border-border/40 w-fit overflow-x-auto max-w-full">
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
