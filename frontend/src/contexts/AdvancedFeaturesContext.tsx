import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import {
  fetchAdvancedFeatures,
  updateAdvancedFeatures,
  type AdvancedFeatures,
} from "@/services/advancedSettings";
import { isAuthenticated } from "@/services/auth";

interface AdvancedFeaturesContextType {
  features: AdvancedFeatures;
  loading: boolean;
  toggleStripe: (enabled: boolean) => Promise<void>;
  reload: () => void;
}

const DEFAULT_FEATURES: AdvancedFeatures = { stripe_enabled: false };

const AdvancedFeaturesContext = createContext<AdvancedFeaturesContextType>({
  features: DEFAULT_FEATURES,
  loading: true,
  toggleStripe: async () => {},
  reload: () => {},
});

export function AdvancedFeaturesProvider({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState<AdvancedFeatures>(DEFAULT_FEATURES);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }
    try {
      const data = await fetchAdvancedFeatures();
      setFeatures(data);
    } catch {
      // keep defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleStripe = async (enabled: boolean) => {
    const updated = await updateAdvancedFeatures({ stripe_enabled: enabled });
    setFeatures(updated);
  };

  return (
    <AdvancedFeaturesContext.Provider
      value={{ features, loading, toggleStripe, reload: load }}
    >
      {children}
    </AdvancedFeaturesContext.Provider>
  );
}

export function useAdvancedFeatures() {
  return useContext(AdvancedFeaturesContext);
}
