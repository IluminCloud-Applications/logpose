import { createContext, useContext, useCallback, useState, useMemo } from "react";

/**
 * Contexto para páginas registrarem dados atuais que a AI pode usar.
 *
 * Dividido em dois contexts para evitar re-renders infinitos:
 * - ValueContext: contém o snapshot (consumido pelo AI Chat)
 * - SetterContext: contém setSnapshot/clearSnapshot (consumido pelas páginas que registram dados)
 *
 * Como o SetterContext nunca muda (useCallback com []), a página que
 * chama setSnapshot não re-renderiza ao fazer isso.
 */

export interface PageDataSnapshot {
  /** Identificador da página (ex: "campaigns") */
  page: string;
  /** Label amigável (ex: "Campanhas") */
  label: string;
  /** Resumo dos filtros ativos */
  filtersDescription: string;
  /** Dados serializados como string para enviar à AI */
  data: string;
}

interface SetterContextValue {
  setSnapshot: (snapshot: PageDataSnapshot | null) => void;
  clearSnapshot: () => void;
}

const PageDataValueContext = createContext<PageDataSnapshot | null>(null);
const PageDataSetterContext = createContext<SetterContextValue>({
  setSnapshot: () => {},
  clearSnapshot: () => {},
});

export function PageDataProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshotState] = useState<PageDataSnapshot | null>(null);

  const setSnapshot = useCallback((s: PageDataSnapshot | null) => {
    setSnapshotState(s);
  }, []);

  const clearSnapshot = useCallback(() => {
    setSnapshotState(null);
  }, []);

  const setterValue = useMemo(() => ({ setSnapshot, clearSnapshot }), [setSnapshot, clearSnapshot]);

  return (
    <PageDataSetterContext.Provider value={setterValue}>
      <PageDataValueContext.Provider value={snapshot}>
        {children}
      </PageDataValueContext.Provider>
    </PageDataSetterContext.Provider>
  );
}

/** Para ler o snapshot (usado pelo AI Chat) */
export function usePageDataValue() {
  return useContext(PageDataValueContext);
}

/** Para escrever o snapshot (usado pelas páginas que registram dados) */
export function usePageDataSetter() {
  return useContext(PageDataSetterContext);
}
