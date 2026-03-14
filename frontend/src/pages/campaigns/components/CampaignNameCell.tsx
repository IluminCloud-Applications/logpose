import { Switch } from "@/components/ui/switch";
import {
  RiArrowDownSFill, RiPencilLine, RiAlertLine, RiQuestionLine,
} from "@remixicon/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { fmt } from "./campaignCellHelpers";
import type { MetricRow } from "./campaignCellHelpers";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

interface CampaignNameCellProps {
  campaign: MetricRow & { id: string; status: string; noIdSales: number };
  isExpanded: boolean;
  blurName: boolean;
  noIdSales: number;
  tags?: string[];
  onEditBudget: (e: React.MouseEvent) => void;
  onToggle: (active: boolean) => Promise<void>;
}

export function CampaignNameCell({
  campaign, isExpanded, blurName, noIdSales, tags = [], onEditBudget, onToggle,
}: CampaignNameCellProps) {
  const isUnidentified = campaign.status === "unidentified";
  const isActive = campaign.status === "active";
  const blurClass = "blur-sm select-none";

  if (isUnidentified) {
    return (
      <div className="flex items-center gap-2.5">
        <RiAlertLine className="size-4 shrink-0 text-[var(--color-warning)]" />
        <div className="flex flex-col min-w-0">
          <span className={cn("font-medium text-[var(--color-warning)]", blurName && blurClass)}>
            {campaign.name}
          </span>
          <span className="text-[10px] text-muted-foreground">
            Vendas sem campanha atribuída
          </span>
        </div>
      </div>
    );
  }

  // Show max 2 tags inline, rest as count
  const visibleTags = tags.slice(0, 2);
  const remainingCount = tags.length - visibleTags.length;

  return (
    <div className="flex items-center gap-2.5">
      <RiArrowDownSFill
        className={cn(
          "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
          isExpanded ? "rotate-0" : "-rotate-90"
        )}
      />
      <Switch
        size="sm"
        checked={isActive}
        onCheckedChange={async (checked) => {
          await onToggle(checked);
        }}
        onClick={(e) => e.stopPropagation()}
      />
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={cn("font-medium truncate max-w-[280px] block", blurName && blurClass)}
            title={campaign.name}
          >
            {campaign.name}
          </span>
          {noIdSales > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-[var(--color-warning)] cursor-help">
                    <RiQuestionLine className="size-3" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{noIdSales} venda(s) sem ID — rastreadas apenas pelo nome</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="group/budget flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {fmt(campaign.budget)}/dia
          </span>
          <button
            onClick={onEditBudget}
            className="opacity-0 group-hover/budget:opacity-100 transition-opacity"
          >
            <RiPencilLine className="size-3 text-muted-foreground hover:text-foreground" />
          </button>
          {visibleTags.length > 0 && (
            <div className="flex items-center gap-1 ml-0.5">
              {visibleTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 h-4 font-normal border-border/50"
                >
                  {tag}
                </Badge>
              ))}
              {remainingCount > 0 && (
                <span className="text-[9px] text-muted-foreground">
                  +{remainingCount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
