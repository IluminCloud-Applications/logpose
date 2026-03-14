import { useState } from "react";
import { GeminiHeader } from "./components/GeminiHeader";
import { GeminiTable } from "./components/GeminiTable";
import { AddGeminiModal } from "./components/AddGeminiModal";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { useGeminiAccounts } from "@/hooks/useGeminiAccounts";
import type { GeminiAccountAPI } from "@/services/integrations";

export default function GeminiPage() {
  const { accounts, isLoading, addAccount, removeAccount } = useGeminiAccounts();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GeminiAccountAPI | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (name: string, apiKey: string, model: string) => {
    try {
      setIsAdding(true);
      await addAccount(name, apiKey, model);
      setModalOpen(false);
    } catch {
      alert("Erro ao adicionar chave Gemini");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteClick = (account: GeminiAccountAPI) => {
    setDeleteTarget(account);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await removeAccount(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      alert("Erro ao excluir chave Gemini");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <GeminiHeader onAddAccount={() => setModalOpen(true)} />
      <GeminiTable
        accounts={accounts}
        isLoading={isLoading}
        onDelete={handleDeleteClick}
      />
      <AddGeminiModal
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
        title="Excluir chave Gemini"
        description={`Tem certeza que deseja excluir a chave "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
