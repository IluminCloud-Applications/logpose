

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RiAddLine, RiCloseLine } from "@remixicon/react";
import type { FunnelProduct } from "@/services/funnel";
import { CompareBarChart } from "./CompareBarChart";

import type { ExtraSlot } from "../index";

interface FunnelCompareProps {
  products: { id: string; name: string }[];
  leftProductId: string;
  rightProductId: string;
  onLeftChange: (id: string) => void;
  onRightChange: (id: string) => void;
  funnels: FunnelProduct[];
  anchor: string;
  extraSlots: ExtraSlot[];
  setExtraSlots: React.Dispatch<React.SetStateAction<ExtraSlot[]>>;
}

export function FunnelCompare({
  products, leftProductId, rightProductId,
  onLeftChange, onRightChange, funnels, anchor,
  extraSlots, setExtraSlots,
}: FunnelCompareProps) {

  const addSlot = () => {
    if (extraSlots.length >= 2) return;
    const label = extraSlots.length === 0 ? "C" : "D";
    const usedIds = [leftProductId, rightProductId, ...extraSlots.map((s) => s.productId)];
    const available = products.find((p) => !usedIds.includes(p.id));
    setExtraSlots((prev) => [
      ...prev,
      { id: label, productId: available?.id || products[0]?.id || "" },
    ]);
  };

  const removeSlot = (idx: number) => {
    setExtraSlots((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateSlot = (idx: number, productId: string) => {
    setExtraSlots((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, productId } : s)),
    );
  };

  const allSelectedIds = [
    leftProductId,
    rightProductId,
    ...extraSlots.map((s) => s.productId),
  ];
  const selectedFunnels = allSelectedIds
    .map((id) => funnels.find((f) => f.productId === id))
    .filter(Boolean) as FunnelProduct[];

  return (
    <div className="space-y-4">
      {/* Horizontal product selectors + Add button */}
      <div className="flex flex-wrap items-end gap-3 sm:gap-4 pb-2">
        <div className="min-w-[200px] max-w-[280px] flex-1 shrink-0">
          <ProductSelector
            label="Produto A"
            value={leftProductId}
            onChange={onLeftChange}
            products={products}
            allSelectedIds={allSelectedIds}
          />
        </div>
        
        <div className="min-w-[200px] max-w-[280px] flex-1 shrink-0">
          <ProductSelector
            label="Produto B"
            value={rightProductId}
            onChange={onRightChange}
            products={products}
            allSelectedIds={allSelectedIds}
          />
        </div>

        {extraSlots.map((slot, idx) => (
          <div key={slot.id} className="relative min-w-[200px] max-w-[280px] flex-1 shrink-0">
            <ProductSelector
              label={`Produto ${slot.id}`}
              value={slot.productId}
              onChange={(id) => updateSlot(idx, id)}
              products={products}
              allSelectedIds={allSelectedIds}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-0 right-0 size-6 text-muted-foreground hover:text-destructive"
              onClick={() => removeSlot(idx)}
            >
              <RiCloseLine className="size-3.5" />
            </Button>
          </div>
        ))}

        {/* Add product button inside the row */}
        {extraSlots.length < 2 && products.length > 2 && (
          <div className="pl-2 sm:pl-4 border-l border-border/20 ml-1 sm:ml-2 shrink-0">
            <Button
              variant="outline"
              className="h-9 gap-1.5 text-xs border-dashed text-muted-foreground hover:text-foreground"
              onClick={addSlot}
            >
              <RiAddLine className="size-3.5" />
              Adicionar {extraSlots.length === 0 ? "Produto C" : "Produto D"}
            </Button>
          </div>
        )}
      </div>

      {/* Compare bar chart */}
      <CompareBarChart
        funnels={selectedFunnels}
        anchor={anchor}
      />
    </div>
  );
}

function ProductSelector({
  label, value, onChange, products, allSelectedIds,
}: {
  label: string;
  value: string;
  onChange: (id: string) => void;
  products: { id: string; name: string }[];
  allSelectedIds?: string[];
}) {
  const availableProducts = allSelectedIds
    ? products.filter((p) => !allSelectedIds.includes(p.id) || p.id === value)
    : products;

  return (
    <div className="space-y-1.5 w-full">
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-full">
          <span className="truncate flex-1 text-left pr-2 text-sm">
            <SelectValue />
          </span>
        </SelectTrigger>
        <SelectContent>
          {availableProducts.map((p) => (
            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
