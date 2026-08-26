import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { financialService } from "../services/financialService";
import type { TransacaoFinanceira } from "../types";
import { auditoriaService } from "@/features/audit";

export function useFinancial() {
  const [transacoes, setTransacoes] = useState<TransacaoFinanceira[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroMes, setFiltroMes] = useState<string>("todos");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos");
  const [buscaTermo, setBuscaTermo] = useState<string>("");

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const lista = await financialService.listarTransacoes();
      setTransacoes(lista);
    } catch (err) {
      toast.error("Erro ao carregar dados financeiros");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    void carregarDados();
  }, []);

  const metricas = useMemo(() => {
    return financialService.calcularMetricas(transacoes, filtroMes);
  }, [transacoes, filtroMes]);

  const transacoesFiltradas = useMemo(() => {
    return transacoes.filter((t) => {
      if (filtroMes !== "todos" && !t.data_competencia.startsWith(filtroMes)) {
        return false;
      }
      if (filtroTipo !== "todos" && t.tipo !== filtroTipo) {
        return false;
      }
      if (filtroCategoria !== "todos" && t.categoria !== filtroCategoria) {
        return false;
      }
      if (buscaTermo.trim()) {
        const termo = buscaTermo.toLowerCase();
        const matchTitulo = t.titulo.toLowerCase().includes(termo);
        const matchDesc = (t.descricao || "").toLowerCase().includes(termo);
        const matchLead = (t.lead_nome || "").toLowerCase().includes(termo);
        if (!matchTitulo && !matchDesc && !matchLead) return false;
      }
      return true;
    });
  }, [transacoes, filtroMes, filtroTipo, filtroCategoria, buscaTermo]);

  const criarTransacao = async (dados: Omit<TransacaoFinanceira, "id" | "criado_em">) => {
    const nova = await financialService.criarTransacao(dados);
    setTransacoes((prev) => [nova, ...prev]);

    await auditoriaService.registrarAtividade({
      tipo: "financeiro",
      titulo: `Transação criada: ${dados.titulo}`,
      descricao: `${dados.tipo === "receita" ? "Receita" : "Despesa"} de R$ ${dados.valor.toFixed(2)} cadastrada`,
    });

    toast.success("Transação salva com sucesso!");
    return nova;
  };

  const atualizarTransacao = async (
    id: string,
    dados: Partial<Omit<TransacaoFinanceira, "id" | "criado_em">>,
  ) => {
    const atualizada = await financialService.atualizarTransacao(id, dados);
    if (atualizada) {
      setTransacoes((prev) => prev.map((t) => (t.id === id ? atualizada : t)));
      toast.success("Transação atualizada com sucesso!");
    }
    return atualizada;
  };

  const excluirTransacao = async (id: string, titulo?: string) => {
    await financialService.excluirTransacao(id);
    setTransacoes((prev) => prev.filter((t) => t.id !== id));

    await auditoriaService.registrarAtividade({
      tipo: "financeiro",
      titulo: `Transação removida`,
      descricao: `A transação "${titulo || id}" foi excluída.`,
    });

    toast.success("Transação removida!");
  };

  const zerarBase = async () => {
    await financialService.zerarTransacoes();
    setTransacoes([]);
    toast.success("Base de dados financeiros zerada.");
  };

  return {
    transacoes,
    transacoesFiltradas,
    metricas,
    carregando,
    filtroMes,
    setFiltroMes,
    filtroTipo,
    setFiltroTipo,
    filtroCategoria,
    setFiltroCategoria,
    buscaTermo,
    setBuscaTermo,
    criarTransacao,
    atualizarTransacao,
    excluirTransacao,
    zerarBase,
    recarregar: carregarDados,
  };
}
