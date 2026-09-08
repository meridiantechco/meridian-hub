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

      const regiao = leads.find((l) => l.categoria === cat)?.cidade || "Região Mapeada";

      return {
        id: `sinal-${idx}`,
        nicho: cat,
        regiao,
        scoreMedio,
        volumeContas: stats.total,
        taxaSemSite,
        variacaoDemanda: `+${10 + (idx % 15)}%`,
        statusOportunidade: status,
        recomendacao:
          taxaSemSite >= 50
            ? `Alta concentração de estabelecimentos sem site. Recomenda-se campanha de WhatsApp com modelos de cardápio/agendamento.`
            : `Segmento com foco em propostas de modernização, tráfego local e SEO Google.`,
      };
    });

    return sinais.sort((a, b) => b.scoreMedio - a.scoreMedio);
  },

  async obterMudancasDetectadas(): Promise<MudancaDetectada[]> {
    const leads = await leadsService.listarLeads();
    if (leads.length === 0) return [];

    const mudancas: MudancaDetectada[] = [];

    leads.slice(0, 10).forEach((l, idx) => {
      if (!l.tem_site && (l.total_avaliacoes ?? 0) > 5) {
        mudancas.push({
          id: `m-site-${l.id}`,
          empresa_nome: l.nome,
          empresa_id: l.id,
          tipoMudanca: "sem_site_ativo",
          descricao: `Detectada carência de website próprio e ${l.total_avaliacoes} avaliações no Google Places.`,
          data_deteccao: l.atualizado_em || l.criado_em,
        });
      } else if (l.instagram) {
        mudancas.push({
          id: `m-insta-${l.id}`,
          empresa_nome: l.nome,
          empresa_id: l.id,
          tipoMudanca: "instagram_ativo",
          descricao: `Presença digital mapeada no Instagram (@${l.instagram}).`,
          data_deteccao: l.atualizado_em || l.criado_em,
        });
      } else if (l.telefone) {
        mudancas.push({
          id: `m-tel-${l.id}`,
          empresa_nome: l.nome,
          empresa_id: l.id,
          tipoMudanca: "novo_telefone",
          descricao: `Contato direto mapeado para abordagem comercial imediata.`,
          data_deteccao: l.atualizado_em || l.criado_em,
        });
      }
    });

    return mudancas;
  },
};
