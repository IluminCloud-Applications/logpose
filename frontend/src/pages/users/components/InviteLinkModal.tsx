import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RiFileCopyLine, RiCheckLine } from "@remixicon/react";

interface InviteLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inviteToken: string;
  userName: string;
}

export function InviteLinkModal({
  open, onOpenChange, inviteToken, userName,
}: InviteLinkModalProps) {
  const [copied, setCopied] = useState(false);

  const inviteUrl = `${window.location.origin}/setup?invite=${inviteToken}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.getElementById("invite-link") as HTMLInputElement;
      input?.select();
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Convite Criado</DialogTitle>
          <DialogDescription>
            Envie o link abaixo para <span className="font-medium text-foreground">{userName}</span> para
            que configure sua conta.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="flex gap-2">
            <Input
              id="invite-link"
              value={inviteUrl}
              readOnly
              className="text-sm font-mono"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <RiCheckLine className="size-4 text-[var(--color-success)]" />
              ) : (
                <RiFileCopyLine className="size-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Este link permite que o convidado defina seu email e senha. Ele será
            invalidado após o primeiro uso.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
