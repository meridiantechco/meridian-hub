import { leadsService } from "@/features/leads";
import { tasksService } from "@/features/tasks";
import type { NotificacaoItem } from "../types";

const STORAGE_KEY = "meridian_notificacoes_centro_v1";

export const notificationsService = {
  async listarNotificacoes(): Promise<NotificacaoItem[]> {
    if (typeof window === "undefined") return [];

    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) {
      try {
        return JSON.parse(salvo) as NotificacaoItem[];
      } catch {
        // fallback
      }
    }

    const leads = await leadsService.listarLeads();
    const l1 = leads[0];
    const l2 = leads[1];

    const iniciais: NotificacaoItem[] = [
      {
        id: "notif-1",
        tipo: "nova_oportunidade",
        titulo: `Nova oportunidade VIP minerada: ${l1?.nome || "Restaurante Porto"}`,
        mensagem: `Score ${l1?.score || 92} detectado no segmento de ${l1?.categoria || "Gastronomia"}. Sem website próprio.`,
        lida: false,
        link: l1 ? `/companies/${l1.id}` : "/opportunities",
        criado_em: new Date().toISOString(),
      },
      {
        id: "notif-2",
        tipo: "lead_em_risco",
        titulo: `Lead em risco: ${l2?.nome || "Barbearia Imperial"}`,
        mensagem: "Mais de 3 dias em estágio de proposta sem retorno. Follow-up recomendado.",
        lida: false,
        link: l2 ? `/companies/${l2.id}` : "/opportunities",
        criado_em: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "notif-3",
        tipo: "workflow_executado",
        titulo: "Automação disparada: Alerta de Score VIP",
        mensagem: "Oportunidade adicionada ao topo do Opportunity Center pelo motor autônomo.",
        lida: true,
        link: "/automations",
        criado_em: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: "notif-4",
        tipo: "reuniao_proxima",
        titulo: "Demonstração comercial agendada",
        mensagem: "Reunião de apresentação às 15:00 via Google Meet.",
        lida: true,
        link: "/calendar",
        criado_em: new Date(Date.now() - 14400000).toISOString(),
      },
    ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(iniciais));
    return iniciais;
  },

  async marcarComoLida(id: string): Promise<void> {
    const lista = await this.listarNotificacoes();
    const idx = lista.findIndex((n) => n.id === id);
    if (idx !== -1) {
      lista[idx].lida = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    }
  },

  async marcarTodasComoLidas(): Promise<void> {
    const lista = await this.listarNotificacoes();
    const atualizada = lista.map((n) => ({ ...n, lida: true }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(atualizada));
  },

  async excluirNotificacao(id: string): Promise<void> {
    const lista = await this.listarNotificacoes();
    const filtrada = lista.filter((n) => n.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtrada));
  },
};
