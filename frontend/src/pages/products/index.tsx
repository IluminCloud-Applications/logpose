import { useState } from "react";
import { ProductsHeader } from "./components/ProductsHeader";
import { ProductAccordion } from "./components/ProductAccordion";
import { AddProductModal } from "./components/AddProductModal";
import { EditProductModal } from "./components/EditProductModal";
import { AddItemModal, type NewItemData } from "./components/AddItemModal";
import { EditItemModal, type EditItemData, type ItemType } from "./components/EditItemModal";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { useProducts } from "@/hooks/use-products";
import type { ProductView } from "@/types/product";

type DeleteTarget =
  | { kind: "product"; productId: number; name: string }
  | { kind: "item"; productId: number; itemId: number; type: ItemType; label: string };

export default function ProductsPage() {
  const { products, loading, error, addProduct, editProduct, removeProduct, addItem, editItem, removeItem } = useProducts();
  const [modalOpen, setModalOpen] = useState(false);
  const [itemModal, setItemModal] = useState<{ open: boolean; productId: number }>({
    open: false, productId: 0,
  });
  const [editModal, setEditModal] = useState<{
    open: boolean; product: ProductView | null;
  }>({ open: false, product: null });
  const [editItemModal, setEditItemModal] = useState<{
    open: boolean; item: EditItemData | null;
  }>({ open: false, item: null });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean; target: DeleteTarget | null; loading: boolean;
  }>({ open: false, target: null, loading: false });

  // ── Handlers ────────────────────────────────────────────────

  const handleAdd = async (data: { name: string; logo_url?: string | null }) => {
    await addProduct(data);
    setModalOpen(false);
  };

  const handleEdit = async (data: { name: string; logo_url?: string | null }) => {
    if (!editModal.product) return;
    await editProduct(editModal.product.id, data);
    setEditModal({ open: false, product: null });
  };

  const handleAddItem = async (data: NewItemData) => {
    await addItem(itemModal.productId, data);
    setItemModal({ open: false, productId: 0 });
  };

  const handleOpenEditItem = (info: { productId: number; itemId: number; type: ItemType }) => {
    const product = products.find((p) => p.id === info.productId);
    if (!product) return;

    let itemData: EditItemData | null = null;

    if (info.type === "checkout") {
      const c = product.checkouts.find((x) => x.id === info.itemId);
      if (c) itemData = { productId: info.productId, itemId: c.id, type: "checkout", url: c.url, price: c.price, platform: c.platform, checkoutCode: c.checkoutCode, checkoutName: c.name };
    } else if (info.type === "orderBump") {
      const o = product.orderBumps.find((x) => x.id === info.itemId);
      if (o) itemData = { productId: info.productId, itemId: o.id, type: "orderBump", externalId: o.externalId ?? "", name: o.name, price: o.price };
    } else {
      const u = product.upsells.find((x) => x.id === info.itemId);
      if (u) itemData = { productId: info.productId, itemId: u.id, type: "upsell", externalId: u.externalId ?? "", name: u.name, price: u.price };
    }

    if (itemData) setEditItemModal({ open: true, item: itemData });
  };

  // ── Delete confirmation ─────────────────────────────────────

  const typeLabels: Record<ItemType, string> = { checkout: "Checkout", orderBump: "Order Bump", upsell: "Upsell" };

  const requestDeleteProduct = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    setDeleteConfirm({
      open: true,
      target: { kind: "product", productId, name: product?.name ?? "Produto" },
      loading: false,
    });
  };

  const requestDeleteItem = (productId: number, itemId: number, type: ItemType) => {
    setDeleteConfirm({
      open: true,
      target: { kind: "item", productId, itemId, type, label: typeLabels[type] },
      loading: false,
    });
  };

  const handleConfirmDelete = async () => {
    const target = deleteConfirm.target;
    if (!target) return;
    setDeleteConfirm((s) => ({ ...s, loading: true }));
    try {
      if (target.kind === "product") {
        await removeProduct(target.productId);
      } else {
        await removeItem(target.productId, target.itemId, target.type);
      }
    } finally {
      setDeleteConfirm({ open: false, target: null, loading: false });
    }
  };

  const deleteTitle = deleteConfirm.target?.kind === "product"
    ? `Excluir "${(deleteConfirm.target as Extract<DeleteTarget, { kind: "product" }>).name}"?`
    : `Remover ${(deleteConfirm.target as Extract<DeleteTarget, { kind: "item" }>)?.label ?? "item"}?`;

  const deleteDescription = deleteConfirm.target?.kind === "product"
    ? "Todos os checkouts, order bumps e upsells vinculados a este produto serão removidos. Esta ação não pode ser desfeita."
    : "Este item será removido permanentemente. Esta ação não pode ser desfeita.";

  // ── Render ──────────────────────────────────────────────────

  const currentProduct = products.find((p) => p.id === itemModal.productId);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <ProductsHeader onAddProduct={() => setModalOpen(true)} />
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-3 border-primary border-t-transparent" />
          <span className="ml-3 text-sm text-muted-foreground">Carregando produtos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <ProductsHeader onAddProduct={() => setModalOpen(true)} />

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">{error}</p>
      )}

      <div className="space-y-3">
        {products.length === 0 && !error && (
          <p className="text-center text-sm text-muted-foreground py-12">
            Nenhum produto cadastrado. Clique em "Novo Produto" para começar.
          </p>
        )}
        {products.map((product) => (
          <ProductAccordion
            key={product.id}
            product={product}
            onAddItem={(id) => setItemModal({ open: true, productId: id })}
            onEditProduct={(p) => setEditModal({ open: true, product: p })}
            onDeleteProduct={requestDeleteProduct}
            onEditItem={handleOpenEditItem}
          />
        ))}
      </div>

      <AddProductModal open={modalOpen} onOpenChange={setModalOpen} onAdd={handleAdd} />
      <EditProductModal
        open={editModal.open}
        onOpenChange={(v) => setEditModal((s) => ({ ...s, open: v }))}
        onSave={handleEdit}
        initialName={editModal.product?.name ?? ""}
        initialLogoUrl={editModal.product?.logoUrl ?? null}
        productId={editModal.product?.id ?? null}
      />
      <AddItemModal
        open={itemModal.open}
        onOpenChange={(v) => setItemModal((s) => ({ ...s, open: v }))}
        onAdd={handleAddItem}
        productName={currentProduct?.name || ""}
      />
      <EditItemModal
        open={editItemModal.open}
        onOpenChange={(v) => setEditItemModal((s) => ({ ...s, open: v }))}
        onSave={editItem}
        onDelete={requestDeleteItem}
        item={editItemModal.item}
      />
      <ConfirmDeleteModal
        open={deleteConfirm.open}
        onOpenChange={(v) => { if (!v) setDeleteConfirm({ open: false, target: null, loading: false }); }}
        onConfirm={handleConfirmDelete}
        title={deleteTitle}
        description={deleteDescription}
        isLoading={deleteConfirm.loading}
      />
    </div>
  );
}
