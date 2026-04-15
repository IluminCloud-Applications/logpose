import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface ValueDisplayContextType {
  showFull: boolean;
  toggle: () => void;
}

const ValueDisplayContext = createContext<ValueDisplayContextType>({
  showFull: false,
  toggle: () => {},
});

const STORAGE_KEY = "lp_show_full_values";

export function ValueDisplayProvider({ children }: { children: ReactNode }) {
  const [showFull, setShowFull] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const toggle = () => {
    setShowFull((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  };

  return (
    <ValueDisplayContext.Provider value={{ showFull, toggle }}>
      {children}
    </ValueDisplayContext.Provider>
  );
}

export function useValueDisplay() {
  return useContext(ValueDisplayContext);
}
