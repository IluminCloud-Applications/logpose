import { RiMetaLine, RiAddCircleLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";

interface FacebookHeaderProps {
  onAddAccount: () => void;
}

export function FacebookHeader({ onAddAccount }: FacebookHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-[#1877F2]/10 p-2.5">
          <RiMetaLine className="size-5 text-[#1877F2]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Facebook Ads</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie suas contas de anúncio do Facebook
          </p>
        </div>
      </div>
      <Button onClick={onAddAccount} className="gap-1.5 h-9">
        <RiAddCircleLine className="size-4" />
        Adicionar Conta
      </Button>
    </div>
  );
}
