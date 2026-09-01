import { leadsService } from "@/features/leads";
import type { TarefaItem, StatusTarefa } from "../types";

const STORAGE_KEY = "meridian_tarefas_operacao_v1";

export const tasksService = {
  async listarTarefas(): Promise<TarefaItem[]> {
    if (typeof window === "undefined") return [];

    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) {
      try {
        return JSON.parse(salvo) as TarefaItem[];
      } catch {
        // fallback
      }
    }

    return [];
  },

  async salvarTarefa(tarefa: Omit<TarefaItem, "id" | "criado_em">): Promise<TarefaItem> {
    const lista = await this.listarTarefas();
    const nova: TarefaItem = {
      ...tarefa,
      id: `task-${Date.now()}`,
      criado_em: new Date().toISOString(),
    };
    const atualizada = [nova, ...lista];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(atualizada));
    return nova;
  },

  async atualizarTarefa(id: string, campos: Partial<TarefaItem>): Promise<TarefaItem | null> {
    const lista = await this.listarTarefas();
    const idx = lista.findIndex((t) => t.id === id);
    const item = lista[idx];
    if (idx === -1 || !item) return null;

    const atualizado: TarefaItem = { ...item, ...campos, id: item.id, criado_em: item.criado_em };
    lista[idx] = atualizado;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    return atualizado;
  },

  async alternarStatus(id: string, novoStatus: StatusTarefa): Promise<TarefaItem | null> {
    const agora = new Date().toISOString();
    return this.atualizarTarefa(id, {
      status: novoStatus,
      concluida_em: novoStatus === "concluida" ? agora : null,
    });
  },

  async excluirTarefa(id: string): Promise<boolean> {
    const lista = await this.listarTarefas();
    const filtrada = lista.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtrada));
    return true;
  },
};
