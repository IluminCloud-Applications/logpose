import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AiInstructions, AiMetricsConfig, MetricRule } from "@/types/company";
import { MetricRuleEditor } from "./MetricRuleEditor";

const METRICS: { key: keyof AiMetricsConfig; label: string; hint: string }[] = [
  { key: "roas", label: "ROAS", hint: "Retorno sobre investimento em ads" },
  { key: "cpa", label: "CPA", hint: "Custo por aquisição (venda)" },
  { key: "cpc", label: "CPC", hint: "Custo por clique" },
  { key: "connect_rate", label: "Connect Rate", hint: "Landing Page Views / Cliques" },
];

const EMPTY_RULE: MetricRule = { good: "", bad: "", average: "" };

interface AiInstructionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instructions: AiInstructions;
  onSave: (instructions: AiInstructions) => Promise<void>;
}

export function AiInstructionsModal({
  open, onOpenChange, instructions, onSave,
}: AiInstructionsModalProps) {
  const [draft, setDraft] = useState<AiInstructions>(instructions);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setDraft(instructions);
  }, [open, instructions]);

  const toggleMetric = (key: keyof AiMetricsConfig, enabled: boolean) => {
    setDraft((prev) => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        [key]: enabled ? { ...EMPTY_RULE } : null,
      },
    }));
  };

  const updateMetric = (key: keyof AiMetricsConfig, rule: MetricRule) => {
    setDraft((prev) => ({
      ...prev,
      metrics: { ...prev.metrics, [key]: rule },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Instruções para a AI</DialogTitle>
          <DialogDescription>
            Defina os benchmarks das métricas e instruções adicionais. A AI
            vai usar essas referências ao analisar suas campanhas.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          {/* Metric rules */}
          {METRICS.map(({ key, label, hint }) => (
            <MetricRuleEditor
              key={key}
              label={label}
              hint={hint}
              rule={draft.metrics[key]}
              onToggle={(v) => toggleMetric(key, v)}
              onChange={(r) => updateMetric(key, r)}
            />
          ))}

          {/* Additional prompt */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Instruções Adicionais</Label>
            <p className="text-[11px] text-muted-foreground">
              Qualquer instrução extra que a AI deve seguir ao responder suas perguntas.
            </p>
            <Textarea
              placeholder="Ex: Sempre sugira escalar campanhas com ROAS acima de 3x. Priorize análises do funil de conversão..."
              className="min-h-[100px] text-sm"
              value={draft.additional_prompt}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  additional_prompt: e.target.value,
                }))
              }
            />
          </div>

          {/* Tip */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5">
            <p className="text-[11px] text-primary/80 leading-relaxed">
              <strong>Dica:</strong> Métricas desativadas usam os benchmarks padrão da AI.
              Ative e defina seus valores para personalizar as análises.
            </p>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-border/40">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
