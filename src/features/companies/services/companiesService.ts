import { leadsService, type LeadItem } from "@/features/leads";
import type { EmpresaItem, ResumoInteligencia } from "../types";

export const companiesService = {
  async listarEmpresas(): Promise<EmpresaItem[]> {
    const leads = await leadsService.listarLeads();
    return leads.map((l) => ({
      ...l,
      responsavel: "Equipe Comercial",
      valor_potencial: this.estimarValorPotencial(l),
      total_contatos: l.telefone ? 1 : 0,
    }));
  },

  async obterEmpresaPorId(id: string): Promise<EmpresaItem | null> {
    const lead = await leadsService.obterLeadPorId(id);
    if (!lead) return null;

    return {
      ...lead,
      responsavel: "Equipe Comercial",
      valor_potencial: this.estimarValorPotencial(lead),
      total_contatos: lead.telefone ? 1 : 0,
    };
  },

  estimarValorPotencial(lead: LeadItem): number {
    const cat = (lead.categoria || "").toLowerCase();
    if (cat.includes("clinica") || cat.includes("advocacia") || cat.includes("imobiliaria")) {
      return 3500;
    }
    if (cat.includes("restaurante") || cat.includes("estetica") || cat.includes("academia")) {
      return 2500;
    }
    return 1800;
  },

  gerarResumoInteligencia(lead: LeadItem): ResumoInteligencia {
    const pontosFortes: string[] = [];
    const riscos: string[] = [];

    if (!lead.tem_site) {
      pontosFortes.push("Carência evidente de portal web profissional para conversão.");
    } else {
      riscos.push("Já possui site institucional ativo — abordagem deve focar em performance e SEO.");
    }

    if (lead.instagram) {
      pontosFortes.push(`Presença digital ativa no Instagram (@${lead.instagram}) com público engajado.`);
    } else {
      riscos.push("Sem perfil no Instagram mapeado.");
    }

    if (lead.avaliacao_google && lead.avaliacao_google >= 4.0) {
      pontosFortes.push(`Excelente reputação no Google (${lead.avaliacao_google.toFixed(1)} estrelas).`);
    }

    if (!lead.telefone) {
      riscos.push("Telefone direto não cadastrado.");
    }

    let nivelProntidao: "alto" | "medio" | "baixo" = "medio";
    if (lead.score >= 75) nivelProntidao = "alto";
    else if (lead.score < 45) nivelProntidao = "baixo";

    const sumario = `Estabelecimento do nicho de ${lead.categoria}, situado em ${lead.bairro ? `${lead.bairro}, ` : ""}${lead.cidade || "Brasil"}, classificado com Score ${lead.score}/100. ${!lead.tem_site ? "Apresenta alta necessidade de implantação de site para captação de clientes." : "Possui presença digital existente, com potencial para otimização de conversão."}`;

    const recomendacaoAcao =
      lead.score >= 70
        ? "Iniciar abordagem comercial via WhatsApp apresentando modelo de site focado no nicho."
        : "Qualificar dados adicionais de contato e decisor antes do primeiro contato.";

    return {
      sumario,
      recomendacaoAcao,
      pontosFortes,
      riscos,
      nivelProntidao,
    };
  },
};
