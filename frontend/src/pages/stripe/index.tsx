import { useState } from "react";
import { StripeHeader } from "./components/StripeHeader";
import { StripeTable } from "./components/StripeTable";
import { AddStripeModal } from "./components/AddStripeModal";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { useStripeAccounts } from "@/hooks/useStripeAccounts";
import type { StripeAccountAPI } from "@/services/stripe";

export default function StripePage() {
  const { accounts, isLoading, addAccount, removeAccount } = useStripeAccounts();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StripeAccountAPI | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (name: string, apiKey: string) => {
    try {
      setIsAdding(true);
      await addAccount(name, apiKey);
      setModalOpen(false);
    } catch {
      alert("Erro ao adicionar conta Stripe. Verifique a API Key.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteClick = (account: StripeAccountAPI) => {
    setDeleteTarget(account);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await removeAccount(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      alert("Erro ao excluir conta Stripe");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <StripeHeader onAddAccount={() => setModalOpen(true)} />
      <StripeTable
        accounts={accounts}
        isLoading={isLoading}
        onDelete={handleDeleteClick}
      />
      <AddStripeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onAdd={handleAdd}
        isLoading={isAdding}
      />
      <ConfirmDeleteModal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Excluir conta Stripe"
        description={`Tem certeza que deseja excluir a conta "${deleteTarget?.name}"? Os dados do dashboard de assinatura não estarão mais disponíveis.`}
      />
    </div>
  );
}
