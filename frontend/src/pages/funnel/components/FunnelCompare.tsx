import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { FunnelProduct } from "@/services/funnel";

function formatNumber(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return v.toLocaleString("pt-BR");
}

const stageColors = [
  { bg: "#1e3a5f", text: "#e8f0fe" },
  { bg: "#1d4e7e", text: "#e0ecf9" },
  { bg: "#1a6493", text: "#d6e8f5" },
  { bg: "#1878a6", text: "#cce3f0" },
  { bg: "#178db5", text: "#c0dfeb" },
  { bg: "#17a2b8", text: "#b5dce5" },
  { bg: "#20b1b0", text: "#aad8d8" },
  { bg: "#2cc4a4", text: "#a0d4cc" },
  { bg: "#3cd194", text: "#97d0c0" },
  { bg: "#4ede84", text: "#8eccb4" },
];

interface FunnelCompareProps {
  products: { id: string; name: string }[];
  leftProductId: string;
  rightProductId: string;
  onLeftChange: (id: string) => void;
  onRightChange: (id: string) => void;
  funnels: FunnelProduct[];
  anchor: string;
}

export function FunnelCompare({
  products, leftProductId, rightProductId,
  onLeftChange, onRightChange, funnels, anchor,
}: FunnelCompareProps) {
  const left = funnels.find((f) => f.productId === leftProductId);
  const right = funnels.find((f) => f.productId === rightProductId);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Produto A</Label>
          <Select value={leftProductId} onValueChange={onLeftChange}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Produto B</Label>
          <Select value={rightProductId} onValueChange={onRightChange}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[left, right].map((funnel, fi) =>
          funnel ? (
            <CompactFunnel key={funnel.productId} funnel={funnel} anchor={anchor} />
          ) : (
            <Card key={fi} className="border-border/40 border-dashed">
              <CardContent className="flex items-center justify-center py-16">
                <p className="text-sm text-muted-foreground">Selecione um produto</p>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}

function CompactFunnel({ funnel, anchor }: { funnel: FunnelProduct; anchor: string }) {
  const stages = funnel.stages;
  const total = stages.length;

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-sm font-semibold">{funnel.productName}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-1">
        {stages.map((stage, i) => {
          const widthPercent = 100 - ((i / Math.max(total - 1, 1)) * 65);
          const prev = i > 0
            ? (anchor === "previous" ? stages[i - 1]?.value : stages.find((s) => s.name === anchor)?.value)
            : null;
          const conversion = prev ? ((stage.value / prev) * 100) : null;
          const color = stageColors[i % stageColors.length];

          return (
            <div key={stage.name} className="flex items-center gap-2 w-full">
              <div
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-[12px] transition-all"
                style={{ width: `${widthPercent}%`, backgroundColor: color.bg, color: color.text }}
              >
                <span className="font-medium truncate">{stage.name}</span>
                <span className="font-bold tabular-nums ml-2">{formatNumber(stage.value)}</span>
              </div>
              {conversion !== null && (
                <span className={`text-[10px] font-bold tabular-nums whitespace-nowrap ${
                  conversion >= 50 ? "text-emerald-600 dark:text-emerald-400" :
                  conversion >= 20 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"
                }`}>
                  {conversion.toFixed(2)}%
                </span>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
