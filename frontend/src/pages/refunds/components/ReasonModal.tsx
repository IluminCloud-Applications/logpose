import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { RiCheckLine } from "@remixicon/react";
import {
  REFUND_REASON_OPTIONS,
  saveRefundReason,
  type RefundItem,
} from "@/services/refunds";

interface ReasonModalProps {
  item: RefundItem | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ReasonModal({ item, onClose, onSaved }: ReasonModalProps) {
  const [selected, setSelected] = useState<string>("");
  const [customText, setCustomText] = useState("");
  const [saving, setSaving] = useState(false);

  // Pre-fill if item already has a reason
  useEffect(() => {
    if (item) {
      setSelected(item.reason_code || "");
      setCustomText(item.reason_text || "");
    }
  }, [item]);

  const handleSave = async () => {
    if (!item || !selected) return;
    setSaving(true);
    try {
      await saveRefundReason({
        transaction_id: item.id,
        reason_code: selected,
        reason_text: selected === "other" ? customText : null,
      });
      onSaved();
      onClose();
    } catch {
      // error handled silently
    } finally {
      setSaving(false);
    }
  };

  const isChargeback = item?.status === "chargeback";

  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {item?.reason_code ? "Editar Motivo" : "Registrar Motivo"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {isChargeback ? "Chargeback" : "Reembolso"} de{" "}
            <span className="font-medium text-foreground">
              R$ {item?.amount.toFixed(2)}
            </span>
            {item?.product_name && (
              <> — {item.product_name}</>
            )}
          </p>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Selecione o motivo
          </Label>
          <div className="space-y-1.5">
            {REFUND_REASON_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                onClick={() => setSelected(opt.code)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm text-left transition-all duration-150",
                  selected === opt.code
                    ? "border-primary/50 bg-primary/5 text-foreground"
                    : "border-border/50 hover:border-border hover:bg-muted/30 text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                    selected === opt.code
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/30"
                  )}
                >
                  {selected === opt.code && (
                    <RiCheckLine className="size-3 text-primary-foreground" />
                  )}
                </div>
                <span className={selected === opt.code ? "font-medium" : ""}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>

          {selected === "other" && (
            <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-150">
              <Label className="text-xs">Descreva o motivo</Label>
              <Textarea
                placeholder="Digite o motivo do reembolso..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selected || saving || (selected === "other" && !customText.trim())}
          >
            {saving ? "Salvando..." : "Salvar Motivo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
