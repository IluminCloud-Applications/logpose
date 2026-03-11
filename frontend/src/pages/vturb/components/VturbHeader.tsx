import { RiPlayCircleLine, RiAddCircleLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";

interface VturbHeaderProps {
  onAddAccount: () => void;
}

export function VturbHeader({ onAddAccount }: VturbHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-purple-500/10 p-2.5">
          <RiPlayCircleLine className="size-5 text-purple-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">VTurb</h1>
          <p className="text-sm text-muted-foreground">
            Conecte suas contas do VTurb Analytics para visualizar dados de vídeo
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
