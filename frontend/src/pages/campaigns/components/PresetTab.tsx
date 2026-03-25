import { RiDeleteBin6Line, RiPencilLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import type { ColumnPreset } from "./columnPresets";

interface PresetTabProps {
  preset: ColumnPreset;
  isActive: boolean;
  isDefault: boolean;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PresetTab({ preset, isActive, isDefault, onClick, onEdit, onDelete }: PresetTabProps) {
  const button = (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "text-xs rounded-md px-3",
        isActive && "bg-card shadow-sm font-semibold"
      )}
    >
      {preset.name}
    </Button>
  );

  // Default presets have no context menu
  if (isDefault) return button;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {button}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-44">
        {onEdit && (
          <ContextMenuItem onClick={onEdit} className="gap-2">
            <RiPencilLine className="size-3.5" />
            Editar
          </ContextMenuItem>
        )}
        {onDelete && (
          <ContextMenuItem onClick={onDelete} className="gap-2 text-destructive focus:text-destructive">
            <RiDeleteBin6Line className="size-3.5" />
            Remover
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
