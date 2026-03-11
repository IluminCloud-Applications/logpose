import { useState } from "react";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { allColumns, type ColumnPreset } from "./columnPresets";
import { RiDraggable } from "@remixicon/react";

interface PresetDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (preset: ColumnPreset) => void | Promise<void>;
}

export function PresetDrawer({ open, onOpenChange, onSave }: PresetDrawerProps) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>(["name"]);

  const toggleColumn = (col: string) => {
    if (col === "name") return; // name is always included
    setSelected((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const handleSave = () => {
    if (!name.trim() || selected.length < 2) return;
    onSave({
      id: crypto.randomUUID().slice(0, 8),
      name: name.trim(),
      columns: selected,
    });
    setName("");
    setSelected(["name"]);
    onOpenChange(false);
  };

  const availableCols = Object.entries(allColumns).filter(([key]) => key !== "name");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[380px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Nova Predefinição</SheetTitle>
          <SheetDescription>
            Selecione as colunas e a ordem para criar uma visualização personalizada
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="preset-name" className="text-xs">Nome</Label>
            <Input
              id="preset-name"
              placeholder="Ex: Minha Análise"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">
              Colunas ({selected.length - 1} selecionadas)
            </Label>
            <div className="space-y-1 rounded-lg border border-border/40 p-2">
              {availableCols.map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <Checkbox
                    checked={selected.includes(key)}
                    onCheckedChange={() => toggleColumn(key)}
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <RiDraggable className="size-3.5 text-muted-foreground/40" />
                    <span className="text-sm">{label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter className="pt-4 border-t border-border/40">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || selected.length < 2}>
            Salvar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
