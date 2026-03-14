import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RiCheckLine } from "@remixicon/react";

const PLATFORMS = [
  { value: "kiwify", label: "Kiwify" },
  { value: "payt", label: "PayT" },
];

interface DefinePlatformModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignName: string;
  currentPlatformId?: string;
  onSave: (referenceId: string, referenceLabel: string) => Promise<void>;
}

export function DefinePlatformModal({
  open, onOpenChange, campaignName,
  currentPlatformId, onSave,
}: DefinePlatformModalProps) {
  const [selectedId, setSelectedId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && currentPlatformId) setSelectedId(currentPlatformId);
    else setSelectedId("");
  }, [open, currentPlatformId]);

  const handleSave = async () => {
    if (!selectedId) return;
    const platform = PLATFORMS.find((p) => p.value === selectedId);
    if (!platform) return;
    setSaving(true);
    await onSave(platform.value, platform.label);
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Definir Plataforma</DialogTitle>
          <DialogDescription className="truncate">
            {campaignName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1 border rounded-md p-2">
          {PLATFORMS.map((p) => {
            const isSelected = p.value === selectedId;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => setSelectedId(p.value)}
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors ${
                  isSelected
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isSelected && <RiCheckLine className="size-4 shrink-0" />}
                  <span className="font-medium">{p.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!selectedId || saving}>
            {saving ? "Salvando..." : "Definir Plataforma"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
