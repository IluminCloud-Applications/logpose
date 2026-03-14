import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { MetricRule } from "@/types/company";

interface MetricRuleEditorProps {
  label: string;
  hint: string;
  rule: MetricRule | null;
  onToggle: (enabled: boolean) => void;
  onChange: (rule: MetricRule) => void;
}

const EMPTY_RULE: MetricRule = { good: "", bad: "", average: "" };

export function MetricRuleEditor({
  label, hint, rule, onToggle, onChange,
}: MetricRuleEditorProps) {
  const isEnabled = rule !== null;
  const current = rule ?? EMPTY_RULE;

  const update = (field: keyof MetricRule, value: string) => {
    onChange({ ...current, [field]: value });
  };

  return (
    <div className="rounded-lg border border-border/40 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-semibold">{label}</Label>
          <p className="text-[11px] text-muted-foreground">{hint}</p>
        </div>
        <Switch checked={isEnabled} onCheckedChange={onToggle} />
      </div>

      {isEnabled && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-xs text-muted-foreground w-[36px] shrink-0">Bom</span>
            <Input
              className="h-8 text-xs"
              placeholder="Ex: acima de 2x"
              value={current.good}
              onChange={(e) => update("good", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-amber-500 shrink-0" />
            <span className="text-xs text-muted-foreground w-[36px] shrink-0">Médio</span>
            <Input
              className="h-8 text-xs"
              placeholder="Ex: entre 1.5x e 2x"
              value={current.average}
              onChange={(e) => update("average", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-red-500 shrink-0" />
            <span className="text-xs text-muted-foreground w-[36px] shrink-0">Ruim</span>
            <Input
              className="h-8 text-xs"
              placeholder="Ex: abaixo de 1.5x"
              value={current.bad}
              onChange={(e) => update("bad", e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
