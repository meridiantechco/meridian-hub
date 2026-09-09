import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface PageHeaderData {
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
}

interface PageHeaderContextType {
  header: PageHeaderData;
  setHeader: (data: PageHeaderData) => void;
  isPersistentLayout: boolean;
}

const defaultHeader: PageHeaderData = {
  titulo: "Meridian Hub",
};

const PageHeaderContext = createContext<PageHeaderContextType>({
  header: defaultHeader,
  setHeader: () => {},
  isPersistentLayout: false,
});

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [header, setHeader] = useState<PageHeaderData>(defaultHeader);

  return (
    <PageHeaderContext.Provider value={{ header, setHeader, isPersistentLayout: true }}>
      {children}
    </PageHeaderContext.Provider>
  );
}

export function usePageHeaderContext() {
  return useContext(PageHeaderContext);
}

/**
 * Hook para páginas atualizarem dinamicamente o título, descrição e ações da Topbar
 * sem causar re-render na Sidebar ou na estrutura de navegação.
 */
export function usePageHeader({ titulo, descricao, acoes }: PageHeaderData) {
  const { setHeader, isPersistentLayout } = usePageHeaderContext();

  useEffect(() => {
    if (isPersistentLayout) {
      setHeader({ titulo, descricao, acoes });
    }
  }, [titulo, descricao, acoes, isPersistentLayout, setHeader]);

  return { isPersistentLayout };
}

