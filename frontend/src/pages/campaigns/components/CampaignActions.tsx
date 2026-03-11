import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RiAddLine, RiSubtractLine } from "@remixicon/react";
import type { CampaignRow } from "@/data/mock-campaigns";
import { cn } from "@/lib/utils";

function fmt(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}

interface CampaignActionsProps {
  campaign: CampaignRow;
  onToggle?: (id: string) => void;
  onAdjustBudget?: (id: string, delta: number) => void;
}

export function CampaignActions({ campaign, onToggle, onAdjustBudget }: CampaignActionsProps) {
  const isActive = campaign.status === "active";

  return (
    <div className="flex items-center justify-center gap-3">
      {/* Toggle status */}
      <div className="flex items-center gap-1.5">
        <Switch
          size="sm"
          checked={isActive}
          onCheckedChange={() => onToggle?.(campaign.id)}
        />
        <span className={cn("text-[10px] font-medium min-w-[28px]",
          isActive ? "text-[var(--color-success)]" : "text-muted-foreground"
        )}>
          {isActive ? "ON" : "OFF"}
        </span>
      </div>

      {/* Budget adjust */}
      <div className="flex items-center gap-0.5 border border-border/50 rounded-md">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onAdjustBudget?.(campaign.id, -50)}
          className="rounded-r-none"
        >
          <RiSubtractLine className="size-3" />
        </Button>
        <span className="text-[10px] font-medium tabular-nums px-1 min-w-[40px] text-center">
          {fmt(campaign.budget)}
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onAdjustBudget?.(campaign.id, 50)}
          className="rounded-l-none"
        >
          <RiAddLine className="size-3" />
        </Button>
      </div>
    </div>
  );
}
