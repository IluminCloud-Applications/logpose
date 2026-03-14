import { Input } from "@/components/ui/input";
import type { KpiColorEntry } from "@/types/company";

interface KpiColorSectionProps {
  entry: KpiColorEntry;
  onChange: (entry: KpiColorEntry) => void;
}

const COLORS = [
  { key: "green" as const, label: "Verde", dot: "bg-emerald-500" },
  { key: "yellow" as const, label: "Amarelo", dot: "bg-amber-500" },
  { key: "red" as const, label: "Vermelho", dot: "bg-red-500" },
];

export function KpiColorSection({ entry, onChange }: KpiColorSectionProps) {
  const updateThreshold = (
    color: "green" | "yellow" | "red",
    field: "min" | "max",
    raw: string,
  ) => {
    const value = raw === "" ? null : parseFloat(raw);
    onChange({
      ...entry,
      [color]: {
        ...entry[color],
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-2">
      {COLORS.map(({ key, label, dot }) => (
        <div key={key} className="flex items-center gap-2">
          <div className={`size-2.5 rounded-full ${dot} shrink-0`} />
          <span className="text-xs text-muted-foreground w-[60px] shrink-0">
            {label}
          </span>
          <div className="flex items-center gap-1.5 flex-1">
            <Input
              type="number"
              step="0.1"
              placeholder="Mín"
              className="h-8 text-xs font-mono"
              value={entry[key].min ?? ""}
              onChange={(e) => updateThreshold(key, "min", e.target.value)}
            />
            <span className="text-xs text-muted-foreground">—</span>
            <Input
              type="number"
              step="0.1"
              placeholder="Máx"
              className="h-8 text-xs font-mono"
              value={entry[key].max ?? ""}
              onChange={(e) => updateThreshold(key, "max", e.target.value)}
            />
          </div>
        </div>
      ))}
      <p className="text-[10px] text-muted-foreground/70 pl-[72px]">
        Deixe vazio para sem limite
      </p>
    </div>
  );
}
