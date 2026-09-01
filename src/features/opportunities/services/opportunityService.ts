import type { LeadItem } from "@/features/leads";
import type { FatorScore, OportunidadeEnriquecida, ProximaAcao, CategoriaOportunidade } from "../types";

export const opportunityService = {
  calcularFatoresScore(lead: LeadItem): FatorScore[] {
    const fatores: FatorScore[] = [];

    // 1. Presença digital / Ausência de site
    if (!lead.tem_site) {
      fatores.push({
        rotulo: "Carência de Site Próprio",
        pontos: 25,
        tipo: "positivo",
        descricao: "O estabelecimento opera apenas com presença local/social, necessitando de portal web profissional.",
      });
    } else {
      fatores.push({
        rotulo: "Possui Website",
        pontos: 5,
        tipo: "neutro",
        descricao: "Já possui website, oportunidade focada em redesign, SEO ou otimização de conversão.",
      });
    }

    // 2. Categoria estratégica
    const categoriasTop = [
      "restaurante",
      "barbearia",
      "clinica",
      "dentista",
      "estetica",
      "advocacia",
      "petshop",
      "academia",
      "otica",
    ];
    const catNome = lead.categoria.toLowerCase();
    const ehTop = categoriasTop.some((t) => catNome.includes(t));

    if (ehTop) {
      fatores.push({
        rotulo: "Categoria Estratégica B2B",
        pontos: 20,
        tipo: "positivo",
        descricao: `Nicho de mercado (${lead.categoria}) com alta demanda por captação e agendamento digital.`,
      });
    } else {
      fatores.push({
        rotulo: "Segmento Comercial Geral",
        pontos: 10,
        tipo: "neutro",
        descricao: "Setor tradicional com ciclo de vendas padrão.",
      });
    }

    // 3. Avaliação e Reputação Google Places
    if (lead.avaliacao_google && lead.avaliacao_google >= 4.2) {
      fatores.push({
        rotulo: "Excelente Reputação Google",
        pontos: 18,
        tipo: "positivo",
        descricao: `Nota ${lead.avaliacao_google.toFixed(1)} com ${lead.total_avaliacoes} avaliações comprova público fiel e faturamento ativo.`,
      });
    } else if (lead.total_avaliacoes > 10) {
      fatores.push({
        rotulo: "Volume de Avaliações",
        pontos: 10,
        tipo: "neutro",
        descricao: `${lead.total_avaliacoes} avaliações no Google Places indicam operação estabelecida.`,
      });
    }

    // 4. Contato Válido & WhatsApp
    if (lead.telefone) {
      fatores.push({
        rotulo: "Telefone Direto Mapeado",
        pontos: 15,
        tipo: "positivo",
        descricao: "Telefone e canal de WhatsApp direto identificados para abordagem rápida.",
      });
    }

    // 5. Instagram Ativo
    if (lead.instagram) {
      fatores.push({
        rotulo: "Presença Ativa no Instagram",
        pontos: 12,
        tipo: "positivo",
        descricao: `@${lead.instagram} investe em marketing social, demonstrando maturidade comercial.`,
      });
    }

    // 6. Localização Estratégica
    if (lead.bairro || lead.cidade) {
      fatores.push({
        rotulo: "Geolocalização Validada",
        pontos: 10,
        tipo: "positivo",
        descricao: `Polo comercial em ${lead.bairro ? `${lead.bairro}, ` : ""}${lead.cidade || "Região Metropolitana"}.`,
      });
    }

    return fatores;
  },

  calcularProximaAcao(lead: LeadItem, diasSemContato: number): ProximaAcao {
    if (lead.status === "novo") {
      if (lead.score >= 70) {
        return {
          titulo: "Disparar Primeiro Contato via WhatsApp",
          motivo: `Oportunidade quente (Score ${lead.score}) sem contato prévio. Apresente modelo comercial com foco em captação.`,
          tipo: "whatsapp",
          urgencia: "alta",
        };
      }
      return {
        titulo: "Qualificar e Iniciar Abordagem",
        motivo: "Estabelecimento recém-minerado na base. Enviar mensagem institucional padrão.",
        tipo: "whatsapp",
        urgencia: "normal",
      };
    }

    if (lead.status === "contatado") {
      if (diasSemContato >= 3) {
        return {
          titulo: "Realizar Follow-up de Apresentação",
          motivo: `Contato inicial realizado há ${diasSemContato} dias sem avanço para proposta. Reative a conversa.`,
          tipo: "follow_up",
          urgencia: "alta",
        };
      }
      return {
        titulo: "Agendar Reunião de Demonstração",
        motivo: "Apresentar proposta de implantação de site e presença Google.",
        tipo: "reuniao",
        urgencia: "media",
      };
    }

    if (lead.status === "proposta") {
      if (diasSemContato >= 2) {
        return {
          titulo: "Cobrar Retorno da Proposta Comercial",
          motivo: `Proposta enviada há ${diasSemContato} dias. Verifique se o tomador de decisão possui dúvidas sobre o escopo ou valor.`,
          tipo: "follow_up",
          urgencia: "alta",
        };
      }
      return {
        titulo: "Negociar Condições e Fechamento",
        motivo: "Ajustar prazo de entrega ou forma de pagamento para selar o contrato.",
        tipo: "proposta",
        urgencia: "media",
      };
    }

    if (lead.status === "fechado") {
      return {
        titulo: "Onboarding & Coleta de Briefing",
        motivo: "Contrato fechado com sucesso! Iniciar coleta de identidade visual e dados para o desenvolvimento.",
        tipo: "reuniao",
        urgencia: "normal",
      };
    }

    return {
      titulo: "Reavaliar Motivo de Recusa",
      motivo: "Lead arquivado ou recusado. Oportunidade para reativação em 60 dias com nova oferta.",
      tipo: "follow_up",
      urgencia: "normal",
    };
  },

  calcularValorEstimado(lead: LeadItem): number {
    const cat = (lead.categoria || "").toLowerCase();
    if (cat.includes("clinica") || cat.includes("advocacia") || cat.includes("imobiliaria")) {
      return 3500;
    }
    if (cat.includes("restaurante") || cat.includes("estetica") || cat.includes("academia")) {
      return 2500;
    }
    if (cat.includes("barbearia") || cat.includes("petshop") || cat.includes("otica")) {
      return 1800;
    }
    return 2000;
  },

  enriquecerOportunidades(leads: LeadItem[]): OportunidadeEnriquecida[] {
    const agora = new Date().getTime();

    return leads.map((lead) => {
      const criadoEm = new Date(lead.criado_em).getTime();
      const diasSemContato = Math.max(0, Math.floor((agora - criadoEm) / (1000 * 60 * 60 * 24)));
      const fatoresScore = this.calcularFatoresScore(lead);
      const proximaAcao = this.calcularProximaAcao(lead, diasSemContato);
      const valorEstimadoContrato = this.calcularValorEstimado(lead);

      const categoriasOportunidade: CategoriaOportunidade[] = ["todas"];

      if (lead.score >= 75 && (lead.status === "novo" || lead.status === "contatado")) {
        categoriasOportunidade.push("quentes");
      }

      if (
        (lead.status === "proposta" || lead.status === "contatado") &&
        diasSemContato >= 3
      ) {
        categoriasOportunidade.push("em_risco");
      }

      if (diasSemContato <= 2 && lead.status === "novo") {
        categoriasOportunidade.push("novas");
      }

      if (diasSemContato >= 5 && lead.status !== "fechado" && lead.status !== "recusado") {
        categoriasOportunidade.push("paradas");
      }

      if (valorEstimadoContrato >= 2500 || lead.score >= 80) {
        categoriasOportunidade.push("alto_potencial");
      }

      return {
        lead,
        score: lead.score,
        categoriaOportunidade: categoriasOportunidade,
        fatoresScore,
        proximaAcao,
        diasSemContato,
        valorEstimadoContrato,
        responsavelNome: "Equipe Comercial",
      };
    });
  },
};
