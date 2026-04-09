import { RiSettings3Line } from "@remixicon/react";
import { StripeFeatureCard } from "./components/StripeFeatureCard";
import { ResetSalesCard } from "./components/ResetSalesCard";

export default function AdvancedSettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2.5">
          <RiSettings3Line className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Opções Avançadas
          </h1>
          <p className="text-sm text-muted-foreground">
            Habilite ou desabilite módulos avançados do sistema
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StripeFeatureCard />
        <ResetSalesCard />
      </div>
    </div>
  );
}
