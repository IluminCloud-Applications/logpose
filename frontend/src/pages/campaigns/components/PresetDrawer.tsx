import { useState, useEffect } from "react";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { allColumns, type ColumnPreset } from "./columnPresets";
import { SortableColumnList } from "./SortableColumnList";

interface PresetDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (preset: ColumnPreset) => void | Promise<void>;
  editingPreset?: ColumnPreset | null;
}

export function PresetDrawer({ open, onOpenChange, onSave, editingPreset }: PresetDrawerProps) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>(["name"]);

  // Reset / populate when opening
  useEffect(() => {
    if (open && editingPreset) {
      setName(editingPreset.name);
      setSelected(editingPreset.columns);
    } else if (open) {
      setName("");
      setSelected(["name"]);
    }
  }, [open, editingPreset]);

  const toggleColumn = (col: string) => {
    if (col === "name") return;
    setSelected((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const handleSave = () => {
    if (!name.trim() || selected.length < 2) return;
    onSave({
      id: editingPreset?.id ?? crypto.randomUUID().slice(0, 8),
      name: name.trim(),
      columns: selected,
    });
    setName("");
    setSelected(["name"]);
    onOpenChange(false);
  };

  const availableCols = Object.entries(allColumns).filter(([key]) => key !== "name");
  const isEditing = !!editingPreset;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[380px] flex flex-col">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar Predefinição" : "Nova Predefinição"}</SheetTitle>
          <SheetDescription>
            Selecione as colunas e a ordem para criar uma visualização personalizada
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4 px-4">
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
              {availableCols.map(([key, label]) => {
                const isChecked = selected.includes(key);
                return (
                  <label
                    key={key}
                    className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/40 transition-colors cursor-pointer"
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => toggleColumn(key)}
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <SelectedColumnsOrder
            selected={selected}
            onReorder={setSelected}
          />
        </div>

        <SheetFooter className="pt-4 border-t border-border/40 px-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || selected.length < 2}>
            {isEditing ? "Atualizar" : "Salvar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/** Shows the selected columns in their current order with drag-and-drop reordering */
function SelectedColumnsOrder({
  selected,
  onReorder,
}: {
  selected: string[];
  onReorder: (cols: string[]) => void;
}) {
  // Only show non-"name" columns
  const orderedCols = selected.filter((c) => c !== "name");
  if (orderedCols.length === 0) return null;

  return (
    <div className="space-y-2">
      <Label className="text-xs">Ordem das colunas (arraste para reordenar)</Label>
      <SortableColumnList
        items={orderedCols}
        onReorder={(newOrder: string[]) => onReorder(["name", ...newOrder])}
      />
    </div>
  );
}
