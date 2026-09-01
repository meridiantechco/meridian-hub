import { leadsService } from "@/features/leads";
import type { ContatoItem } from "../types";

const STORAGE_KEY = "meridian_crm_contatos_v1";

export const contactsService = {
  async listarContatos(): Promise<ContatoItem[]> {
    if (typeof window === "undefined") return [];

    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) {
      try {
        return JSON.parse(salvo) as ContatoItem[];
      } catch {
        // fallback
      }
    }

    return [];
  },

  async salvarContato(contato: Omit<ContatoItem, "id" | "criado_em">): Promise<ContatoItem> {
    const lista = await this.listarContatos();
    const novo: ContatoItem = {
      ...contato,
      id: `ct-${Date.now()}`,
      criado_em: new Date().toISOString(),
    };
    const atualizada = [novo, ...lista];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(atualizada));
    return novo;
  },

  async atualizarContato(id: string, campos: Partial<ContatoItem>): Promise<ContatoItem | null> {
    const lista = await this.listarContatos();
    const idx = lista.findIndex((c) => c.id === id);
    const item = lista[idx];
    if (idx === -1 || !item) return null;

    const atualizado: ContatoItem = { ...item, ...campos, id: item.id, criado_em: item.criado_em };
    lista[idx] = atualizado;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    return atualizado;
  },

  async excluirContato(id: string): Promise<boolean> {
    const lista = await this.listarContatos();
    const filtrada = lista.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtrada));
    return true;
  },
};
