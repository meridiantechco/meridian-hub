import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import type {
  CategoriaDespesa,
  CategoriaReceita,
  MetricasFinanceiras,
  RecorrenciaTransacao,
  TransacaoFinanceira,
} from "../types";

export const financialService = {
  /**
   * Retorna todas as transações cadastradas (receitas e despesas) direto do Supabase
   */
  async listarTransacoes(): Promise<TransacaoFinanceira[]> {
    const { data, error } = await supabase
      .from("transacoes_financeiras")
      .select("*")
      .order("data_competencia", { ascending: false });

    if (error) {
      console.error("Erro ao listar transações financeiras:", error);
      return [];
    }

    return (data as TransacaoFinanceira[]) || [];
  },

  /**
   * Cria uma nova transação financeira
   */
  async criarTransacao(
    dados: Omit<TransacaoFinanceira, "id" | "criado_em">,
  ): Promise<TransacaoFinanceira> {
    const payload: TablesInsert<"transacoes_financeiras"> = {
      tipo: dados.tipo,
      titulo: dados.titulo,
      descricao: dados.descricao ?? null,
      categoria: dados.categoria,
      valor: dados.valor,
      data_competencia: dados.data_competencia,
      data_pagamento: dados.data_pagamento ?? null,
      recorrencia: dados.recorrencia,
      status: dados.status,
      lead_id: dados.lead_id ?? null,
      lead_nome: dados.lead_nome ?? null,
    };

    const { data, error } = await supabase
      .from("transacoes_financeiras")
      .insert(payload)
      .select()
      .single();

    if (error || !data) {
      console.error("Erro ao criar transação no Supabase:", error);
      throw new Error(error?.message || "Falha ao criar transação financeira");
    }

    return data as TransacaoFinanceira;
  },

  /**
   * Atualiza uma transação financeira existente
   */
  async atualizarTransacao(
    id: string,
    dados: Partial<Omit<TransacaoFinanceira, "id" | "criado_em">>,
  ): Promise<TransacaoFinanceira | null> {
    const payload: TablesUpdate<"transacoes_financeiras"> = {
      ...dados,
      atualizado_em: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("transacoes_financeiras")
      .update(payload)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Erro ao atualizar transação no Supabase:", error);
      return null;
    }

    return (data as TransacaoFinanceira) || null;
  },

  /**
   * Exclui uma transação financeira
   */
  async excluirTransacao(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("transacoes_financeiras")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao excluir transação no Supabase:", error);
      return false;
    }

    return true;
  },

  /**
   * Calcula todas as métricas financeiras consolidadas
   */
  calcularMetricas(
    transacoes: TransacaoFinanceira[],
    filtroMes?: string | null,
  ): MetricasFinanceiras {
    const lista = transacoes.filter((t) => {
      if (t.status === "cancelado") return false;
      if (filtroMes && filtroMes !== "todos") {
        return t.data_competencia.startsWith(filtroMes);
      }
      return true;
    });

    let receitaTotal = 0;
    let receitaRecebida = 0;
    let receitaPendente = 0;

    let despesaTotal = 0;
    let despesaPaga = 0;
    let despesaPendente = 0;

    const gastosPorCategoria: Record<string, number> = {
      tecnologia: 0,
      marketing: 0,
      equipe: 0,
      operacional: 0,
      impostos: 0,
      outros: 0,
    };

    const receitasPorCategoria: Record<string, number> = {
      venda_site: 0,
      mensalidade: 0,
      consultoria: 0,
      gestao_trafego: 0,
      outra_receita: 0,
    };

    for (const t of lista) {
      if (t.tipo === "receita") {
        receitaTotal += t.valor;
        if (t.status === "pago") {
          receitaRecebida += t.valor;
        } else if (t.status === "pendente") {
          receitaPendente += t.valor;
        }
        receitasPorCategoria[t.categoria] = (receitasPorCategoria[t.categoria] || 0) + t.valor;
      } else if (t.tipo === "despesa") {
        despesaTotal += t.valor;
        if (t.status === "pago") {
          despesaPaga += t.valor;
        } else if (t.status === "pendente") {
          despesaPendente += t.valor;
        }
        gastosPorCategoria[t.categoria] = (gastosPorCategoria[t.categoria] || 0) + t.valor;
      }
    }

    const lucroLiquido = receitaTotal - despesaTotal;
    const margemLucroPercentual =
      receitaTotal > 0 ? Number(((lucroLiquido / receitaTotal) * 100).toFixed(1)) : 0;
    const roiMultiplicador =
      despesaTotal > 0 ? Number((receitaTotal / despesaTotal).toFixed(2)) : 0;

    const mapaMeses: Record<string, { receita: number; despesa: number }> = {};

    for (const t of transacoes) {
      if (t.status === "cancelado") continue;
      const chaveMes = t.data_competencia.slice(0, 7);
      if (!mapaMeses[chaveMes]) {
        mapaMeses[chaveMes] = { receita: 0, despesa: 0 };
      }
      if (t.tipo === "receita") {
        mapaMeses[chaveMes].receita += t.valor;
      } else {
        mapaMeses[chaveMes].despesa += t.valor;
      }
    }

    const mesesOrdenados = Object.keys(mapaMeses).sort();
    const mesesNomes = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    const evolucaoMensal = mesesOrdenados.map((m) => {
      const [ano, mesNum] = m.split("-");
      const idxMes = parseInt(mesNum || "1", 10) - 1;
      const rotulo = `${mesesNomes[idxMes] || mesNum}/${ano?.slice(2)}`;
      const rec = mapaMeses[m]?.receita ?? 0;
      const desp = mapaMeses[m]?.despesa ?? 0;
      return {
        mes: m,
        mesRotulo: rotulo,
        receita: Number(rec.toFixed(2)),
        despesa: Number(desp.toFixed(2)),
        lucro: Number((rec - desp).toFixed(2)),
      };
    });

    return {
      receitaTotal: Number(receitaTotal.toFixed(2)),
      receitaRecebida: Number(receitaRecebida.toFixed(2)),
      receitaPendente: Number(receitaPendente.toFixed(2)),
      despesaTotal: Number(despesaTotal.toFixed(2)),
      despesaPaga: Number(despesaPaga.toFixed(2)),
      despesaPendente: Number(despesaPendente.toFixed(2)),
      lucroLiquido: Number(lucroLiquido.toFixed(2)),
      margemLucroPercentual,
      roiMultiplicador,
      gastosPorCategoria,
      receitasPorCategoria,
      evolucaoMensal,
    };
  },

  async registrarReceitaLeadFechado(
    leadId: string,
    leadNome: string,
    valorContrato: number,
    categoria: CategoriaReceita = "venda_site",
    tipoRecorrencia: RecorrenciaTransacao = "pontual",
  ): Promise<TransacaoFinanceira> {
    return this.criarTransacao({
      tipo: "receita",
      titulo: `Contrato Fechado — ${leadNome}`,
      descricao: `Receita gerada pelo fechamento do estabelecimento ${leadNome} no Funil de Vendas`,
      categoria,
      valor: valorContrato,
      data_competencia: new Date().toISOString().slice(0, 10),
      data_pagamento: new Date().toISOString().slice(0, 10),
      recorrencia: tipoRecorrencia,
      status: "pago",
      lead_id: leadId,
      lead_nome: leadNome,
    });
  },

  async zerarTransacoes(): Promise<number> {
    const { count, error } = await supabase
      .from("transacoes_financeiras")
      .delete({ count: "exact" })
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      console.error("Erro ao zerar transações financeiras:", error);
    }
    return count ?? 0;
  },
};

