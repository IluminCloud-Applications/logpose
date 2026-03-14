import { useCallback } from "react";
import type { ProductView } from "@/types/product";
import {
  fetchProductsWithStats,
  createProduct as apiCreateProduct,
  deleteProduct as apiDeleteProduct,
  createCheckout, createOrderBump, createUpsell,
  deleteCheckout, deleteOrderBump, deleteUpsell,
} from "@/services/products";
import { useCachedQuery } from "./useCachedQuery";
import { invalidateCacheByPrefix } from "@/lib/queryCache";

interface NewItemData {
  type: "checkout" | "orderBump" | "upsell";
  externalId: string;
  name: string;
  price: number;
  platform?: string;
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

  const addProduct = async (productData: { name: string }) => {
    await apiCreateProduct({ name: productData.name });
    await invalidateAndReload();
  };

  const removeProduct = async (productId: number) => {
    await apiDeleteProduct(productId);
    await invalidateAndReload();
  };

  const addItem = async (productId: number, itemData: NewItemData) => {
    if (itemData.type === "checkout") {
      await createCheckout(productId, {
        url: itemData.externalId,
        price: itemData.price,
        platform: itemData.platform ?? "kiwify",
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

  return {
    products: data ?? [],
    loading,
    error,
    reload,
    addProduct,
    removeProduct,
    addItem,
    removeItem,
  };
}
