/**
 * Duplicar campanha — busca os detalhes completos da campanha
 * e navega para /campaigns/create com os dados pré-preenchidos.
 */
import type { CampaignData } from "@/services/campaigns";
import { fetchCampaignExportDetails } from "@/services/campaigns";
import type { MarkerMap } from "@/hooks/useCampaignMarkers";
import { toast } from "sonner";
import type { NavigateFunction } from "react-router-dom";

interface DuplicateOptions {
  campaign: CampaignData;
  markersMap: MarkerMap;
  accountId?: number;
  navigate: NavigateFunction;
}

/**
 * Busca os detalhes da campanha e redireciona para a
 * página de criação com todos os campos pré-preenchidos.
 */
export async function handleDuplicateCampaign(options: DuplicateOptions) {
  const { campaign, markersMap, accountId, navigate } = options;

  if (!accountId) {
    toast.error("Selecione uma conta de anúncio para duplicar.");
    return;
  }

  const loadingToast = toast.loading("Preparando duplicação...");

  try {
    const details = await fetchCampaignExportDetails(campaign.id, accountId);
    const markers = markersMap[campaign.id] || {};

    const firstAdsetName = campaign.adsets[0]?.name ?? "";

    // Montar payload idêntico ao que o import entende
    const duplicateData = {
      campaign_name: `${campaign.name} - Copy`,
      daily_budget: campaign.budget,
      bid_strategy: details.bid_strategy || "VOLUME",
      bid_amount: details.bid_amount,
      roas_floor: details.roas_floor,
      adset_name: firstAdsetName,
      adset_count: campaign.adsets.length || 1,
      pixel_id: details.pixel_id,
      start_time: details.start_time,
      targeting: details.targeting,
      page_id: details.page_id,
      instagram_actor_id: details.instagram_actor_id,
      video_id: markers?.video?.reference_id ?? "",
      video_label: markers?.video?.reference_label ?? "",
      checkout_id: markers?.checkout?.reference_id ?? "",
      checkout_label: markers?.checkout?.reference_label ?? "",
      product_id: markers?.product?.reference_id ?? "",
      product_label: markers?.product?.reference_label ?? "",
      ads: details.ads.map((ad) => ({
        name: ad.name,
        primary_text: ad.primary_text,
        headline: ad.headline,
        description: ad.description,
        link: ad.link,
        utm_params: ad.utm_params,
        extra_params: ad.extra_params,
        cta_type: ad.cta_type,
        media_type: ad.media_type,
      })),
      batch_mode: true,
      account_id: accountId,
    };

    toast.dismiss(loadingToast);
    toast.success("Abrindo campanha duplicada...");

    navigate("/campaigns/create", { state: { duplicateData } });
  } catch (error) {
    toast.dismiss(loadingToast);
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    toast.error(`Falha ao duplicar: ${msg}`);
  }
}
