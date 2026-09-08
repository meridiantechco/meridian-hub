import { leadsService } from "@/features/leads";
import type { ContatoItem } from "../types";
import { getScopedItem, setScopedItem } from "@/lib/userStorage";

const STORAGE_KEY = "meridian_crm_contatos_v1";

export const contactsService = {
  async listarContatos(): Promise<ContatoItem[]> {
    if (typeof window === "undefined") return [];

    const salvo = await getScopedItem<ContatoItem[]>(STORAGE_KEY);
    if (salvo && Array.isArray(salvo) && salvo.length > 0) {
      return salvo;
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

    await setScopedItem(STORAGE_KEY, contatosIniciais);
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
    await setScopedItem(STORAGE_KEY, atualizada);
    return novo;
  },

  async atualizarContato(id: string, campos: Partial<ContatoItem>): Promise<ContatoItem | null> {
    const lista = await this.listarContatos();
    const idx = lista.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    const atual = lista[idx];
    if (!atual) return null;

    const atualizado: ContatoItem = { ...atual, ...campos, id: atual.id };
    lista[idx] = atualizado;
    await setScopedItem(STORAGE_KEY, lista);
    return atualizado;
  },

  async excluirContato(id: string): Promise<boolean> {
    const lista = await this.listarContatos();
    const filtrada = lista.filter((c) => c.id !== id);
    await setScopedItem(STORAGE_KEY, filtrada);
    return true;
  },
};
