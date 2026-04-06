import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RiAddLine, RiDeleteBinLine } from "@remixicon/react";
import type { ChannelConfig, CustomChannelPayload } from "@/services/recovery";

interface CustomChannelsSectionProps {
  customConfigs: ChannelConfig[];
  onAdd: (payload: CustomChannelPayload) => Promise<void>;
  onRemove: (channel: string) => Promise<void>;
  isSaving: boolean;
}

const EMPTY_FORM: CustomChannelPayload = { name: "", keyword: "" };

export function CustomChannelsSection({
  customConfigs, onAdd, onRemove, isSaving,
}: CustomChannelsSectionProps) {
  const [form, setForm] = useState<CustomChannelPayload>(EMPTY_FORM);
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!form.name.trim() || !form.keyword.trim()) return;
    try {
      setAdding(true);
      await onAdd(form);
      setForm(EMPTY_FORM);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border/60" />
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
          Canais Personalizados
        </p>
        <div className="h-px flex-1 bg-border/60" />
      </div>

      {/* Lista de canais customizados existentes */}
      {customConfigs.length > 0 && (
        <div className="space-y-2">
          {customConfigs.map((cfg) => (
            <div
              key={cfg.channel}
              className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium leading-none">
                  {cfg.label || cfg.channel}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  src contém: <code className="bg-muted px-1 rounded">{cfg.keyword}</code>
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(cfg.channel)}
                disabled={isSaving}
              >
                <RiDeleteBinLine className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Formulário de adição */}
      <div className="rounded-lg border border-dashed border-border/60 p-3 space-y-3">
        <p className="text-[11px] text-muted-foreground">
          Adicione um canal personalizado (ex: "IA de Recuperação", recuperação específica).
        </p>
        <div className="space-y-1.5">
          <Label className="text-xs">Nome do Canal</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Ex: IA de Recuperação"
            className="h-8 text-sm"
            disabled={isSaving || adding}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">
            Valor do <code className="bg-muted px-1 rounded text-[10px]">src</code>
          </Label>
          <Input
            value={form.keyword}
            onChange={(e) => setForm((p) => ({ ...p, keyword: e.target.value }))}
            placeholder="Ex: ia_recovery"
            className="h-8 text-sm"
            disabled={isSaving || adding}
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          className="w-full gap-1.5 h-8"
          onClick={handleAdd}
          disabled={isSaving || adding || !form.name.trim() || !form.keyword.trim()}
        >
          <RiAddLine className="size-3.5" />
          {adding ? "Adicionando..." : "Adicionar Canal"}
        </Button>
      </div>
    </div>
  );
}
