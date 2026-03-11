import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reasonLabels, type ReasonStat } from "@/services/refunds";

interface TopReasonsCardProps {
  data: ReasonStat[];
}

export function TopReasonsCard({ data }: TopReasonsCardProps) {
  if (data.length === 0) {
    return (
      <Card className="border-border/40 border-dashed">
        <CardContent className="flex items-center justify-center py-10">
          <p className="text-sm text-muted-foreground">
            Nenhum motivo registrado ainda. Clique no ícone de edição na tabela para adicionar.
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Principais Motivos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((item, i) => {
          const pct = (item.count / maxCount) * 100;
          const label = reasonLabels[item.code] || item.code;
          return (
            <div key={item.code} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground truncate max-w-[220px]">
                  {i + 1}. {label}
                </span>
                <span className="font-medium tabular-nums">{item.count}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary/70 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
