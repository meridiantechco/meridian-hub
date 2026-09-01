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

    // Inicialização automática a partir dos leads existentes
    const leads = await leadsService.listarLeads();
    const contatosIniciais: ContatoItem[] = leads.map((l, idx) => {
      const primeiroNome = l.nome.split(" ")[0];
      return {
        id: `ct-${l.id}`,
        empresa_id: l.id,
        empresa_nome: l.nome,
        nome: `${primeiroNome} (Sócio / Decisor)`,
        cargo: "Proprietário / Diretor",
        telefone: l.telefone,
        whatsapp: l.telefone,
        email: `contato@${l.nome.toLowerCase().replace(/[^a-z0-9]/g, "")}.com.br`,
        linkedin: null,
        observacoes: "Tomador de decisão comercial mapeado pela prospecção",
        criado_em: l.criado_em,
      };
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(contatosIniciais));
    return contatosIniciais;
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
    if (idx === -1) return null;

    lista[idx] = { ...lista[idx], ...campos };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    return lista[idx];
  },

  async excluirContato(id: string): Promise<boolean> {
    const lista = await this.listarContatos();
    const filtrada = lista.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtrada));
    return true;
  },
};
