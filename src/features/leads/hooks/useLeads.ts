import { useEffect, useState, useMemo } from "react";
import { leadsService } from "../services/leadsService";
import { auditoriaService } from "@/features/audit";
import type { LeadItem } from "../types";
import { toast } from "sonner";

export function useLeads() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroFaixaScore, setFiltroFaixaScore] = useState<string>("todos");
  const [filtroInstagram, setFiltroInstagram] = useState<"todos" | "com" | "sem">("todos");
  const [apenasSemSite, setApenasSemSite] = useState(false);
  const [ordenacao, setOrdenacao] = useState<"score" | "avaliacao" | "data">("score");

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const lista = await leadsService.listarLeads();
      setLeads(lista);
    } catch {
      toast.error("Erro ao carregar lista de estabelecimentos");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    void carregarDados();
  }, []);

  const categoriasDisponiveis = useMemo(() => {
    const set = new Set(leads.map((l) => l.categoria).filter(Boolean));
    return Array.from(set);
  }, [leads]);

  const mudarStatus = async (leadId: string, novoStatus: LeadItem["status"]) => {
    const leadAlvo = leads.find((l) => l.id === leadId);

    await leadsService.atualizarStatusLead(leadId, novoStatus);
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: novoStatus } : l)));

    await auditoriaService.registrarAtividade({
      tipo: "mudanca_status",
      titulo: `Status: ${leadAlvo?.nome || "Lead"} -> ${novoStatus.toUpperCase()}`,
      descricao: `Status comercial atualizado para "${novoStatus.toUpperCase()}"`,
      lead_id: leadId,
      lead_nome: leadAlvo?.nome,
      metadados: { novo_status: novoStatus },
    });

    toast.success(`Status de "${leadAlvo?.nome}" atualizado!`);
  };

  const zerarBase = async () => {
    const total = await leadsService.zerarBaseLeads();
    setLeads([]);

    await auditoriaService.registrarAtividade({
      tipo: "edicao_lead",
      titulo: "Base de Leads Zerada",
      descricao: `Todos os ${total} estabelecimentos foram removidos do sistema.`,
    });

    toast.success(`Base zerada! ${total} estabelecimentos removidos.`);
  };

  const leadsFiltrados = useMemo(() => {
    let resultado = [...leads];

    if (busca.trim()) {
      const termo = busca.toLowerCase();
      resultado = resultado.filter(
        (l) =>
          l.nome.toLowerCase().includes(termo) ||
          (l.categoria && l.categoria.toLowerCase().includes(termo)) ||
          (l.bairro && l.bairro.toLowerCase().includes(termo)) ||
          (l.cidade && l.cidade.toLowerCase().includes(termo)) ||
          (l.telefone && l.telefone.includes(termo)) ||
          (l.instagram && l.instagram.toLowerCase().includes(termo)),
      );
    }

    if (filtroCategoria !== "todas") {
      resultado = resultado.filter((l) => l.categoria === filtroCategoria);
    }

    if (filtroStatus !== "todos") {
      resultado = resultado.filter((l) => l.status === filtroStatus);
    }

    if (apenasSemSite) {
      resultado = resultado.filter((l) => !l.tem_site);
    }

    if (filtroInstagram === "com") {
      resultado = resultado.filter((l) => Boolean(l.instagram));
    } else if (filtroInstagram === "sem") {
      resultado = resultado.filter((l) => !l.instagram);
    }

    if (filtroFaixaScore === "alta") {
      resultado = resultado.filter((l) => l.score >= 70);
    } else if (filtroFaixaScore === "media") {
      resultado = resultado.filter((l) => l.score >= 40 && l.score < 70);
    } else if (filtroFaixaScore === "baixa") {
      resultado = resultado.filter((l) => l.score < 40);
    }

    resultado.sort((a, b) => {
      if (ordenacao === "score") {
        return b.score - a.score;
      }
      if (ordenacao === "avaliacao") {
        const notaA = a.avaliacao_google ?? 0;
        const notaB = b.avaliacao_google ?? 0;
        return notaB - notaA;
      }
      return new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime();
    });

    return resultado;
  }, [
    leads,
    busca,
    filtroCategoria,
    filtroStatus,
    apenasSemSite,
    filtroInstagram,
    filtroFaixaScore,
    ordenacao,
  ]);

  const removerLead = async (id: string) => {
    const ok = await leadsService.removerLead(id);
    if (ok) {
      setLeads((prev) => prev.filter((l) => l.id !== id));
    }
    return ok;
  };

  return {
    leads,
    leadsFiltrados,
    carregando,
    busca,
    setBusca,
    filtroCategoria,
    setFiltroCategoria,
    filtroStatus,
    setFiltroStatus,
    filtroFaixaScore,
    setFiltroFaixaScore,
    filtroInstagram,
    setFiltroInstagram,
    apenasSemSite,
    setApenasSemSite,
    ordenacao,
    setOrdenacao,
    categoriasDisponiveis,
    mudarStatus,
    zerarBase,
    removerLead,
    recarregar: carregarDados,
  };
}
