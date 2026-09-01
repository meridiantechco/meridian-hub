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

    return [];
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
    const idx = lista.findIndex((item) => item.id === id);
    const r = lista[idx];
    if (idx === -1 || !r) return null;

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
