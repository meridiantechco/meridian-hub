import { leadsService } from "@/features/leads";
import { tasksService } from "@/features/tasks";
import type { ReuniaoItem } from "../types";

const STORAGE_KEY = "meridian_agenda_reunioes_v1";

export const calendarService = {
  async listarReunioes(): Promise<ReuniaoItem[]> {
    if (typeof window === "undefined") return [];

    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) {
      try {
        return JSON.parse(salvo) as ReuniaoItem[];
      } catch {
        // fallback
      }
    }

    const hoje = new Date().toISOString().slice(0, 10);
    const amanha = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const leads = await leadsService.listarLeads();
    const l1 = leads[0];
    const l2 = leads[1];

    const iniciais: ReuniaoItem[] = [
      {
        id: "meet-1",
        titulo: `Demonstração de Proposta de Site — ${l1?.nome || "Restaurante Porto"}`,
        empresa_id: l1?.id || null,
        empresa_nome: l1?.nome || "Restaurante Porto",
        contato_nome: "Sócio / Decisor",
        data: hoje,
        horario: "15:00",
        duracao_minutos: 45,
        local: "Google Meet",
        link_reuniao: "https://meet.google.com/abc-defg-hij",
        pauta: "Apresentar layout moderno, SEO local e proposta de valor para captação",
        notas: null,
        status: "agendada",
        criado_em: new Date().toISOString(),
      },
      {
        id: "meet-2",
        titulo: `Alinhamento de Escopo & Contrato — ${l2?.nome || "Barbearia Imperial"}`,
        empresa_id: l2?.id || null,
        empresa_nome: l2?.nome || "Barbearia Imperial",
        contato_nome: "Proprietário",
        data: amanha,
        horario: "10:30",
        duracao_minutos: 30,
        local: "Presencial / Visita Comercial",
        link_reuniao: null,
        pauta: "Assinatura do contrato e coleta de fotos para o novo portal",
        notas: null,
        status: "agendada",
        criado_em: new Date().toISOString(),
      },
    ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(iniciais));
    return iniciais;
  },

  async salvarReuniao(reuniao: Omit<ReuniaoItem, "id" | "criado_em">): Promise<ReuniaoItem> {
    const lista = await this.listarReunioes();
    const nova: ReuniaoItem = {
      ...reuniao,
      id: `meet-${Date.now()}`,
      criado_em: new Date().toISOString(),
    };
    const atualizada = [nova, ...lista];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(atualizada));
    return nova;
  },

  async atualizarStatus(
    id: string,
    status: ReuniaoItem["status"],
    criarFollowUpAuto = false,
  ): Promise<ReuniaoItem | null> {
    const lista = await this.listarReunioes();
    const idx = lista.findIndex((r) => r.id === id);
    if (idx === -1) return null;

    const r = lista[idx];
    r.status = status;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));

    // Se realizou e pediu follow-up automático:
    if (status === "realizada" && criarFollowUpAuto) {
      const amanha = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
      await tasksService.salvarTarefa({
        titulo: `Follow-up pós-reunião com ${r.empresa_nome}`,
        descricao: `Enviar minuta da proposta ou resumo dos tópicos abordados na reunião de ${r.titulo}`,
        prioridade: "alta",
        status: "pendente",
        prazo: amanha,
        empresa_id: r.empresa_id || null,
        empresa_nome: r.empresa_nome,
        responsavel: "Equipe Comercial",
      });
    }

    return r;
  },

  async excluirReuniao(id: string): Promise<boolean> {
    const lista = await this.listarReunioes();
    const filtrada = lista.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtrada));
    return true;
  },
};
