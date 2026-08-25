import { useState, useEffect, useRef, useCallback } from "react";
import type { LeadItem } from "@/lib/leads-mock";
import { prospectaService } from "@/lib/prospecta-service";

export interface BoundingBox {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}

export interface FiltrosBuscaMapa {
  categoria?: string;
  status?: string;
  apenasSemSite?: boolean;
  scoreMinimo?: number | null;
  termo?: string;
}

export interface UseMapSearchOptions {
  bounds: BoundingBox | null;
  filtros: FiltrosBuscaMapa;
  buscarAoMover: boolean;
  debounceMs?: number;
  leadsIniciais?: LeadItem[];
}

export function useMapSearch({
  bounds,
  filtros,
  buscarAoMover,
  debounceMs = 450,
  leadsIniciais = [],
}: UseMapSearchOptions) {
  const [leads, setLeads] = useState<LeadItem[]>(leadsIniciais);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Executa busca com controle de cancelamento e debounce
  const executarBusca = useCallback(
    async (boundsParaBusca: BoundingBox, forcar = false) => {
      // Se a busca automática ao mover estiver desligada e não for forçada, ignorar
      if (!buscarAoMover && !forcar) {
        return;
      }

      // Cancelar requisição anterior em andamento
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setCarregando(true);
      setErro(null);

      try {
        const resultados = await prospectaService.buscarLeadsPorBounds(
          {
            swLat: boundsParaBusca.swLat,
            swLng: boundsParaBusca.swLng,
            neLat: boundsParaBusca.neLat,
            neLng: boundsParaBusca.neLng,
            categoria: filtros.categoria,
            status: filtros.status,
            apenasSemSite: filtros.apenasSemSite,
            scoreMinimo: filtros.scoreMinimo ?? undefined,
            termo: filtros.termo,
            limite: 200,
          },
          controller.signal
        );

        if (!controller.signal.aborted) {
          setLeads(resultados);
          setCarregando(false);
        }
      } catch (err: any) {
        if (err?.name === "AbortError" || controller.signal.aborted) {
          // Requisição cancelada por uma nova ação do usuário, ignorar
          return;
        }
        console.error("Erro na busca por viewport:", err);
        setErro("Não foi possível carregar os estabelecimentos desta área.");
        setCarregando(false);
      }
    },
    [buscarAoMover, filtros]
  );

  // Gatilho com Debounce ao mudar bounds ou filtros
  useEffect(() => {
    if (!bounds) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      void executarBusca(bounds);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [bounds, filtros, buscarAoMover, debounceMs, executarBusca]);

  // Função manual para o botão "Buscar nesta área" (estilo Airbnb)
  const buscarNestaArea = useCallback(async () => {
    if (bounds) {
      await executarBusca(bounds, true);
    }
  }, [bounds, executarBusca]);

  return {
    leads,
    carregando,
    erro,
    buscarNestaArea,
    totalResultados: leads.length,
  };
}
