import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  RiMore2Fill,
  RiLockPasswordLine,
  RiShieldUserLine,
  RiDeleteBinLine,
} from "@remixicon/react";
import type { User } from "@/services/users";

interface UserRowActionsProps {
  user: User;
  currentUserId: number;
  currentUserRole: string;
  onResetPassword: () => void;
  onChangeRole: () => void;
  onDelete: () => void;
}

export function UserRowActions({
  user, currentUserId, currentUserRole, onResetPassword, onChangeRole, onDelete,
}: UserRowActionsProps) {
  const isOwner = currentUserRole === "owner";
  const isSelf = user.id === currentUserId;
  const isUserOwner = user.role === "owner";

  // No actions for yourself or for owner (unless you ARE the owner changing others)
  if (isSelf || (isUserOwner && !isSelf)) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const canResetPassword = isOwner && user.status === "active";
  const canChangeRole = isOwner;
  const canDelete = isOwner || (currentUserRole === "admin" && user.role === "viewer");

  if (!canResetPassword && !canChangeRole && !canDelete) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="hover:bg-primary/10">
          <RiMore2Fill className="size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {canChangeRole && (
          <DropdownMenuItem onClick={onChangeRole}>
            <RiShieldUserLine className="size-4" />
            Alterar Nível
          </DropdownMenuItem>
        )}
        {canResetPassword && (
          <DropdownMenuItem onClick={onResetPassword}>
            <RiLockPasswordLine className="size-4" />
            Redefinir Senha
          </DropdownMenuItem>
        )}
        {(canChangeRole || canResetPassword) && canDelete && (
          <DropdownMenuSeparator />
        )}
        {canDelete && (
          <DropdownMenuItem
            onClick={onDelete}
            className="text-destructive focus:text-destructive"
          >
            <RiDeleteBinLine className="size-4" />
            Remover
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
