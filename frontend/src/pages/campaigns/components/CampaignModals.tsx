import type { CampaignData } from "@/services/campaigns";
import { BudgetModal } from "./BudgetModal";
import { TagsModal } from "./TagsModal";
import { DefineVideoModal } from "./DefineVideoModal";
import { DefineCheckoutModal } from "./DefineCheckoutModal";
import { DefineProductModal } from "./DefineProductModal";
import { CampaignInfoModal } from "./CampaignInfoModal";
import type { MarkerMap } from "@/hooks/useCampaignMarkers";

export type CampaignModalState = {
  open: boolean;
  campaign: CampaignData | null;
};

interface CampaignModalsProps {
  budgetModal: CampaignModalState;
  setBudgetModal: React.Dispatch<React.SetStateAction<CampaignModalState>>;
  tagsModal: CampaignModalState;
  setTagsModal: React.Dispatch<React.SetStateAction<CampaignModalState>>;
  videoModal: CampaignModalState;
  setVideoModal: React.Dispatch<React.SetStateAction<CampaignModalState>>;
  checkoutModal: CampaignModalState;
  setCheckoutModal: React.Dispatch<React.SetStateAction<CampaignModalState>>;
  productModal: CampaignModalState;
  setProductModal: React.Dispatch<React.SetStateAction<CampaignModalState>>;
  infoModal: CampaignModalState;
  setInfoModal: React.Dispatch<React.SetStateAction<CampaignModalState>>;
  tagsMap: Record<string, string[]>;
  markersMap: MarkerMap;
  onBudgetChange: (id: string, type: "campaign" | "adset", budget: number, entityName?: string, budgetBefore?: number, metrics?: Record<string, number>) => Promise<void>;
  onSaveTags?: (campaignId: string, tags: string[]) => Promise<void>;
  onSaveMarker?: (campaignId: string, type: "video" | "checkout" | "product" | "platform", refId: string, refLabel: string) => Promise<void>;
}

export function CampaignModals({
  budgetModal, setBudgetModal,
  tagsModal, setTagsModal,
  videoModal, setVideoModal,
  checkoutModal, setCheckoutModal,
  productModal, setProductModal,
  infoModal, setInfoModal,
  tagsMap, markersMap,
  onBudgetChange, onSaveTags, onSaveMarker,
}: CampaignModalsProps) {
  return (
    <>
      {budgetModal.campaign && (
        <BudgetModal
          open={budgetModal.open}
          onOpenChange={(open) => setBudgetModal((prev) => ({ ...prev, open }))}
          campaignName={budgetModal.campaign.name}
          currentBudget={budgetModal.campaign.budget}
          onSave={async (newBudget) => {
            if (budgetModal.campaign) {
              const c = budgetModal.campaign;
              await onBudgetChange(
                c.id, "campaign", newBudget, c.name, c.budget,
                { spend: c.spend, revenue: c.revenue, profit: c.profit, sales: c.sales, roas: c.roas, cpa: c.cpa, cpc: c.cpc, ctr: c.ctr, clicks: c.clicks, impressions: c.impressions },
              );
            }
          }}
        />
      )}

      {tagsModal.campaign && onSaveTags && (
        <TagsModal
          open={tagsModal.open}
          onOpenChange={(open) => setTagsModal((prev) => ({ ...prev, open }))}
          campaignName={tagsModal.campaign.name}
          campaignId={tagsModal.campaign.id}
          currentTags={tagsMap[tagsModal.campaign.id] || []}
          onSave={onSaveTags}
        />
      )}

      {videoModal.campaign && onSaveMarker && (
        <DefineVideoModal
          open={videoModal.open}
          onOpenChange={(open) => setVideoModal((prev) => ({ ...prev, open }))}
          campaignName={videoModal.campaign.name}
          currentVideoId={markersMap[videoModal.campaign.id]?.video?.reference_id}
          onSave={async (refId, refLabel) => {
            if (videoModal.campaign) {
              await onSaveMarker(videoModal.campaign.id, "video", refId, refLabel);
            }
          }}
        />
      )}

      {checkoutModal.campaign && onSaveMarker && (
        <DefineCheckoutModal
          open={checkoutModal.open}
          onOpenChange={(open) => setCheckoutModal((prev) => ({ ...prev, open }))}
          campaignName={checkoutModal.campaign.name}
          currentCheckoutId={markersMap[checkoutModal.campaign.id]?.checkout?.reference_id}
          onSave={async (refId, refLabel) => {
            if (checkoutModal.campaign) {
              await onSaveMarker(checkoutModal.campaign.id, "checkout", refId, refLabel);
            }
          }}
        />
      )}

      {productModal.campaign && onSaveMarker && (
        <DefineProductModal
          open={productModal.open}
          onOpenChange={(open) => setProductModal((prev) => ({ ...prev, open }))}
          campaignName={productModal.campaign.name}
          currentProductId={markersMap[productModal.campaign.id]?.product?.reference_id}
          onSave={async (refId, refLabel) => {
            if (productModal.campaign) {
              await onSaveMarker(productModal.campaign.id, "product", refId, refLabel);
            }
          }}
        />
      )}

      {infoModal.campaign && (
        <CampaignInfoModal
          open={infoModal.open}
          onOpenChange={(open) => setInfoModal((prev) => ({ ...prev, open }))}
          campaignName={infoModal.campaign.name}
          tags={tagsMap[infoModal.campaign.id] || []}
          videoMarker={markersMap[infoModal.campaign.id]?.video}
          checkoutMarker={markersMap[infoModal.campaign.id]?.checkout}
          productMarker={markersMap[infoModal.campaign.id]?.product}
        />
      )}
    </>
  );
}
