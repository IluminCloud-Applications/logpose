import { useState } from "react";
import { ProductsHeader } from "./components/ProductsHeader";
import { ProductAccordion } from "./components/ProductAccordion";
import { AddProductModal } from "./components/AddProductModal";
import { AddItemModal, type NewItemData } from "./components/AddItemModal";
import { useProducts } from "@/hooks/use-products";

export default function ProductsPage() {
  const { products, loading, error, addProduct, removeProduct, addItem } = useProducts();
  const [modalOpen, setModalOpen] = useState(false);
  const [itemModal, setItemModal] = useState<{ open: boolean; productId: number }>({
    open: false, productId: 0,
  });

  const handleAdd = async (data: {
    name: string; externalId: string; ticket: number; idealCpa: number; platform: "kiwify" | "payt";
  }) => {
    await addProduct(data);
    setModalOpen(false);
  };

  const handleAddItem = async (data: NewItemData) => {
    await addItem(itemModal.productId, data);
    setItemModal({ open: false, productId: 0 });
  };

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
            onDeleteProduct={removeProduct}
          />
        ))}
      </div>

      <AddProductModal open={modalOpen} onOpenChange={setModalOpen} onAdd={handleAdd} />
      <AddItemModal
        open={itemModal.open}
        onOpenChange={(v) => setItemModal((s) => ({ ...s, open: v }))}
        onAdd={handleAddItem}
        productName={currentProduct?.name || ""}
      />
    </div>
  );
}
