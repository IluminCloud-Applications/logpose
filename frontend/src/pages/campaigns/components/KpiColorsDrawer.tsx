import { useState, useEffect } from "react";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { KpiColorsConfig, KpiColorEntry } from "@/types/company";
import { KpiColorSection } from "./KpiColorSection";

const KPI_LABELS: { key: keyof KpiColorsConfig; label: string; hint: string }[] = [
  { key: "roas", label: "ROAS", hint: "Retorno sobre investimento" },
  { key: "cpa", label: "CPA", hint: "Custo por aquisição" },
  { key: "ctr", label: "CTR", hint: "Taxa de cliques (%)" },
  { key: "cpc", label: "CPC", hint: "Custo por clique (R$)" },
];

const DEFAULT_ENTRY: KpiColorEntry = {
  green: { min: 0 },
  yellow: { min: 0, max: 0 },
  red: { max: 0 },
};

interface KpiColorsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kpiColors: KpiColorsConfig;
  onSave: (colors: KpiColorsConfig) => Promise<void>;
}

export function KpiColorsDrawer({
  open, onOpenChange, kpiColors, onSave,
}: KpiColorsDrawerProps) {
  const [draft, setDraft] = useState<KpiColorsConfig>(kpiColors);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setDraft(kpiColors);
  }, [open, kpiColors]);

  const toggleKpi = (key: keyof KpiColorsConfig, enabled: boolean) => {
    setDraft((prev) => ({
      ...prev,
      [key]: enabled ? { ...DEFAULT_ENTRY } : null,
    }));
  };

  const updateEntry = (key: keyof KpiColorsConfig, entry: KpiColorEntry) => {
    setDraft((prev) => ({ ...prev, [key]: entry }));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[420px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Cores dos KPIs</SheetTitle>
          <SheetDescription>
            Configure os limites de cor para cada indicador na tabela de campanhas.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-5 py-4">
          {KPI_LABELS.map(({ key, label, hint }) => {
            const entry = draft[key];
            const isEnabled = entry !== null;

            return (
              <div
                key={key}
                className="rounded-lg border border-border/40 p-3 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">{label}</Label>
                    <p className="text-[11px] text-muted-foreground">{hint}</p>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(v) => toggleKpi(key, v)}
                  />
                </div>

                {isEnabled && entry && (
                  <KpiColorSection
                    entry={entry}
                    onChange={(updated) => updateEntry(key, updated)}
                  />
                )}
              </div>
            );
          })}

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5">
            <p className="text-[11px] text-primary/80 leading-relaxed">
              <strong>Dica:</strong> KPIs desativados serão exibidos com a cor
              padrão (sem destaque). Ative para definir os limites de verde,
              amarelo e vermelho.
            </p>
          </div>
        </div>

        <SheetFooter className="pt-4 border-t border-border/40">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
