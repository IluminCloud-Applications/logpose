import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { ImportStepPlatform } from "./ImportStepPlatform";
import { ImportStepPreview } from "./ImportStepPreview";
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
    preview: "Configurar Produtos",
    result: "Resultado da Importação",
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{titles[step]}</DialogTitle>
          <DialogDescription>
            {step === "platform" && "Selecione a plataforma e faça upload do relatório"}
            {step === "preview" && "Revise os produtos detectados e configure seus tipos"}
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
          <ImportStepPreview
            preview={preview}
            onExecute={handleExecute}
            onBack={() => setStep("platform")}
            isLoading={isLoading}
            error={error}
          />
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
