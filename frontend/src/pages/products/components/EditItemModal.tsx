import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RiDeleteBinLine } from "@remixicon/react";
import { CheckoutFields, NonCheckoutFields } from "./EditItemFields";

export type ItemType = "checkout" | "orderBump" | "upsell";

export interface EditItemData {
  productId: number;
  itemId: number;
  type: ItemType;
  url?: string;
  name?: string;
  externalId?: string;
  price: number;
  platform?: "kiwify" | "payt";
  checkoutCode?: string | null;
  checkoutName?: string | null;
}

interface EditItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    productId: number,
    itemId: number,
    type: ItemType,
    data: Record<string, unknown>,
  ) => Promise<void>;
  onDelete?: (productId: number, itemId: number, type: ItemType) => void;
  item: EditItemData | null;
}

const typeLabels: Record<ItemType, string> = {
  checkout: "Checkout",
  orderBump: "Order Bump",
  upsell: "Upsell",
};

export function EditItemModal({ open, onOpenChange, onSave, onDelete, item }: EditItemModalProps) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [checkoutName, setCheckoutName] = useState("");
  const [externalId, setExternalId] = useState("");
  const [price, setPrice] = useState("");
  const [platform, setPlatform] = useState("kiwify");
  const [checkoutCode, setCheckoutCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setUrl(item.url ?? "");
      setName(item.name ?? "");
      setCheckoutName(item.checkoutName ?? "");
      setExternalId(item.externalId ?? "");
      setPrice(String(item.price ?? 0));
      setPlatform(item.platform ?? "kiwify");
      setCheckoutCode(item.checkoutCode ?? "");
    }
  }, [item]);

  const isCheckout = item?.type === "checkout";
  const isPaytCheckout = isCheckout && platform === "payt";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    setLoading(true);
    try {
      const data = buildUpdateData();
      await onSave(item.productId, item.itemId, item.type, data);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const buildUpdateData = (): Record<string, unknown> => {
    if (isCheckout) {
      return {
        url: url.trim(),
        price: Number(price) || 0,
        platform,
        checkout_code: isPaytCheckout ? checkoutCode.trim() || null : null,
        name: checkoutName.trim() || null,
      };
    }
    return {
      external_id: externalId.trim() || null,
      name: name.trim(),
      price: Number(price) || 0,
    };
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Editar {typeLabels[item.type]}</DialogTitle>
          <DialogDescription>
            Altere os dados do {typeLabels[item.type].toLowerCase()}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isCheckout ? (
            <CheckoutFields
              url={url} setUrl={setUrl}
              platform={platform} setPlatform={setPlatform}
              checkoutCode={checkoutCode} setCheckoutCode={setCheckoutCode}
              isPayt={isPaytCheckout}
              name={checkoutName} setName={setCheckoutName}
            />
          ) : (
            <NonCheckoutFields
              externalId={externalId} setExternalId={setExternalId}
              name={name} setName={setName}
            />
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-price">Preço (R$)</Label>
            <Input
              id="edit-price" type="number" step="0.01"
              placeholder="0" value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>

        {onDelete && (
          <div className="border-t border-border/40 pt-4 mt-2">
            <Button
              type="button"
              variant="ghost"
              className="w-full gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                onDelete(item.productId, item.itemId, item.type);
                onOpenChange(false);
              }}
            >
              <RiDeleteBinLine className="size-3.5" />
              Remover {typeLabels[item.type]}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
