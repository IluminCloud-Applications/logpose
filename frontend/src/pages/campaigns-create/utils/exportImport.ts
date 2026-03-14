import type { CampaignFormState, AdFormData } from "../hooks/useCampaignForm";
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
    bulk_data: form.bulkData,
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

      // Import ads (sem file — precisam ser adicionados manualmente)
      if (Array.isArray(data.ads) && data.ads.length > 0) {
        const importedAds: AdFormData[] = data.ads.map((a: Record<string, unknown>) => ({
          name: (a.name as string) ?? "",
          primary_text: (a.primary_text as string) ?? "",
          headline: (a.headline as string) ?? "",
          description: (a.description as string) ?? "",
          link: (a.link as string) ?? "",
          utm_params: (a.utm_params as string) ?? "",
          extra_params: (a.extra_params as string) ?? "",
          cta_type: (a.cta_type as string) ?? "LEARN_MORE",
          media_type: ((a.media_type as string) ?? "image") as "image" | "video",
          file: null,
          preview_url: "",
        }));
        updateField("ads", importedAds);
      }

      if (data.batch_mode !== undefined) {
        updateField("batchMode", Boolean(data.batch_mode));
      }

      // Import bulkData
      if (data.bulk_data) {
        updateField("bulkData", {
          primary_text: data.bulk_data.primary_text ?? "",
          headline: data.bulk_data.headline ?? "",
          description: data.bulk_data.description ?? "",
          link: data.bulk_data.link ?? "",
          extra_params: data.bulk_data.extra_params ?? "",
          cta_type: data.bulk_data.cta_type ?? "LEARN_MORE",
        });
      } else if (Array.isArray(data.ads) && data.ads.length > 0) {
        // Backwards compat: derive bulkData from first ad
        const firstAd = data.ads[0];
        updateField("bulkData", {
          primary_text: (firstAd.primary_text as string) ?? "",
          headline: (firstAd.headline as string) ?? "",
          description: (firstAd.description as string) ?? "",
          link: (firstAd.link as string) ?? "",
          extra_params: (firstAd.extra_params as string) ?? "",
          cta_type: (firstAd.cta_type as string) ?? "LEARN_MORE",
        });
      }

      toast.success("Campanha importada! Revise os dados e adicione as mídias.");
    } catch {
      toast.error("Arquivo JSON inválido");
    }
  };
  input.click();
}

