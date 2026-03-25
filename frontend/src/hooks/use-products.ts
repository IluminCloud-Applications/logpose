import { useCallback } from "react";
import type { ProductView } from "@/types/product";
import {
  fetchProductsWithStats,
  createProduct as apiCreateProduct,
  deleteProduct as apiDeleteProduct,
  updateProduct as apiUpdateProduct,
  createCheckout, createOrderBump, createUpsell,
  deleteCheckout, deleteOrderBump, deleteUpsell,
  updateCheckout, updateOrderBump, updateUpsell,
} from "@/services/products";
import { useCachedQuery } from "./useCachedQuery";
import { invalidateCacheByPrefix } from "@/lib/queryCache";

interface NewItemData {
  type: "checkout" | "orderBump" | "upsell";
  externalId: string;
  name: string;
  price: number;
  platform?: string;
  checkoutCode?: string;
  checkoutName?: string;
}

export function useProducts() {
  const { data, isLoading: loading, error, reload } = useCachedQuery<ProductView[]>({
    cachePrefix: "products",
    queryFn: fetchProductsWithStats,
  });

  const invalidateAndReload = useCallback(async () => {
    invalidateCacheByPrefix("products");
    await reload();
  }, [reload]);

  const addProduct = async (productData: { name: string; logo_url?: string | null }) => {
    await apiCreateProduct({ name: productData.name, logo_url: productData.logo_url });
    await invalidateAndReload();
  };

  const removeProduct = async (productId: number) => {
    await apiDeleteProduct(productId);
    await invalidateAndReload();
  };

  const editProduct = async (productId: number, data: { name?: string; logo_url?: string | null }) => {
    await apiUpdateProduct(productId, data);
    await invalidateAndReload();
  };

  const addItem = async (productId: number, itemData: NewItemData) => {
    if (itemData.type === "checkout") {
      await createCheckout(productId, {
        url: itemData.externalId,
        price: itemData.price,
        platform: itemData.platform ?? "kiwify",
        checkout_code: itemData.checkoutCode || null,
        name: itemData.checkoutName || null,
      });
    } else if (itemData.type === "orderBump") {
      await createOrderBump(productId, {
        external_id: itemData.externalId,
        name: itemData.name || itemData.externalId,
        price: itemData.price,
      });
    } else {
      await createUpsell(productId, {
        external_id: itemData.externalId,
        name: itemData.name || itemData.externalId,
        price: itemData.price,
      });
    }
    await invalidateAndReload();
  };

  const removeItem = async (
    productId: number,
    itemId: number,
    type: "checkout" | "orderBump" | "upsell",
  ) => {
    if (type === "checkout") await deleteCheckout(productId, itemId);
    else if (type === "orderBump") await deleteOrderBump(productId, itemId);
    else await deleteUpsell(productId, itemId);
    await invalidateAndReload();
  };

  const editItem = async (
    productId: number,
    itemId: number,
    type: "checkout" | "orderBump" | "upsell",
    data: Record<string, unknown>,
  ) => {
    if (type === "checkout") await updateCheckout(productId, itemId, data as Parameters<typeof updateCheckout>[2]);
    else if (type === "orderBump") await updateOrderBump(productId, itemId, data as Parameters<typeof updateOrderBump>[2]);
    else await updateUpsell(productId, itemId, data as Parameters<typeof updateUpsell>[2]);
    await invalidateAndReload();
  };

  return {
    products: data ?? [],
    loading,
    error,
    reload,
    addProduct,
    editProduct,
    removeProduct,
    addItem,
    editItem,
    removeItem,
  };
}
