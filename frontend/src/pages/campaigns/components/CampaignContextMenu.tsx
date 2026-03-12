import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator,
} from "@/components/ui/context-menu";
import {
  RiPlayCircleLine, RiPauseCircleLine, RiPriceTag3Line,
  RiMoneyDollarCircleLine, RiVideoLine, RiShoppingBag2Line,
  RiInformationLine,
} from "@remixicon/react";

interface CampaignContextMenuProps {
  children: React.ReactNode;
  isActive: boolean;
  onToggle: () => void;
  onEditBudget: () => void;
  onEditTags: () => void;
  onDefineVideo: () => void;
  onDefineCheckout: () => void;
  onViewInfo: () => void;
}

export function CampaignContextMenu({
  children, isActive, onToggle, onEditBudget, onEditTags,
  onDefineVideo, onDefineCheckout, onViewInfo,
}: CampaignContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
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
        <ContextMenuItem onClick={onDefineVideo} className="gap-2">
          <RiVideoLine className="size-4 text-muted-foreground" />
          Definir Vídeo
        </ContextMenuItem>
        <ContextMenuItem onClick={onDefineCheckout} className="gap-2">
          <RiShoppingBag2Line className="size-4 text-muted-foreground" />
          Definir Checkout
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onViewInfo} className="gap-2">
          <RiInformationLine className="size-4 text-muted-foreground" />
          Informações
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
