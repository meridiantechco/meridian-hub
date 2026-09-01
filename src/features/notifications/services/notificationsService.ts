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

    return [];
  },

  async marcarComoLida(id: string): Promise<void> {
    const lista = await this.listarNotificacoes();
    const idx = lista.findIndex((n) => n.id === id);
    const item = lista[idx];
    if (idx !== -1 && item) {
      item.lida = true;
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
