import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RiDeleteBin2Line, RiAlertLine } from "@remixicon/react";
import { resetSales } from "@/services/advancedSettings";
import { toast } from "sonner";

const CONFIRM_WORD = "CONFIRMAR";

export function ResetSalesCard() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const isConfirmValid = confirmText === CONFIRM_WORD;

  const handleOpen = () => {
    setConfirmText("");
    setOpen(true);
  };

  const handleClose = () => {
    if (loading) return;
    setOpen(false);
    setConfirmText("");
  };

  const handleReset = async () => {
    if (!isConfirmValid) return;
    setLoading(true);
    try {
      await resetSales();
      setOpen(false);
      setConfirmText("");
      toast.success("Todos os dados foram resetados com sucesso.");
    } catch {
      toast.error("Erro ao resetar vendas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="border-destructive/30">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-destructive/10 p-2">
              <RiDeleteBin2Line className="size-5 text-destructive" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">Zona de Perigo</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ações irreversíveis que afetam todos os dados
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Resetar todos os dados</p>
              <p className="text-xs text-muted-foreground">
                Remove permanentemente vendas, produtos, recuperações e clientes
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleOpen}
              className="shrink-0 ml-4"
            >
              <RiDeleteBin2Line className="size-4 mr-1.5" />
              Resetar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="rounded-lg bg-destructive/10 p-2">
                <RiAlertLine className="size-5 text-destructive" />
              </div>
              <DialogTitle className="text-destructive">
                Resetar todos os dados
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm leading-relaxed">
              Esta ação é{" "}
              <span className="font-semibold text-foreground">
                permanente e irreversível
              </span>
              . Todos os dados serão apagados:
            </DialogDescription>
            <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 space-y-1">
              <li>Todas as transações (vendas, reembolsos, chargebacks)</li>
              <li>Todos os registros de recuperação</li>
              <li>Todos os clientes cadastrados</li>
              <li>Todos os produtos, checkouts, order bumps e upsells</li>
            </ul>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="reset-confirm" className="text-sm font-medium">
              Digite{" "}
              <span className="font-mono text-destructive font-bold">
                {CONFIRM_WORD}
              </span>{" "}
              para continuar:
            </Label>
            <Input
              id="reset-confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_WORD}
              className="font-mono border-destructive/40 focus-visible:ring-destructive/30"
              disabled={loading}
              autoComplete="off"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReset}
              disabled={!isConfirmValid || loading}
            >
              {loading ? "Resetando..." : "Resetar tudo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
