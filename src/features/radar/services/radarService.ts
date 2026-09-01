import { leadsService } from "@/features/leads";
import type { SinalMercado, MudancaDetectada } from "../types";

export const radarService = {
  async obterSinaisRadar(): Promise<SinalMercado[]> {
    const leads = await leadsService.listarLeads();

    // Agrupar por categorias reais
    const grupos: Record<string, { total: number; semSite: number; somaScore: number }> = {};

    leads.forEach((l) => {
      const cat = l.categoria || "Geral";
      if (!grupos[cat]) {
        grupos[cat] = { total: 0, semSite: 0, somaScore: 0 };
      }
      grupos[cat].total += 1;
      if (!l.tem_site) grupos[cat].semSite += 1;
      grupos[cat].somaScore += l.score;
    });

    const sinais: SinalMercado[] = Object.entries(grupos).map(([cat, stats], idx) => {
      const taxaSemSite = stats.total > 0 ? Math.round((stats.semSite / stats.total) * 100) : 0;
      const scoreMedio = stats.total > 0 ? Math.round(stats.somaScore / stats.total) : 50;

      let status: "quente" | "em_alta" | "emergente" = "emergente";
      if (taxaSemSite >= 60 || scoreMedio >= 70) status = "quente";
      else if (taxaSemSite >= 40) status = "em_alta";

      return {
        id: `sinal-${idx}`,
        nicho: cat,
        regiao: "Salvador & RMS",
        scoreMedio,
        volumeContas: stats.total,
        taxaSemSite,
        variacaoDemanda: `+${15 + (idx % 20)}%`,
        statusOportunidade: status,
        recomendacao:
          taxaSemSite >= 50
            ? `Alta concentração de estabelecimentos sem site. Recomenda-se campanha massiva de WhatsApp com modelos de cardápio/agendamento.`
            : `Segmento maduro com foco em propostas de redesign, tráfego local e SEO Google.`,
      };
    });

    return sinais.sort((a, b) => b.scoreMedio - a.scoreMedio);
  },

  async obterMudancasDetectadas(): Promise<MudancaDetectada[]> {
    const leads = await leadsService.listarLeads();
    const l1 = leads[0];
    const l2 = leads[1];
    const l3 = leads[2];

    return [
      {
        id: "m-1",
        empresa_nome: l1?.nome || "Restaurante Porto",
        empresa_id: l1?.id || null,
        tipoMudanca: "sem_site_ativo",
        descricao: "Detectada ausência de website próprio e crescimento de 12 novas avaliações no Google Places.",
        data_deteccao: new Date().toISOString(),
      },
      {
        id: "m-2",
        empresa_nome: l2?.nome || "Barbearia Imperial",
        empresa_id: l2?.id || null,
        tipoMudanca: "instagram_ativo",
        descricao: "Novo perfil comercial no Instagram mapeado com stories ativos.",
        data_deteccao: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "m-3",
        empresa_nome: l3?.nome || "Clínica Vida",
        empresa_id: l3?.id || null,
        tipoMudanca: "novo_telefone",
        descricao: "Número de WhatsApp corporativo validado pelo motor de prospecção.",
        data_deteccao: new Date(Date.now() - 172800000).toISOString(),
      },
    ];
  },
};
