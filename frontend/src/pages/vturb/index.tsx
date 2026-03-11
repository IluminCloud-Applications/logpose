import { useState } from "react";
import { VturbHeader } from "./components/VturbHeader";
import { VturbTable } from "./components/VturbTable";
import { AddVturbModal } from "./components/AddVturbModal";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { useVturbAccounts } from "@/hooks/useVturbAccounts";
import type { VturbAccountAPI } from "@/services/integrations";

export default function VturbPage() {
  const { accounts, isLoading, addAccount, removeAccount } = useVturbAccounts();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<VturbAccountAPI | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (name: string, apiKey: string) => {
    try {
      setIsAdding(true);
      await addAccount(name, apiKey);
      setModalOpen(false);
    } catch {
      alert("Erro ao adicionar conta VTurb");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteClick = (account: VturbAccountAPI) => {
    setDeleteTarget(account);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await removeAccount(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      alert("Erro ao excluir conta VTurb");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <VturbHeader onAddAccount={() => setModalOpen(true)} />
      <VturbTable
        accounts={accounts}
        isLoading={isLoading}
        onDelete={handleDeleteClick}
      />
      <AddVturbModal
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
        title="Excluir conta VTurb"
        description={`Tem certeza que deseja excluir a conta "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
