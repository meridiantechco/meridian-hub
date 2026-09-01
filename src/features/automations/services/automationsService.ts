import type { WorkflowRegra } from "../types";

const STORAGE_KEY = "meridian_automacoes_workflows_v1";

export const automationsService = {
  async listarWorkflows(): Promise<WorkflowRegra[]> {
    if (typeof window === "undefined") return [];

    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) {
      try {
        return JSON.parse(salvo) as WorkflowRegra[];
      } catch {
        // fallback
      }
    }

    return [];
  },

  async alternarAtivo(id: string): Promise<WorkflowRegra | null> {
    const lista = await this.listarWorkflows();
    const idx = lista.findIndex((w) => w.id === id);
    const item = lista[idx];
    if (idx === -1 || !item) return null;

    item.ativo = !item.ativo;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    return item;
  },

  async salvarWorkflow(wf: Omit<WorkflowRegra, "id" | "criado_em" | "execucoesTotal">): Promise<WorkflowRegra> {
    const lista = await this.listarWorkflows();
    const novo: WorkflowRegra = {
      ...wf,
      id: `wf-${Date.now()}`,
      execucoesTotal: 0,
      criado_em: new Date().toISOString(),
    };
    const atualizada = [novo, ...lista];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(atualizada));
    return novo;
  },

  async excluirWorkflow(id: string): Promise<boolean> {
    const lista = await this.listarWorkflows();
    const filtrada = lista.filter((w) => w.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtrada));
    return true;
  },
};
