import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignName: string;
  currentBudget: number;
  onSave: (newBudget: number) => void;
}

export function BudgetModal({
  open,
  onOpenChange,
  campaignName,
  currentBudget,
  onSave,
}: BudgetModalProps) {
  const [value, setValue] = useState(String(currentBudget));

  useEffect(() => {
    if (open) setValue(String(currentBudget));
  }, [open, currentBudget]);

  const handleSave = () => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      onSave(num);
      onOpenChange(false);
    }
  };

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Alterar Orçamento</DialogTitle>
          <DialogDescription
            className="line-clamp-2 break-words"
            title={campaignName}
          >
            {campaignName}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-3">
          <div className="grid gap-2">
            <Label htmlFor="budget-value">Novo orçamento diário</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                R$
              </span>
              <Input
                id="budget-value"
                type="number"
                min={0}
                step={50}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="pl-10 tabular-nums"
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Orçamento atual: {fmt(currentBudget)}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
