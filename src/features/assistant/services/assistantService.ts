import { leadsService } from "@/features/leads";
import { opportunityService } from "@/features/opportunities";
import { tasksService } from "@/features/tasks";
import type { MensagemChat } from "../types";

export const assistantService = {
  async processarPergunta(pergunta: string): Promise<MensagemChat> {
    const termo = pergunta.toLowerCase();
    const leads = await leadsService.listarLeads();
    const oportunidades = opportunityService.enriquecerOportunidades(leads);

    let resposta = "";
    let metadadosLeads: { id: string; nome: string; categoria: string; score: number }[] | undefined = undefined;

    if (termo.includes("melhor") || termo.includes("score acima") || termo.includes("top")) {
      const topLeads = leads.filter((l) => l.score >= 75).slice(0, 5);
      metadadosLeads = topLeads.map((l) => ({ id: l.id, nome: l.nome, categoria: l.categoria, score: l.score }));

      resposta = `Encontrei **${topLeads.length} oportunidades de alto score** (Score &ge; 75) na sua base comercial:\n\n` +
        topLeads.map((l, i) => `${i + 1}. **${l.nome}** (${l.categoria}) — **Score ${l.score}** · ${!l.tem_site ? "⚡ Sem site" : "🌐 Com site"}`).join("\n") +
        `\n\n💡 *Recomendação:* Priorize o envio de propostas via WhatsApp para esses estabelecimentos hoje.`;
    } else if (termo.includes("risco") || termo.includes("parada") || termo.includes("atrasad")) {
      const emRisco = oportunidades.filter((o) => o.categoriaOportunidade.includes("em_risco") || o.categoriaOportunidade.includes("paradas")).slice(0, 5);
      metadadosLeads = emRisco.map((o) => ({ id: o.lead.id, nome: o.lead.nome, categoria: o.lead.categoria, score: o.score }));

      if (emRisco.length > 0) {
        resposta = `Identifiquei **${emRisco.length} contas em risco ou sem contato recente** (&ge; 3 dias sem resposta):\n\n` +
          emRisco.map((o, i) => `${i + 1}. **${o.lead.nome}** — ${o.diasSemContato} dias sem contato (${o.lead.status.toUpperCase()})`).join("\n") +
          `\n\n⚠️ *Ação necessária:* Disparar follow-up de cobrança de proposta ou reativação de conversa.`;
      } else {
        resposta = `Ótima notícia! Nenhuma oportunidade está classificada em risco no momento. Seu funil está em dia.`;
      }
    } else if (termo.includes("precisam de contato") || termo.includes("novo") || termo.includes("sem contato")) {
      const novos = leads.filter((l) => l.status === "novo").slice(0, 5);
      metadadosLeads = novos.map((l) => ({ id: l.id, nome: l.nome, categoria: l.categoria, score: l.score }));

      resposta = `Existem **${novos.length} novos leads** recém-minerados aguardando primeira abordagem comercial:\n\n` +
        novos.map((l, i) => `${i + 1}. **${l.nome}** (${l.categoria}) — Score ${l.score} · Tel: ${l.telefone || "Não informado"}`).join("\n") +
        `\n\n🚀 *Dica:* Utilize os scripts de Primeiro Contato no módulo de Templates para acelerar a qualificação.`;
    } else if (termo.includes("vendedor") || termo.includes("equipe") || termo.includes("produtividade")) {
      const { analyticsService } = await import("@/features/analytics");
      const equipe = await analyticsService.obterDesempenhoEquipe();
      if (equipe.length > 0) {
        resposta = `Análise de produtividade da equipe comercial:\n\n` +
          equipe
            .map(
              (v) =>
                `- **${v.nome}** (${v.papel}): ${v.leadsTrabalhados} leads trabalhados · ${v.fechamentos} fechamentos (${v.taxaConversao}% de conversão) · R$ ${v.receitaGerada.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
            )
            .join("\n") +
          `\n\nPara detalhes completos, consulte a página **Performance da Equipe** no menu Analytics.`;
      } else {
        resposta = `Nenhum dado de equipe encontrado. Cadastre novos membros na aba **Gestão de Usuários**.`;
      }
    } else {
      resposta = `Com base nos **${leads.length} estabelecimentos** cadastrados no Meridian Hub:\n\n` +
        `- **Total de Leads:** ${leads.length}\n` +
        `- **Sem Site Próprio:** ${leads.filter((l) => !l.tem_site).length} (${Math.round((leads.filter((l) => !l.tem_site).length / (leads.length || 1)) * 100)}%)\n` +
        `- **Score Médio:** ${Math.round(leads.reduce((a, b) => a + b.score, 0) / (leads.length || 1))} pts\n\n` +
        `Você pode me perguntar: *"Quais são meus melhores leads?"*, *"Quais oportunidades estão em risco?"* ou *"Quais leads precisam de contato?"*.`;
    }

    return {
      id: `ai-msg-${Date.now()}`,
      autor: "assistente",
      conteudo: resposta,
      data_hora: new Date().toISOString(),
      metadadosLeads,
    };
  },
};
