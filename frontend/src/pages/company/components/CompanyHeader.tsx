import { RiBuildingLine, RiSettings3Line } from "@remixicon/react";
import { Button } from "@/components/ui/button";

interface CompanyHeaderProps {
  onOpenSettings: () => void;
}

export function CompanyHeader({ onOpenSettings }: CompanyHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2.5">
          <RiBuildingLine className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Empresa</h1>
          <p className="text-sm text-muted-foreground">
            Saúde financeira e projeções da sua operação
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        className="gap-2 h-9"
        onClick={onOpenSettings}
      >
        <RiSettings3Line className="size-4" />
        Configurações
      </Button>
    </div>
  );
}
