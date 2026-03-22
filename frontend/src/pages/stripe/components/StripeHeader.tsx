import { RiBankCardLine, RiAddCircleLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";

interface StripeHeaderProps {
  onAddAccount: () => void;
}

export function StripeHeader({ onAddAccount }: StripeHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-indigo-500/10 p-2.5">
          <RiBankCardLine className="size-5 text-indigo-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stripe</h1>
          <p className="text-sm text-muted-foreground">
            Conecte sua conta Stripe para visualizar dados de assinatura
          </p>
        </div>
      </div>
      <Button onClick={onAddAccount} className="gap-1.5 h-9">
        <RiAddCircleLine className="size-4" />
        Adicionar Conta
      </Button>
    </div>
  );
}
