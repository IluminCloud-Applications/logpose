import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RiBankCardLine } from "@remixicon/react";
import { useAdvancedFeatures } from "@/contexts/AdvancedFeaturesContext";
import { toast } from "sonner";

export function StripeFeatureCard() {
  const { features, toggleStripe } = useAdvancedFeatures();
  const [saving, setSaving] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setSaving(true);
    try {
      await toggleStripe(checked);
      toast.success(
        checked
          ? "Stripe habilitado com sucesso"
          : "Stripe desabilitado com sucesso"
      );
    } catch {
      toast.error("Erro ao atualizar configuração");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-violet-500/10 p-2">
            <RiBankCardLine className="size-5 text-violet-500" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base">Stripe</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Gerencie cobranças recorrentes e assinaturas
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-lg border border-border/50 p-4">
          <div className="space-y-0.5">
            <Label htmlFor="stripe-toggle" className="text-sm font-medium">
              Habilitar módulo Stripe
            </Label>
            <p className="text-xs text-muted-foreground">
              Exibe as páginas de Stripe e Assinaturas na barra lateral
            </p>
          </div>
          <Switch
            id="stripe-toggle"
            checked={features.stripe_enabled}
            onCheckedChange={handleToggle}
            disabled={saving}
          />
        </div>
      </CardContent>
    </Card>
  );
}
