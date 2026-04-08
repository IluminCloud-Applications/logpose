import { useState } from "react";
import { FunnelHeader, type FunnelViewMode } from "./components/FunnelHeader";
import { FunnelChart } from "./components/FunnelChart";
import { FunnelStats } from "./components/FunnelStats";
import { FunnelCompare } from "./components/FunnelCompare";
import { RecoveryFunnelChart } from "./components/RecoveryFunnelChart";
import { RecoveryFunnelStats } from "./components/RecoveryFunnelStats";
import { useFunnel } from "@/hooks/useFunnel";
import { useRecoveryFunnel } from "@/hooks/useRecoveryFunnel";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import type { DatePreset } from "@/components/DateFilter";

type AnchorMode = "previous" | string;

export interface ExtraSlot {
  id: string;
  productId: string;
}

export default function FunnelPage() {
  const [datePreset, setDatePreset] = useState<DatePreset>("today");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  const dateParams = {
    preset: datePreset,
    dateStart: datePreset === "custom" ? dateStart : undefined,
    dateEnd: datePreset === "custom" ? dateEnd : undefined,
  };

  const { funnels, isLoading } = useFunnel(dateParams);
  const {
    funnels: recoveryFunnels,
    isLoading: recoveryLoading,
  } = useRecoveryFunnel({ ...dateParams, enabled: true });

  const [selectedProduct, setSelectedProduct] = useState("");
  const [compareProduct, setCompareProduct] = useState("");
  const [anchor, setAnchor] = useState<AnchorMode>("previous");
  const [viewMode, setViewMode] = useState<FunnelViewMode>("conversion");
  const [extraSlots, setExtraSlots] = useState<ExtraSlot[]>([]);

  const activeFunnels = viewMode === "recovery" ? recoveryFunnels : funnels;
  const activeLoading = viewMode === "recovery" ? recoveryLoading : isLoading;

  const effectiveSelected = selectedProduct || activeFunnels[0]?.productId || "";
  const effectiveCompare = compareProduct || funnels[1]?.productId || "";

  const currentFunnel = activeFunnels.find(
    (f) => f.productId === effectiveSelected,
  );

  const currentConversionFunnel = funnels.find(
    (f) => f.productId === effectiveSelected,
  );

  if (activeLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const products = activeFunnels.map((f) => ({
    id: f.productId,
    name: f.productName,
  }));

  const stages = currentConversionFunnel?.stages.map((s) => s.name) || [];

  return (
    <div className="flex flex-col gap-6 p-6">
      <FunnelHeader
        products={products}
        selectedProduct={effectiveSelected}
        onProductChange={setSelectedProduct}
        anchor={anchor}
        onAnchorChange={setAnchor}
        stages={stages}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        datePreset={datePreset}
        dateStart={dateStart}
        dateEnd={dateEnd}
        onDatePresetChange={setDatePreset}
        onDateStartChange={setDateStart}
        onDateEndChange={setDateEnd}
      />

      {activeFunnels.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {viewMode === "conversion" && currentFunnel && (
            <>
              <FunnelChart funnel={currentFunnel} anchor={anchor} />
              <FunnelStats funnels={funnels} />
            </>
          )}

          {viewMode === "recovery" && currentFunnel && (
            <>
              <RecoveryFunnelChart funnel={currentFunnel} />
              <RecoveryFunnelStats funnels={recoveryFunnels} />
            </>
          )}

          {viewMode === "compare" && (
            <FunnelCompare
              products={funnels.map((f) => ({
                id: f.productId,
                name: f.productName,
              }))}
              leftProductId={effectiveSelected}
              rightProductId={effectiveCompare}
              onLeftChange={setSelectedProduct}
              onRightChange={setCompareProduct}
              funnels={funnels}
              anchor={anchor}
              extraSlots={extraSlots}
              setExtraSlots={setExtraSlots}
            />
          )}
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="border-border/40 border-dashed">
      <CardContent className="flex items-center justify-center py-16">
        <p className="text-sm text-muted-foreground">
          Nenhum produto cadastrado. Cadastre produtos para ver o funil.
        </p>
      </CardContent>
    </Card>
  );
}
