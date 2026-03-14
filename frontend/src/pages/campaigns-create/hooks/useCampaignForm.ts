import { useState, useCallback } from "react";
import type { InterestData } from "@/services/campaignCreator";
import { DEFAULT_UTM_PARAMS } from "../utils/defaults";
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

export interface CampaignFormState {
  // Step 0 — Conta de anúncio
  accountId: number | null;
  videoId: string;
  videoLabel: string;
  checkoutId: string;
  checkoutLabel: string;
  productId: string;
  productLabel: string;
  platformId: string;
  platformLabel: string;
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
  platformId: "",
  platformLabel: "",
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
    const newAd: AdFormData = {
      name: "",
      primary_text: "",
      headline: "",
      description: "",
      link: "",
      utm_params: DEFAULT_UTM_PARAMS,
      extra_params: "",
      cta_type: "LEARN_MORE",
      media_type: isVideo ? "video" : "image",
      file,
      preview_url: URL.createObjectURL(file),
    };
    setForm((prev) => ({ ...prev, ads: [...prev.ads, newAd] }));
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
    resetForm,
    nextStep,
    prevStep,
    goToStep,
  };
}
