import { useState, useCallback, useRef } from "react";
import {
  fetchPixels,
  fetchPages,
  searchInterests,
  type PixelData,
  type PageData,
  type InterestData,
} from "@/services/campaignCreator";

/**
 * Hook para buscar pixels da conta de anúncio selecionada.
 */
export function usePixels() {
  const [pixels, setPixels] = useState<PixelData[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (accountId: number) => {
    setLoading(true);
    try {
      const data = await fetchPixels(accountId);
      setPixels(data);
    } catch (err) {
      console.error("Erro ao buscar pixels:", err);
      setPixels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { pixels, loading, load };
}

/**
 * Hook para buscar páginas FB + contas IG vinculadas.
 */
export function usePages() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (accountId: number) => {
    setLoading(true);
    try {
      const data = await fetchPages(accountId);
      setPages(data);
    } catch (err) {
      console.error("Erro ao buscar páginas:", err);
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { pages, loading, load };
}

/**
 * Hook para busca de interesses com debounce.
 */
export function useInterestSearch() {
  const [results, setResults] = useState<InterestData[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((accountId: number, query: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (query.length < 1) {
      setResults([]);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchInterests(accountId, query);
        setResults(data);
      } catch (err) {
        console.error("Erro na busca de interesses:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const clear = useCallback(() => setResults([]), []);

  return { results, loading, search, clear };
}
