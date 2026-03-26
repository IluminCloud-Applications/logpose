import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RiFlashlightLine } from "@remixicon/react";
import { ImportStepPlatform } from "./ImportStepPlatform";
import { ImportStepPreview } from "./ImportStepPreview";
import { ImportStepAdvanced } from "./ImportStepAdvanced";
import { ImportStepResult } from "./ImportStepResult";
import type {
  ImportStep, ImportPlatform, ImportPreviewResponse,
  ImportResultResponse, ProductConfig,
} from "@/types/import";
import { previewImport, executeImport } from "@/services/import";

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportModal({ open, onOpenChange }: ImportModalProps) {
  const [step, setStep] = useState<ImportStep>("platform");
  const [platform, setPlatform] = useState<ImportPlatform | null>(null);
  const [files, setFiles] = useState<{ file?: File; fileVendas?: File; fileOrigem?: File }>({});
  const [preview, setPreview] = useState<ImportPreviewResponse | null>(null);
  const [result, setResult] = useState<ImportResultResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advancedMode, setAdvancedMode] = useState(false);

  const resetState = () => {
    setStep("platform");
    setPlatform(null);
    setFiles({});
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const handleClose = (v: boolean) => {
    if (!v) resetState();
    onOpenChange(v);
  };

  const handlePreview = async (p: ImportPlatform, f: typeof files) => {
    setPlatform(p);
    setFiles(f);
    setIsLoading(true);
    setError(null);
    try {
      const data = await previewImport(p, f);
      setPreview(data);
      setStep("preview");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao processar arquivo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecute = async (configs: ProductConfig[]) => {
    if (!platform) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await executeImport(platform, files, configs);
      setResult(data);
      setStep("result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro na importação");
    } finally {
      setIsLoading(false);
    }
  };

  const titles: Record<ImportStep, string> = {
    platform: "Importação Inteligente",
    preview: advancedMode ? "Modo Avançado — Configurar Grupos" : "Configurar Produtos",
    result: "Resultado da Importação",
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{titles[step]}</DialogTitle>
          <DialogDescription>
            {step === "platform" && "Selecione a plataforma e faça upload do relatório"}
            {step === "preview" && !advancedMode && "Revise os produtos detectados e configure seus tipos"}
            {step === "preview" && advancedMode && "Defina um separador para agrupar variantes em um único produto"}
            {step === "result" && "Veja o resumo da importação realizada"}
          </DialogDescription>
        </DialogHeader>

        {step === "platform" && (
          <ImportStepPlatform
            onSubmit={handlePreview}
            isLoading={isLoading}
            error={error}
          />
        )}

        {step === "preview" && preview && (
          <>
            {/* Toggle de modo avançado */}
            <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2 mb-1">
              <RiFlashlightLine className="size-4 text-amber-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <Label htmlFor="advanced-toggle" className="text-sm font-medium cursor-pointer">
                  Modo Avançado
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Agrupe variantes e vincule upsells a múltiplos produtos
                </p>
              </div>
              <Switch
                id="advanced-toggle"
                checked={advancedMode}
                onCheckedChange={setAdvancedMode}
              />
            </div>

            {advancedMode ? (
              <ImportStepAdvanced
                preview={preview}
                onExecute={handleExecute}
                onBack={() => setStep("platform")}
                isLoading={isLoading}
                error={error}
              />
            ) : (
              <ImportStepPreview
                preview={preview}
                onExecute={handleExecute}
                onBack={() => setStep("platform")}
                isLoading={isLoading}
                error={error}
              />
            )}
          </>
        )}

        {step === "result" && result && (
          <ImportStepResult
            result={result}
            onClose={() => handleClose(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
