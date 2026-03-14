import { useState, useCallback } from "react";
import type { InterestData } from "@/services/campaignCreator";
import { DEFAULT_UTM_PARAMS, DEFAULT_CTA } from "../utils/defaults";
import { getNextMidnightSP } from "../utils/schedule";

export interface AdFormData {
  name: string;
  primary_text: string;
  headline: string;
  description: string;
  link: string;
  utm_params: string;
  extra_params: string;
  cta_type: string;
  media_type: "image" | "video";
  file: File | null;
  preview_url: string;
}

/** Dados da edição em massa — persistem independente dos ads */
export interface BulkEditData {
  primary_text: string;
  headline: string;
  description: string;
  link: string;
  extra_params: string;
  cta_type: string;
}

export const INITIAL_BULK_DATA: BulkEditData = {
  primary_text: "",
  headline: "",
  description: "",
  link: "",
  extra_params: "",
  cta_type: DEFAULT_CTA,
};

export interface CampaignFormState {
  // Step 0 — Conta de anúncio
  accountId: number | null;
  videoId: string;
  videoLabel: string;
  checkoutId: string;
  checkoutLabel: string;
  productId: string;
  productLabel: string;
  // Step 1 — Campanha
  campaignName: string;
  dailyBudget: number;
  bidStrategy: string;
  bidAmount: number | null;
  roasFloor: number | null;
  // Step 2 — Conjunto
  adsetName: string;
  adsetCount: number;
  pixelId: string;
  startTime: string;
  ageMin: number;
  ageMax: number;
  gender: number;
  interests: InterestData[];
  pageId: string;
  instagramActorId: string;
  // Step 3 — Anúncios
  batchMode: boolean;
  bulkData: BulkEditData;
  ads: AdFormData[];
}

const INITIAL_STATE: CampaignFormState = {
  accountId: null,
  videoId: "",
  videoLabel: "",
  checkoutId: "",
  checkoutLabel: "",
  productId: "",
  productLabel: "",
  campaignName: "",
  dailyBudget: 0,
  bidStrategy: "VOLUME",
  bidAmount: null,
  roasFloor: null,
  adsetName: "",
  adsetCount: 1,
  pixelId: "",
  startTime: getNextMidnightSP(),
  ageMin: 18,
  ageMax: 65,
  gender: 0,
  interests: [],
  pageId: "",
  instagramActorId: "",
  batchMode: true,
  bulkData: { ...INITIAL_BULK_DATA },
  ads: [],
};

export function useCampaignForm() {
  const [form, setForm] = useState<CampaignFormState>({ ...INITIAL_STATE });
  const [currentStep, setCurrentStep] = useState(0);

  const updateField = useCallback(
    <K extends keyof CampaignFormState>(key: K, value: CampaignFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const addAd = useCallback((file: File) => {
    const isVideo = file.type.startsWith("video/");
    setForm((prev) => {
      const bulk = prev.bulkData;
      const newAd: AdFormData = {
        name: "",
        primary_text: prev.batchMode ? bulk.primary_text : "",
        headline: prev.batchMode ? bulk.headline : "",
        description: prev.batchMode ? bulk.description : "",
        link: prev.batchMode ? bulk.link : "",
        utm_params: DEFAULT_UTM_PARAMS,
        extra_params: prev.batchMode ? bulk.extra_params : "",
        cta_type: prev.batchMode ? bulk.cta_type : DEFAULT_CTA,
        media_type: isVideo ? "video" : "image",
        file,
        preview_url: URL.createObjectURL(file),
      };
      return { ...prev, ads: [...prev.ads, newAd] };
    });
  }, []);

  const updateAd = useCallback((index: number, data: Partial<AdFormData>) => {
    setForm((prev) => {
      const ads = [...prev.ads];
      ads[index] = { ...ads[index], ...data };
      return { ...prev, ads };
    });
  }, []);

  const removeAd = useCallback((index: number) => {
    setForm((prev) => {
      const ads = prev.ads.filter((_, i) => i !== index);
      return { ...prev, ads };
    });
  }, []);

  /** Atualiza bulkData e sincroniza com todos os ads existentes */
  const updateBulkData = useCallback((data: Partial<BulkEditData>) => {
    setForm((prev) => {
      const newBulk = { ...prev.bulkData, ...data };
      const ads = prev.ads.map((ad) => ({ ...ad, ...data }));
      return { ...prev, bulkData: newBulk, ads };
    });
  }, []);

  const resetForm = useCallback(() => {
    setForm({ ...INITIAL_STATE, startTime: getNextMidnightSP() });
    setCurrentStep(0);
  }, []);

  const nextStep = useCallback(() => setCurrentStep((s) => Math.min(s + 1, 4)), []);
  const prevStep = useCallback(() => setCurrentStep((s) => Math.max(s - 1, 0)), []);
  const goToStep = useCallback((step: number) => setCurrentStep(step), []);

  return {
    form,
    currentStep,
    updateField,
    addAd,
    updateAd,
    removeAd,
    updateBulkData,
    resetForm,
    nextStep,
    prevStep,
    goToStep,
  };
}
