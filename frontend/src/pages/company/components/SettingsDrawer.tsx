import { useState } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RiAddLine, RiDeleteBinLine, RiLoader4Line } from "@remixicon/react";
import type { CompanySettings, OperationalCost } from "@/types/company";

interface SettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: CompanySettings;
  onSettingsChange: (settings: CompanySettings) => void;
  saving: boolean;
}

function fmt(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}

export function SettingsDrawer({
  open, onOpenChange, settings, onSettingsChange, saving,
}: SettingsDrawerProps) {
  const [draft, setDraft] = useState<CompanySettings>(settings);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");

  // Sync draft when drawer opens
  const handleOpenChange = (v: boolean) => {
    if (v) setDraft(settings);
    onOpenChange(v);
  };

  const total = draft.operational_costs.reduce((s, c) => s + c.amount, 0);

  const handleTaxChange = (val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      setDraft({ ...draft, tax_rate: num });
    }
  };

  const handleAddCost = () => {
    if (!newName.trim() || !newAmount.trim()) return;
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) return;
    const newCost: OperationalCost = {
      id: Date.now().toString(),
      name: newName.trim(),
      amount,
    };
    setDraft({ ...draft, operational_costs: [...draft.operational_costs, newCost] });
    setNewName("");
    setNewAmount("");
  };

  const handleRemoveCost = (id: string) => {
    setDraft({
      ...draft,
      operational_costs: draft.operational_costs.filter((c) => c.id !== id),
    });
  };

  const handleUpdateAmount = (id: string, value: string) => {
    const amount = parseFloat(value);
    if (isNaN(amount)) return;
    setDraft({
      ...draft,
      operational_costs: draft.operational_costs.map((c) =>
        c.id === id ? { ...c, amount } : c
      ),
    });
  };

  const handleSave = () => {
    onSettingsChange(draft);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:max-w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Configurações da Empresa</SheetTitle>
          <SheetDescription>
            Defina impostos e custos para cálculos reais de lucro e ROI
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4 pb-6">
          {/* Tax Rate */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Taxa de Impostos</h3>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Input
                  type="number" step="0.1" min="0" max="100"
                  value={draft.tax_rate}
                  onChange={(e) => handleTaxChange(e.target.value)}
                  className="pr-8 h-11 text-lg font-semibold tabular-nums"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">%</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-muted/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-destructive/70 transition-all duration-500"
                  style={{ width: `${Math.min(draft.tax_rate, 100)}%` }}
                />
              </div>
              <span className="text-xs font-semibold tabular-nums text-muted-foreground w-12 text-right">
                {draft.tax_rate}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Simples Nacional ≈ 6-15,5% · Lucro Presumido ≈ 11-16%
            </p>
          </div>

          <Separator />

          {/* Operational Costs */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Custos Operacionais</h3>
            <p className="text-xs text-muted-foreground">
              Gastos fixos mensais subtraídos do cálculo de ROI e lucro
            </p>

            <div className="space-y-2">
              {draft.operational_costs.map((cost) => (
                <div key={cost.id} className="flex items-center gap-2">
                  <span className="flex-1 text-sm truncate">{cost.name}</span>
                  <div className="relative w-28">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">R$</span>
                    <Input
                      type="number" value={cost.amount}
                      onChange={(e) => handleUpdateAmount(cost.id, e.target.value)}
                      className="pl-7 h-9 text-sm tabular-nums"
                    />
                  </div>
                  <Button
                    variant="ghost" size="icon"
                    className="size-9 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => handleRemoveCost(cost.id)}
                  >
                    <RiDeleteBinLine className="size-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 border-t border-border/30 pt-3">
              <Input
                placeholder="Nome do custo" value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-9 text-sm flex-1"
              />
              <div className="relative w-24">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">R$</span>
                <Input
                  type="number" placeholder="0" value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="pl-7 h-9 text-sm tabular-nums"
                  onKeyDown={(e) => e.key === "Enter" && handleAddCost()}
                />
              </div>
              <Button variant="outline" size="icon" className="size-9 shrink-0" onClick={handleAddCost}>
                <RiAddLine className="size-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between border-t border-border/30 pt-3">
              <span className="text-sm font-medium text-muted-foreground">Total mensal</span>
              <span className="text-base font-bold tabular-nums">{fmt(total)}</span>
            </div>
          </div>

          <Separator />

          {/* Save button */}
          <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
            {saving && <RiLoader4Line className="size-4 animate-spin" />}
            {saving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
