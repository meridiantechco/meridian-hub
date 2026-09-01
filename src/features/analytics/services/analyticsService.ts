import { leadsService } from "@/features/leads";
import { financialService } from "@/features/financial";
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
      .filter((t) => t.tipo === "receita" && t.status_pagamento === "pago")
      .reduce((acc, t) => acc + t.valor, 0);

    const ticketMedio = fechados > 0 ? Math.round(receitaFechada / fechados) || 2200 : 2200;

    return {
      leadsGerados,
      leadsQualificados,
      taxaConversaoGeral,
      pipelineEstimado,
      receitaFechada: receitaFechada || 8800,
      ticketMedio,
      tempoMedioFechamentoDias: 6,
    };
  },

  async obterDesempenhoEquipe(): Promise<DesempenhoVendedor[]> {
    const leads = await leadsService.listarLeads();
    const fechadosTotal = leads.filter((l) => l.status === "fechado").length;

    return [
      {
        id: "usr-1",
        nome: "Rayan Silva",
        papel: "Admin & Closer",
        leadsTrabalhados: Math.max(12, Math.floor(leads.length * 0.6)),
        contatosFeitos: 28,
        reunioesRealizadas: 8,
        propostasEnviadas: 6,
        fechamentos: Math.max(3, Math.ceil(fechadosTotal * 0.7)),
        receitaGerada: 7500,
        taxaConversao: 33,
      },
      {
        id: "usr-2",
        nome: "Equipe SDR",
        papel: "Pré-vendas & Prospecção",
        leadsTrabalhados: Math.max(8, Math.floor(leads.length * 0.4)),
        contatosFeitos: 45,
        reunioesRealizadas: 4,
        propostasEnviadas: 3,
        fechamentos: Math.max(1, Math.floor(fechadosTotal * 0.3)),
        receitaGerada: 2500,
        taxaConversao: 18,
      },
    ];
  },

  async obterDesempenhoGeografico(): Promise<DesempenhoGeografico[]> {
    const leads = await leadsService.listarLeads();

    const grupos: Record<string, { total: number; semSite: number; somaScore: number; fechados: number }> = {};

    leads.forEach((l) => {
      const cidade = l.cidade || "Salvador";
      const bairro = l.bairro || "Centro";
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
      const potencialTotal = st.total * 2200;

      return {
        cidade: cidade || "Salvador",
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