export const ROTULOS_CATEGORIAS_DESPESA: Record<
  CategoriaDespesa,
  { rotulo: string; descricao: string; cor: string; icone: string }
> = {
  tecnologia: {
    rotulo: "Tecnologia & APIs",
    descricao: "Google Places API, Supabase, Servidores, Domínios e Cloud",
    cor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    icone: "Cpu",
  },
  marketing: {
    rotulo: "Marketing & Vendas",
    descricao: "WhatsApp API, Anúncios Meta/Google, Comissões e Tráfego",
    cor: "text-pink-400 bg-pink-500/10 border-pink-500/30",
    icone: "Megaphone",
  },
  equipe: {
    rotulo: "Equipe & Pessoal",
    descricao: "Salários, Pró-labore, Freelancers e Designers",
    cor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    icone: "Users",
  },
  operacional: {
    rotulo: "Custos Operacionais",
    descricao: "Internet, Luz, Telefonia e Softwares de Gestão",
    cor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    icone: "Building2",
  },
  impostos: {
    rotulo: "Impostos & Tributos",
    descricao: "DAS MEI, Simples Nacional e Taxas de Gateway",
    cor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    icone: "Receipt",
  },
  outros: {
    rotulo: "Outros Gastos",
    descricao: "Despesas gerais e custos variáveis diversos",
    cor: "text-zinc-400 bg-zinc-500/10 border-zinc-500/30",
    icone: "Package",
  },
};

export const ROTULOS_CATEGORIAS_RECEITA: Record<
  CategoriaReceita,
  { rotulo: string; descricao: string; cor: string }
> = {
  venda_site: {
    rotulo: "Desenvolvimento de Site",
    descricao: "Criação de Landing Page ou Site Institucional",
    cor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  mensalidade: {
    rotulo: "Mensalidade / Hospedagem",
    descricao: "Recorrência mensal de manutenção (MRR)",
    cor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  },
  consultoria: {
    rotulo: "Consultoria & Google Meu Negócio",
    descricao: "Otimização de Perfil, SEO Local e Catálogo",
    cor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  },
  gestao_trafego: {
    rotulo: "Gestão de Tráfego & Redes",
    descricao: "Gerenciamento de anúncios e perfil do Instagram",
    cor: "text-pink-400 bg-pink-500/10 border-pink-500/30",
  },
  outra_receita: {
    rotulo: "Outras Receitas",
    descricao: "Serviços comerciais complementares",
    cor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
};

export const financeiroService = financialService;
