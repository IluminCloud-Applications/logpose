import type { CampaignFormState } from "../hooks/useCampaignForm";
import { exportCampaign } from "@/services/campaignCreator";
import { toast } from "sonner";

/**
 * Serializa o formulário para export JSON.
 */
export function buildExportPayload(form: CampaignFormState): Record<string, unknown> {
  return {
    version: "1.0",
    campaign_name: form.campaignName,
    daily_budget: form.dailyBudget,
    bid_strategy: form.bidStrategy,
    bid_amount: form.bidAmount,
    roas_floor: form.roasFloor,
    adset_name: form.adsetName,
    adset_count: form.adsetCount,
    pixel_id: form.pixelId,
    start_time: form.startTime,
    targeting: {
      age_min: form.ageMin, age_max: form.ageMax,
      genders: form.gender, interests: form.interests,
    },
    page_id: form.pageId,
    instagram_actor_id: form.instagramActorId,
    video_id: form.videoId,
    video_label: form.videoLabel,
    checkout_id: form.checkoutId,
    checkout_label: form.checkoutLabel,
    product_id: form.productId,
    product_label: form.productLabel,
    platform_id: form.platformId,
    platform_label: form.platformLabel,
    ads: form.ads.map((a) => ({
      name: a.name, primary_text: a.primary_text, headline: a.headline,
      description: a.description, link: a.link, utm_params: a.utm_params,
      extra_params: a.extra_params, cta_type: a.cta_type, media_type: a.media_type,
    })),
    batch_mode: form.batchMode,
  };
}

/**
 * Exporta campanha como JSON download.
 */
export function handleExportCampaign(form: CampaignFormState) {
  exportCampaign(buildExportPayload(form));
  toast.success("Campanha exportada!");
}

/**
 * Importa campanha de arquivo JSON e aplica ao formulário.
 */
export function handleImportCampaign(
  updateField: <K extends keyof CampaignFormState>(key: K, value: CampaignFormState[K]) => void
) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      updateField("campaignName", data.campaign_name ?? "");
      updateField("dailyBudget", data.daily_budget ?? 0);
      updateField("bidStrategy", data.bid_strategy ?? "VOLUME");
      updateField("bidAmount", data.bid_amount ?? null);
      updateField("roasFloor", data.roas_floor ?? null);
      updateField("adsetName", data.adset_name ?? "");
      updateField("adsetCount", data.adset_count ?? 1);
      updateField("pixelId", data.pixel_id ?? "");
      updateField("startTime", data.start_time ?? "");
      updateField("videoId", data.video_id ?? "");
      updateField("videoLabel", data.video_label ?? "");
      updateField("checkoutId", data.checkout_id ?? "");
      updateField("checkoutLabel", data.checkout_label ?? "");
      updateField("productId", data.product_id ?? "");
      updateField("productLabel", data.product_label ?? "");
      updateField("platformId", data.platform_id ?? "");
      updateField("platformLabel", data.platform_label ?? "");
      if (data.targeting) {
        updateField("ageMin", data.targeting.age_min ?? 18);
        updateField("ageMax", data.targeting.age_max ?? 65);
        updateField("gender", data.targeting.genders ?? 0);
        updateField("interests", data.targeting.interests ?? []);
      }
      updateField("pageId", data.page_id ?? "");
      updateField("instagramActorId", data.instagram_actor_id ?? "");
      toast.success("Campanha importada! Revise os dados e adicione as mídias.");
    } catch {
      toast.error("Arquivo JSON inválido");
    }
  };
  input.click();
}
