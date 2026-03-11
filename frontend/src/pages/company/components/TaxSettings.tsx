import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RiPercentLine } from "@remixicon/react";

interface TaxSettingsProps {
  taxRate: number;
  onTaxChange: (rate: number) => void;
}

export function TaxSettings({ taxRate, onTaxChange }: TaxSettingsProps) {
  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <RiPercentLine className="size-4 text-primary" />
          Taxa de Impostos
        </CardTitle>
        <CardDescription>
          Defina o percentual de impostos para calcular o lucro líquido real
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-[200px]">
            <Input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={taxRate}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val >= 0 && val <= 100) {
                  onTaxChange(val);
                }
              }}
              className="pr-8 h-11 text-lg font-semibold tabular-nums"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              %
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>
              Impostos sobre o faturamento bruto.
            </p>
            <p className="text-xs mt-1">
              Exemplo: Simples Nacional ≈ 6-15,5%
            </p>
          </div>
        </div>

        {/* Visual indicator */}
        <div className="mt-5 flex items-center gap-3">
          <div className="flex-1 h-2.5 rounded-full bg-muted/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-destructive/70 transition-all duration-500"
              style={{ width: `${Math.min(taxRate, 100)}%` }}
            />
          </div>
          <span className="text-xs font-semibold tabular-nums text-muted-foreground w-12 text-right">
            {taxRate}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
