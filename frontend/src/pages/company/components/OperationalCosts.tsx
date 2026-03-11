import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RiAddLine, RiDeleteBinLine, RiToolsLine } from "@remixicon/react";
import type { OperationalCost } from "@/data/mock-company";

interface OperationalCostsProps {
  costs: OperationalCost[];
  onCostsChange: (costs: OperationalCost[]) => void;
}

function fmt(v: number): string {
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });
}

export function OperationalCosts({ costs, onCostsChange }: OperationalCostsProps) {
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");

  const total = costs.reduce((s, c) => s + c.amount, 0);

  const handleAdd = () => {
    if (!newName.trim() || !newAmount.trim()) return;
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) return;
    const newCost: OperationalCost = {
      id: Date.now().toString(),
      name: newName.trim(),
      amount,
    };
    onCostsChange([...costs, newCost]);
    setNewName("");
    setNewAmount("");
  };

  const handleRemove = (id: string) => {
    onCostsChange(costs.filter((c) => c.id !== id));
  };

  const handleUpdateAmount = (id: string, value: string) => {
    const amount = parseFloat(value);
    if (isNaN(amount)) return;
    onCostsChange(costs.map((c) => (c.id === id ? { ...c, amount } : c)));
  };

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <RiToolsLine className="size-4 text-primary" />
          Custos Operacionais
        </CardTitle>
        <CardDescription>
          Gastos fixos mensais — subtraídos do cálculo de ROI e lucro real
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Existing costs */}
        <div className="space-y-2">
          {costs.map((cost) => (
            <div key={cost.id} className="flex items-center gap-2">
              <span className="flex-1 text-sm truncate">{cost.name}</span>
              <div className="relative w-32">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  R$
                </span>
                <Input
                  type="number"
                  value={cost.amount}
                  onChange={(e) => handleUpdateAmount(cost.id, e.target.value)}
                  className="pl-8 h-9 text-sm tabular-nums"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemove(cost.id)}
              >
                <RiDeleteBinLine className="size-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add new */}
        <div className="flex items-center gap-2 border-t border-border/30 pt-4">
          <Input
            placeholder="Nome do custo"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-9 text-sm flex-1"
          />
          <div className="relative w-28">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              R$
            </span>
            <Input
              type="number"
              placeholder="0"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="pl-8 h-9 text-sm tabular-nums"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="size-9"
            onClick={handleAdd}
          >
            <RiAddLine className="size-4" />
          </Button>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between border-t border-border/30 pt-3">
          <span className="text-sm font-medium text-muted-foreground">
            Total mensal
          </span>
          <span className="text-base font-bold tabular-nums">{fmt(total)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
