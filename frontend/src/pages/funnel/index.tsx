import { useState } from "react";
import { FunnelHeader } from "./components/FunnelHeader";
import { FunnelChart } from "./components/FunnelChart";
import { FunnelStats } from "./components/FunnelStats";
import { FunnelCompare } from "./components/FunnelCompare";
import { useFunnel } from "@/hooks/useFunnel";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import type { DatePreset } from "@/components/DateFilter";

type ViewMode = "single" | "compare";
type AnchorMode = "previous" | string;

export default function FunnelPage() {
  const [datePreset, setDatePreset] = useState<DatePreset>("today");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  const { funnels, isLoading } = useFunnel({
    preset: datePreset,
    dateStart: datePreset === "custom" ? dateStart : undefined,
    dateEnd: datePreset === "custom" ? dateEnd : undefined,
  });

  const [selectedProduct, setSelectedProduct] = useState("");
  const [compareProduct, setCompareProduct] = useState("");
  const [anchor, setAnchor] = useState<AnchorMode>("previous");
  const [viewMode, setViewMode] = useState<ViewMode>("single");

  // Select first product when data loads
  const effectiveSelected = selectedProduct || funnels[0]?.productId || "";
  const effectiveCompare = compareProduct || funnels[1]?.productId || "";

  const currentFunnel = funnels.find((f) => f.productId === effectiveSelected);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (funnels.length === 0) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <FunnelHeader
          products={[]}
          selectedProduct=""
          onProductChange={() => {}}
          anchor={anchor}
          onAnchorChange={setAnchor}
          stages={[]}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          datePreset={datePreset}
          dateStart={dateStart}
          dateEnd={dateEnd}
          onDatePresetChange={setDatePreset}
          onDateStartChange={setDateStart}
          onDateEndChange={setDateEnd}
        />
        <Card className="border-border/40 border-dashed">
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-sm text-muted-foreground">
              Nenhum produto cadastrado. Cadastre produtos para ver o funil.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <FunnelHeader
        products={funnels.map((f) => ({ id: f.productId, name: f.productName }))}
        selectedProduct={effectiveSelected}
        onProductChange={setSelectedProduct}
        anchor={anchor}
        onAnchorChange={setAnchor}
        stages={currentFunnel?.stages.map((s) => s.name) || []}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        datePreset={datePreset}
        dateStart={dateStart}
        dateEnd={dateEnd}
        onDatePresetChange={setDatePreset}
        onDateStartChange={setDateStart}
        onDateEndChange={setDateEnd}
      />
      {viewMode === "single" && currentFunnel && (
        <>
          <FunnelChart funnel={currentFunnel} anchor={anchor} />
          <FunnelStats funnels={funnels} />
        </>
      )}
      {viewMode === "compare" && (
        <FunnelCompare
          products={funnels.map((f) => ({ id: f.productId, name: f.productName }))}
          leftProductId={effectiveSelected}
          rightProductId={effectiveCompare}
          onLeftChange={setSelectedProduct}
          onRightChange={setCompareProduct}
          funnels={funnels}
          anchor={anchor}
        />
      )}
    </div>
  );
}
