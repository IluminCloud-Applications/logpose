import { Button } from "@/components/ui/button";
import {
  RiCheckboxCircleLine, RiShoppingCart2Line, RiUser3Line,
  RiMoneyDollarCircleLine, RiArrowUpLine, RiAlertLine,
} from "@remixicon/react";
import type { ImportResultResponse } from "@/types/import";

interface Props {
  result: ImportResultResponse;
  onClose: () => void;
}

export function ImportStepResult({ result, onClose }: Props) {
  const hasErrors = result.errors.length > 0;

  return (
    <div className="space-y-5">
      {/* Ícone de sucesso */}
      <div className="flex flex-col items-center gap-2 py-3">
        <div className="rounded-full bg-[var(--color-success)]/10 p-3">
          <RiCheckboxCircleLine className="size-8 text-[var(--color-success)]" />
        </div>
        <p className="text-lg font-semibold">Importação Concluída!</p>
      </div>

      {/* Resumo de contadores */}
      <div className="grid grid-cols-2 gap-3">
        <ResultCard
          icon={<RiShoppingCart2Line className="size-4" />}
          label="Produtos criados"
          value={result.products_created}
        />
        <ResultCard
          icon={<RiUser3Line className="size-4" />}
          label="Clientes criados"
          value={result.customers_created}
        />
        <ResultCard
          icon={<RiMoneyDollarCircleLine className="size-4" />}
          label="Transações criadas"
          value={result.transactions_created}
        />
        <ResultCard
          icon={<RiArrowUpLine className="size-4" />}
          label="Upsells criados"
          value={result.upsells_created}
        />
      </div>

      {result.skipped_duplicates > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {result.skipped_duplicates} transações duplicadas ignoradas
        </p>
      )}

      {/* Erros */}
      {hasErrors && (
        <div className="rounded-lg bg-destructive/10 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-destructive text-sm font-medium">
            <RiAlertLine className="size-4" />
            {result.errors.length} avisos
          </div>
          <ul className="text-xs text-destructive/80 space-y-0.5 max-h-[100px] overflow-y-auto">
            {result.errors.map((err, i) => (
              <li key={i}>• {err}</li>
            ))}
          </ul>
        </div>
      )}

      <Button onClick={onClose} className="w-full">Fechar</Button>
    </div>
  );
}

function ResultCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3 text-center">
      <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
