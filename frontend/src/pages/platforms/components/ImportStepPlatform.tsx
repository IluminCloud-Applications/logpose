import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PlatformLogo } from "@/components/PlatformLogo";
import {
  RiUploadCloud2Line, RiFileExcelLine, RiLoader4Line,
} from "@remixicon/react";
import type { ImportPlatform } from "@/types/import";

interface Props {
  onSubmit: (
    platform: ImportPlatform,
    files: { file?: File; fileVendas?: File; fileOrigem?: File },
  ) => void;
  isLoading: boolean;
  error: string | null;
}

export function ImportStepPlatform({ onSubmit, isLoading, error }: Props) {
  const [platform, setPlatform] = useState<ImportPlatform | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileVendas, setFileVendas] = useState<File | null>(null);
  const [fileOrigem, setFileOrigem] = useState<File | null>(null);

  const isReady = platform === "kiwify"
    ? !!file
    : !!fileVendas && !!fileOrigem;

  const handleSubmit = () => {
    if (!platform || !isReady) return;
    onSubmit(platform, { file: file ?? undefined, fileVendas: fileVendas ?? undefined, fileOrigem: fileOrigem ?? undefined });
  };

  return (
    <div className="space-y-5">
      {/* Seletor de plataforma */}
      <div className="space-y-2">
        <Label>Plataforma</Label>
        <div className="grid grid-cols-2 gap-3">
          {(["kiwify", "payt"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => { setPlatform(p); setFile(null); setFileVendas(null); setFileOrigem(null); }}
              disabled={isLoading}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border-2 p-4 transition-all cursor-pointer",
                platform === p
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30",
              )}
            >
              <PlatformLogo platform={p} size="lg" showLabel={false} />
              <span className="text-sm font-semibold">{p === "payt" ? "PayT" : "Kiwify"}</span>
              <span className="text-[10px] text-muted-foreground">
                {p === "kiwify" ? "1 arquivo CSV" : "2 arquivos XLSX"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Upload de arquivos */}
      {platform === "kiwify" && (
        <FileDropZone
          label="Relatório de Vendas (.csv)"
          accept=".csv"
          file={file}
          onFile={setFile}
          disabled={isLoading}
        />
      )}

      {platform === "payt" && (
        <div className="space-y-3">
          <FileDropZone
            label="Relatório de Vendas (.xlsx)"
            accept=".xlsx"
            file={fileVendas}
            onFile={setFileVendas}
            disabled={isLoading}
          />
          <FileDropZone
            label="Relatório de Origem das Vendas (.xlsx)"
            accept=".xlsx"
            file={fileOrigem}
            onFile={setFileOrigem}
            disabled={isLoading}
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md p-2">
          {error}
        </p>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!platform || !isReady || isLoading}
        className="w-full gap-2"
      >
        {isLoading ? (
          <><RiLoader4Line className="size-4 animate-spin" /> Processando...</>
        ) : (
          <><RiUploadCloud2Line className="size-4" /> Analisar Arquivo</>
        )}
      </Button>
    </div>
  );
}

/* ── Drop Zone Component ───────────────────────────────── */

function FileDropZone({
  label, accept, file, onFile, disabled,
}: {
  label: string; accept: string; file: File | null;
  onFile: (f: File | null) => void; disabled: boolean;
}) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }, [onFile]);

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-5 cursor-pointer transition-all",
          dragOver ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/30",
          file && "border-primary/50 bg-primary/5",
          disabled && "opacity-50 pointer-events-none",
        )}
      >
        {file ? (
          <div className="flex items-center gap-2 text-sm">
            <RiFileExcelLine className="size-5 text-primary" />
            <span className="font-medium truncate max-w-[250px]">{file.name}</span>
            <span className="text-muted-foreground text-xs">
              ({(file.size / 1024).toFixed(0)} KB)
            </span>
          </div>
        ) : (
          <>
            <RiUploadCloud2Line className="size-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Arraste o arquivo ou clique para selecionar
            </span>
          </>
        )}
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          disabled={disabled}
        />
      </label>
    </div>
  );
}
