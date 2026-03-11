import { useState, useEffect, useCallback } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AccountIdBadges } from "./AccountIdBadges";

export interface AddAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (label: string, accountId: string, accessToken: string) => void;
  onBulkAdd?: (items: { label: string; account_id: string }[], accessToken: string) => void;
  isLoading?: boolean;
  prefillToken?: string;
}

export function AddAccountModal({
  open, onOpenChange, onAdd, onBulkAdd, isLoading, prefillToken,
}: AddAccountModalProps) {
  const [label, setLabel] = useState("");
  const [accountIds, setAccountIds] = useState<string[]>([]);
  const [accessToken, setAccessToken] = useState("");

  const isDuplicate = !!prefillToken;

  // Pre-fill token when duplicating
  useEffect(() => {
    if (open && prefillToken) {
      setAccessToken(prefillToken);
    }
  }, [open, prefillToken]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken.trim()) return;

    if (accountIds.length === 0) return;

    // Build items with auto-label if only 1, or indexed labels
    if (accountIds.length === 1) {
      const finalLabel = label.trim() || accountIds[0];
      onAdd(finalLabel, accountIds[0], accessToken.trim());
    } else if (onBulkAdd) {
      const items = accountIds.map((id, idx) => ({
        label: label.trim() ? `${label.trim()} (${idx + 1})` : id,
        account_id: id,
      }));
      onBulkAdd(items, accessToken.trim());
    }

    resetFields();
  }, [accessToken, accountIds, label, onAdd, onBulkAdd]);

  const resetFields = () => {
    setLabel("");
    setAccountIds([]);
    setAccessToken("");
  };

  const handleClose = (v: boolean) => {
    if (!v) resetFields();
    onOpenChange(v);
  };

  const canSubmit = accessToken.trim() && accountIds.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>
            {isDuplicate ? "Duplicar Conta" : "Adicionar Conta"}
          </DialogTitle>
          <DialogDescription>
            {isDuplicate
              ? "Adicione novas contas usando o mesmo Access Token"
              : "Insira os dados da sua conta de anúncios do Facebook"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fb-label">
              Nome de Identificação {accountIds.length > 1 && <span className="text-muted-foreground text-xs">(será numerado automaticamente)</span>}
            </Label>
            <Input
              id="fb-label"
              placeholder="Ex: Conta Principal"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <AccountIdBadges
            accountIds={accountIds}
            onChange={setAccountIds}
            disabled={isLoading}
          />
          <div className="space-y-2">
            <Label htmlFor="fb-token">Access Token</Label>
            <Input
              id="fb-token"
              type="password"
              placeholder="Cole o token de acesso"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              disabled={isLoading || isDuplicate}
              required
            />
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Parâmetro UTM
            </p>
            <code className="text-[10px] font-mono text-muted-foreground break-all">
              utm_source={"{{placement}}"}&utm_medium={"{{adset.name}}"}&utm_campaign={"{{campaign.name}}"}&utm_content={"{{ad.name}}"}
            </code>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)} disabled={isLoading}>Cancelar</Button>
            <Button type="submit" disabled={isLoading || !canSubmit}>
              {isLoading
                ? "Adicionando..."
                : accountIds.length > 1
                  ? `Adicionar ${accountIds.length} Contas`
                  : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
