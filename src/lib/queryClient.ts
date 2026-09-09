import { QueryClient } from "@tanstack/react-query";

/**
 * Instância unificada do TanStack QueryClient para alta performance.
 * - staleTime: 3 minutos (dados em cache considerados frescos; alternar abas é instantâneo a 0ms).
 * - gcTime: 15 minutos (dados permanecem em memória durante toda a sessão de navegação).
 * - refetchOnWindowFocus: false (evita picos e re-renders ao alternar entre abas do SO).
 * - refetchOnMount: false (se os dados estão no cache e não expirados, nunca re-busca ao montar).
 */
export function createConfiguredQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 3,
        gcTime: 1000 * 60 * 15,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: "always",
        retry: 1,
      },
    },
  });
}
