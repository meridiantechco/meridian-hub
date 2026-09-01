import { leadsService } from "@/features/leads";
import { financialService } from "@/features/financial";
import { auditoriaService } from "@/features/audit";
import { supabase } from "@/integrations/supabase/client";
import type {
  MetricasGeraisAnalytics,
  DesempenhoVendedor,
  DesempenhoGeografico,
  RelatorioFiltros,
} from "../types";

export const analyticsService = {
  async obterMetricasGerais(): Promise<MetricasGeraisAnalytics> {
    const [leads, transacoes] = await Promise.all([
      leadsService.listarLeads(),
      financialService.listarTransacoes(),
    ]);

    const leadsGerados = leads.length;
    const leadsQualificados = leads.filter((l) => l.score >= 60).length;
    const fechados = leads.filter((l) => l.status === "fechado").length;
    const taxaConversaoGeral =
      leadsGerados > 0 ? Math.round((fechados / leadsGerados) * 100) : 0;

    const pipelineEstimado = leads.reduce((acc, l) => {
      const cat = (l.categoria || "").toLowerCase();
      let val = 2000;
      if (cat.includes("clinica") || cat.includes("advocacia")) val = 3500;
      else if (cat.includes("restaurante") || cat.includes("estetica")) val = 2500;
      return acc + val;
    }, 0);

    const receitaFechada = transacoes
      .filter((t) => t.tipo === "receita" && t.status === "pago")
      .reduce((acc, t) => acc + t.valor, 0);

    const ticketMedio = fechados > 0 ? Math.round(receitaFechada / fechados) : (receitaFechada > 0 ? receitaFechada : 0);

    return {
      leadsGerados,
      leadsQualificados,
      taxaConversaoGeral,
      pipelineEstimado,
      receitaFechada,
      ticketMedio,
      tempoMedioFechamentoDias: 6,
    };
  },

  async obterDesempenhoEquipe(): Promise<DesempenhoVendedor[]> {
    const [leads, usuarios, metricasAuditoria, transacoes] = await Promise.all([
      leadsService.listarLeads(),
      supabase.from("profiles").select("id, nome, email"),
      auditoriaService.obterMetricasUsuarios(),
      financialService.listarTransacoes(),
    ]);

    const perfis = usuarios.data || [];
    const fechadosTotal = leads.filter((l) => l.status === "fechado").length;
    const receitaTotal = transacoes
      .filter((t) => t.tipo === "receita" && t.status === "pago")
      .reduce((acc, t) => acc + t.valor, 0);

    if (perfis.length === 0) {
      return [];
    }

    return perfis.map((p, idx) => {
      const stats = metricasAuditoria[p.id] || metricasAuditoria[p.email] || {
        total: 0,
        whatsapp: 0,
        mudancas_status: 0,
        mineracoes: 0,
      };

      const leadsTrabalhados = leads.filter((l) => (l as any).responsavel_id === p.id).length || (idx === 0 ? leads.length : 0);
      const fechamentos = leads.filter((l) => (l as any).responsavel_id === p.id && l.status === "fechado").length || (idx === 0 ? fechadosTotal : 0);
      const contatosFeitos = stats.whatsapp || 0;
      const receitaGerada = transacoes
        .filter((t) => (t as any).usuario_id === p.id && t.tipo === "receita" && t.status === "pago")
        .reduce((acc, t) => acc + t.valor, 0) || (idx === 0 ? receitaTotal : 0);

      const taxaConversao = leadsTrabalhados > 0 ? Math.round((fechamentos / leadsTrabalhados) * 100) : 0;

      return {
        id: p.id,
        nome: p.nome || p.email?.split("@")[0] || "Consultor",
        papel: p.email === "meridiantech.co@gmail.com" ? "Administrador" : "Consultor Comercial",
        leadsTrabalhados,
        contatosFeitos,
        reunioesRealizadas: Math.floor(stats.mudancas_status / 2),
        propostasEnviadas: Math.floor(stats.mudancas_status / 3),
        fechamentos,
        receitaGerada,
        taxaConversao,
      };
    });
  },

  async obterDesempenhoGeografico(): Promise<DesempenhoGeografico[]> {
    const [leads, transacoes] = await Promise.all([
      leadsService.listarLeads(),
      financialService.listarTransacoes(),
    ]);

    const receitas = transacoes.filter((t) => t.tipo === "receita");
    const ticketMedio =
      receitas.length > 0
        ? Math.round(receitas.reduce((acc, t) => acc + t.valor, 0) / receitas.length)
        : 2500;

    const grupos: Record<string, { total: number; semSite: number; somaScore: number; fechados: number }> = {};

    leads.forEach((l) => {
      const cidade = l.cidade || "Região Mapeada";
      const bairro = l.bairro || "Geral";
      const chave = `${cidade} — ${bairro}`;

      if (!grupos[chave]) {
        grupos[chave] = { total: 0, semSite: 0, somaScore: 0, fechados: 0 };
      }
      grupos[chave].total += 1;
      if (!l.tem_site) grupos[chave].semSite += 1;
      grupos[chave].somaScore += l.score;
      if (l.status === "fechado") grupos[chave].fechados += 1;
    });

    const resultado: DesempenhoGeografico[] = Object.entries(grupos).map(([regiao, st]) => {
      const [cidade, bairro] = regiao.split(" — ");
      const scoreMedio = Math.round(st.somaScore / st.total);
      const taxaConversao = st.total > 0 ? Math.round((st.fechados / st.total) * 100) : 0;
      const potencialTotal = st.semSite * ticketMedio;

      return {
        cidade: cidade || "Região Mapeada",
        bairro: bairro || "Geral",
        totalLeads: st.total,
        semSite: st.semSite,
        scoreMedio,
        taxaConversao,
        potencialTotal,
      };
    });

    return resultado.sort((a, b) => b.totalLeads - a.totalLeads);
  },
};
