import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FacebookAccountAPI } from "@/services/integrations";
import type { CampaignFormState } from "../hooks/useCampaignForm";
import { DefineVideoModal } from "@/pages/campaigns/components/DefineVideoModal";
import { DefineCheckoutModal } from "@/pages/campaigns/components/DefineCheckoutModal";
import { DefineProductModal } from "@/pages/campaigns/components/DefineProductModal";
import { SelectableField } from "./SelectableField";
import {
  RiCheckLine,
  RiVideoLine,
  RiShoppingCart2Line,
  RiBox3Line,
} from "@remixicon/react";

interface AccountStepProps {
  accounts: FacebookAccountAPI[];
  selectedAccountId: number | null;
  onSelect: (accountId: number) => void;
  onUpdate: <K extends keyof CampaignFormState>(key: K, value: CampaignFormState[K]) => void;
  form: CampaignFormState;
  isLoading: boolean;
}

export function AccountStep({
  accounts, selectedAccountId, onSelect, onUpdate, form, isLoading,
}: AccountStepProps) {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          Carregando contas de anúncio...
        </CardContent>
      </Card>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground mb-2">Nenhuma conta de anúncio cadastrada.</p>
          <p className="text-sm text-muted-foreground">
            Vá em <strong>Integrações → Facebook Ads</strong> para adicionar uma conta.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Configuração Inicial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Conta Facebook Ads</Label>
            <Select
              value={selectedAccountId?.toString() ?? ""}
              onValueChange={(val) => onSelect(Number(val))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a conta de anúncio" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id.toString()}>
                    <span className="font-medium">{acc.label}</span>
                    <span className="text-xs text-muted-foreground ml-2">({acc.account_id})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vídeo + Checkout */}
          <div className="grid grid-cols-2 gap-4">
            <SelectableField
              label="Vídeo VTurb (Opcional)"
              hint="VSL ou vídeo utilizado na campanha."
              icon={<RiVideoLine className="size-4" />}
              selectedId={form.videoId}
              selectedLabel={form.videoLabel}
              placeholder="Selecionar vídeo"
              onOpen={() => setVideoModalOpen(true)}
              onClear={() => { onUpdate("videoId", ""); onUpdate("videoLabel", ""); }}
            />
            <SelectableField
              label="Checkout (Opcional)"
              hint="Ao definir, o produto é vinculado automaticamente."
              icon={<RiShoppingCart2Line className="size-4" />}
              selectedId={form.checkoutId}
              selectedLabel={form.checkoutLabel}
              placeholder="Selecionar checkout"
              onOpen={() => setCheckoutModalOpen(true)}
              onClear={() => { onUpdate("checkoutId", ""); onUpdate("checkoutLabel", ""); }}
            />
          </div>

          {/* Produto */}
          <div className="grid grid-cols-1 gap-4">
            <SelectableField
              label="Produto (Opcional)"
              hint="Definido automaticamente ao selecionar checkout."
              icon={<RiBox3Line className="size-4" />}
              selectedId={form.productId}
              selectedLabel={form.productLabel}
              placeholder="Selecionar produto"
              onOpen={() => setProductModalOpen(true)}
              onClear={() => { onUpdate("productId", ""); onUpdate("productLabel", ""); }}
            />
          </div>

          {selectedAccountId && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 flex items-center gap-2">
              <RiCheckLine className="size-4 text-primary" />
              <div>
                <p className="text-sm text-primary font-medium">Conta selecionada</p>
                <p className="text-xs text-muted-foreground">
                  Todos os dados (pixels, páginas, interesses) serão buscados desta conta.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <DefineVideoModal
        open={videoModalOpen}
        onOpenChange={setVideoModalOpen}
        campaignName="Nova Campanha"
        currentVideoId={form.videoId}
        onSave={async (id, label) => { onUpdate("videoId", id); onUpdate("videoLabel", label); }}
      />
      <DefineCheckoutModal
        open={checkoutModalOpen}
        onOpenChange={setCheckoutModalOpen}
        campaignName="Nova Campanha"
        currentCheckoutId={form.checkoutId}
        onSave={async (id, label) => { onUpdate("checkoutId", id); onUpdate("checkoutLabel", label); }}
        onProductResolved={(productId, productName) => {
          onUpdate("productId", productId);
          onUpdate("productLabel", productName);
        }}
      />
      <DefineProductModal
        open={productModalOpen}
        onOpenChange={setProductModalOpen}
        campaignName="Nova Campanha"
        currentProductId={form.productId}
        onSave={async (id, label) => { onUpdate("productId", id); onUpdate("productLabel", label); }}
      />
    </>
  );
}
