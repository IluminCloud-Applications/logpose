import { RiGroupLine, RiUserAddLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";

interface UsersHeaderProps {
  onInvite: () => void;
  canInvite: boolean;
}

export function UsersHeader({ onInvite, canInvite }: UsersHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2.5">
          <RiGroupLine className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os acessos ao Log Pose
          </p>
        </div>
      </div>
      {canInvite && (
        <Button onClick={onInvite} className="gap-1.5 h-9">
          <RiUserAddLine className="size-4" />
          Convidar Usuário
        </Button>
      )}
    </div>
  );
}
