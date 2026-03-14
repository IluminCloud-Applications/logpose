import { RiBuildingLine, RiSettings3Line } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { RefreshButton } from "@/components/RefreshButton";

interface CompanyHeaderProps {
  onOpenSettings: () => void;
  onRefresh: () => Promise<void>;
}

export function CompanyHeader({ onOpenSettings, onRefresh }: CompanyHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2.5">
          <RiBuildingLine className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Empresa</h1>
          <p className="text-sm text-muted-foreground">
            Saúde financeira e projeções da sua operação
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <RefreshButton onRefresh={onRefresh} />
        <Button
          variant="outline"
          className="gap-2 h-9"
          onClick={onOpenSettings}
        >
          <RiSettings3Line className="size-4" />
          <span className="hidden sm:inline">Configurações</span>
        </Button>
      </div>
    </div>
  );
}
