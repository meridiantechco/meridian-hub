import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { leadsService } from "@/features/leads";
import { auditoriaService } from "@/features/audit";
import { prospectingService } from "../services/prospectingService";
import type { LeadEncontrado } from "../types";
import { toast } from "sonner";

export function useProspecting() {
  const navigate = useNavigate();

  const [categoria, setCategoria] = useState("Restaurante");
  const [regiao, setRegiao] = useState("São Paulo, SP");
  const [raioKm, setRaioKm] = useState([5]);
  const [buscando, setBuscando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [carregandoMais, setCarregandoMais] = useState(false);

  const [resultados, setResultados] = useState<LeadEncontrado[]>([]);
  const [modoVisualizacao, setModoVisualizacao] = useState<"tabela" | "grade">("tabela");
  const [buscaRealizada, setBuscaRealizada] = useState(false);
  const [origemBusca, setOrigemBusca] = useState<string>("Google Places API");
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [offsetSimulacao, setOffsetSimulacao] = useState(1);

  const [filtroLista, setFiltroLista] = useState<
    "todos" | "sem_site" | "alta_prioridade" | "com_whatsapp"
  >("todos");

  const executarBusca = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!categoria.trim()) {
      toast.error("Informe a categoria do negócio");
      return;
    }

    setBuscando(true);
    setResultados([]);
    setNextPageToken(null);
    setOffsetSimulacao(1);
    setBuscaRealizada(true);

    try {
      const res = await prospectingService.buscarEstabelecimentos(
        categoria,
        regiao,
        raioKm[0] ?? 5,
      );
      setResultados(res.resultados);
      setNextPageToken(res.nextPageToken);
      setOrigemBusca(res.origem);

      const semSite = res.resultados.filter((e) => !e.tem_site).length;
      toast.success(`${res.resultados.length} estabelecimentos detectados!`, {
        description: `${semSite} sem site próprio · Instagram associado automaticamente.`,
      });
    } catch (err: any) {
      toast.error("Erro na busca de estabelecimentos", {
        description: err?.message || String(err),
      });
    } finally {
      setBuscando(false);
    }
  };

  const carregarMaisEstabelecimentos = async () => {
    setCarregandoMais(true);
    try {
      const res = await prospectingService.carregarMaisEstabelecimentos(
        categoria,
        regiao,
        nextPageToken,
        offsetSimulacao,
      );

      setNextPageToken(res.novoNextPageToken);
      setOffsetSimulacao(res.novoOffset);

      setResultados((prev) => {
        const idsExistentes = new Set(prev.map((p) => p.idTemp));
        const filtrados = res.resultados.filter((n) => !idsExistentes.has(n.idTemp));
        const combinado = [...prev, ...filtrados];
        combinado.sort((a, b) => b.score - a.score);
        return combinado;
      });

      toast.success(`Mais ${res.resultados.length} estabelecimentos adicionados!`);
    } catch {
      toast.error("Não foi possível carregar mais estabelecimentos.");
    } finally {
      setCarregandoMais(false);
    }
  };

  const alternarSelecao = (idTemp: string) => {
    setResultados((prev) =>
      prev.map((item) =>
        item.idTemp === idTemp ? { ...item, selecionado: !item.selecionado } : item,
      ),
    );
  };

  const selecionarTodos = () => {
    const todosJaSelecionados = resultados.every((r) => r.selecionado);
    setResultados((prev) => prev.map((r) => ({ ...r, selecionado: !todosJaSelecionados })));
  };

  const selecionarApenasSemSite = () => {
    setResultados((prev) =>
      prev.map((r) => ({
        ...r,
        selecionado: !r.tem_site,
      })),
    );
    toast.info("Apenas estabelecimentos sem site selecionados!");
  };

  const salvarLeadsSelecionados = async () => {
    const selecionados = resultados.filter((r) => r.selecionado);
    if (selecionados.length === 0) {
      toast.error("Selecione ao menos um estabelecimento para importar.");
      return;
    }

    setSalvando(true);
    try {
      const payloadLeads = selecionados.map((item) => ({
        nome: item.nome,
        categoria: item.categoria,
        endereco: item.endereco,
        bairro: item.bairro,
        cidade: item.cidade,
        estado: item.estado,
        latitude: item.latitude,
        longitude: item.longitude,
        telefone: item.telefone || null,
        whatsapp_link: item.whatsapp_link || null,
        instagram: item.instagram || null,
        facebook: item.facebook || null,
        site_url: item.site_url || null,
        tem_site: item.tem_site,
        avaliacao_google: item.avaliacao_google,
        total_avaliacoes: item.total_avaliacoes,
        place_id: item.place_id,
        score: item.score,
        status: "novo" as const,
        origem: "google_places" as const,
      }));

      const payloadBusca = {
        termo_busca: `${categoria} em ${regiao}`,
        categoria,
        regiao,
        raio_km: raioKm[0] ?? 5,
        total_resultados: resultados.length,
        total_sem_site: resultados.filter((r) => !r.tem_site).length,
      };

      const res = await leadsService.salvarNovosLeads(payloadLeads, payloadBusca);

      await auditoriaService.registrarAtividade({
        tipo: "mineracao",
        titulo: `Varredura: ${categoria} em ${regiao}`,
        descricao: `${res.importados} novos estabelecimentos minerados e cadastrados no Meridian Hub.`,
        metadados: {
          categoria,
          regiao,
          total_importados: res.importados,
          total_sem_site: selecionados.filter((s) => !s.tem_site).length,
        },
      });

      toast.success(`🎉 ${res.importados} estabelecimentos importados com sucesso!`, {
        description: "Redirecionando para a sua base consolidada...",
      });

      setTimeout(() => {
        void navigate({ to: "/leads" });
      }, 1000);
    } catch {
      toast.error("Erro ao salvar novos estabelecimentos.");
    } finally {
      setSalvando(false);
    }
  };

  const resultadosFiltrados = useMemo(() => {
    if (filtroLista === "sem_site") {
      return resultados.filter((r) => !r.tem_site);
    }
    if (filtroLista === "alta_prioridade") {
      return resultados.filter((r) => r.score >= 70);
    }
    if (filtroLista === "com_whatsapp") {
      return resultados.filter((r) => Boolean(r.telefone));
    }
    return resultados;
  }, [resultados, filtroLista]);

  return {
    categoria,
    setCategoria,
    regiao,
    setRegiao,
    raioKm,
    setRaioKm,
    buscando,
    salvando,
    carregandoMais,
    resultados,
    setResultados,
    resultadosFiltrados,
    modoVisualizacao,
    setModoVisualizacao,
    buscaRealizada,
    origemBusca,
    filtroLista,
    setFiltroLista,
    executarBusca,
    carregarMaisEstabelecimentos,
    alternarSelecao,
    selecionarTodos,
    selecionarApenasSemSite,
    salvarLeadsSelecionados,
  };
}
