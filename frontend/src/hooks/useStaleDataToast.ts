import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

const STALE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Shows a toast after 5 minutes of inactivity on the campaigns page,
 * suggesting the user refresh the data. Clicking the toast triggers
 * the same refresh logic as the RefreshButton.
 */
export function useStaleDataToast(onRefresh: () => Promise<void>) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastShownRef = useRef(false);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    toastShownRef.current = false;

    timerRef.current = setTimeout(() => {
      if (toastShownRef.current) return;
      toastShownRef.current = true;

      toast("Dados podem estar desatualizados", {
        description: "Clique para atualizar os dados da página.",
        action: {
          label: "Atualizar",
          onClick: () => {
            onRefresh();
            toastShownRef.current = false;
          },
        },
        duration: Infinity,
      });
    }, STALE_TIMEOUT_MS);
  }, [onRefresh]);

  useEffect(() => {
    resetTimer();

    // Reset timer on user interaction
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    const handleActivity = () => {
      if (toastShownRef.current) return; // Don't reset if toast is already showing
      resetTimer();
    };

    for (const event of events) {
      window.addEventListener(event, handleActivity, { passive: true });
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      for (const event of events) {
        window.removeEventListener(event, handleActivity);
      }
    };
  }, [resetTimer]);
}
