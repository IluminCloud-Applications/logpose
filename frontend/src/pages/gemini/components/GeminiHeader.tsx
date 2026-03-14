import { RiGeminiLine, RiAddCircleLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";

interface GeminiHeaderProps {
  onAddAccount: () => void;
}

export function GeminiHeader({ onAddAccount }: GeminiHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-blue-500/10 p-2.5">
          <RiGeminiLine className="size-5 text-blue-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gemini API</h1>
          <p className="text-sm text-muted-foreground">
            Conecte suas chaves da Gemini AI para habilitar o assistente inteligente
          </p>
        </div>
      </div>
      <Button onClick={onAddAccount} className="gap-1.5 h-9">
        <RiAddCircleLine className="size-4" />
        Adicionar Chave
      </Button>
    </div>
  );
}
