import { RiWalletLine, RiAddCircleLine, RiUploadCloud2Line } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { IntegrationGuide } from "./IntegrationGuide";

interface PlatformsHeaderProps {
  onCreateNew: () => void;
  onImport: () => void;
}

export function PlatformsHeader({ onCreateNew, onImport }: PlatformsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2.5">
          <RiWalletLine className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plataformas</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seus endpoints de webhook
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <IntegrationGuide />
        <Button variant="outline" onClick={onImport} className="gap-1.5 h-9">
          <RiUploadCloud2Line className="size-4" />
          Importar Dados
        </Button>
        <Button onClick={onCreateNew} className="gap-1.5 h-9">
          <RiAddCircleLine className="size-4" />
          Novo Endpoint
        </Button>
      </div>
    </div>
  );
}
