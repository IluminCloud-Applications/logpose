import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator,
} from "@/components/ui/context-menu";
import {
  RiPlayCircleLine, RiPauseCircleLine, RiPriceTag3Line, RiMoneyDollarCircleLine,
} from "@remixicon/react";

interface CampaignContextMenuProps {
  children: React.ReactNode;
  isActive: boolean;
  onToggle: () => void;
  onEditBudget: () => void;
  onEditTags: () => void;
}

export function CampaignContextMenu({
  children, isActive, onToggle, onEditBudget, onEditTags,
}: CampaignContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={onToggle} className="gap-2">
          {isActive ? (
            <>
              <RiPauseCircleLine className="size-4 text-muted-foreground" />
              Desativar Campanha
            </>
          ) : (
            <>
              <RiPlayCircleLine className="size-4 text-muted-foreground" />
              Ativar Campanha
            </>
          )}
        </ContextMenuItem>
        <ContextMenuItem onClick={onEditBudget} className="gap-2">
          <RiMoneyDollarCircleLine className="size-4 text-muted-foreground" />
          Editar Orçamento
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onEditTags} className="gap-2">
          <RiPriceTag3Line className="size-4 text-muted-foreground" />
          Tags
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
