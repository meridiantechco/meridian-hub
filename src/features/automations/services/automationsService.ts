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

    const iniciais: WorkflowRegra[] = [
      {
        id: "wf-1",
        titulo: "Follow-up Automático pós-Proposta",
        descricao: "Quando um lead entra em estágio de Proposta e fica 3 dias sem resposta, cria tarefa de cobrança.",
        trigger: "status_alterado_proposta",
        triggerTexto: "Lead avança para 'Proposta Comercial'",
        condicaoTexto: "Esperar 3 dias sem nova interação registrada",
        action: "criar_tarefa_followup",
        actionTexto: "Criar Tarefa: 'Fazer follow-up de retorno de proposta'",
        ativo: true,
        execucoesTotal: 18,
        criado_em: new Date().toISOString(),
      },
      {
        id: "wf-2",
        titulo: "Alerta Imediato para Leads VIP (Score > 80)",
        descricao: "Assim que um lead com score 80+ for minerado, marca como prioridade urgente e alerta a equipe.",
        trigger: "score_maior_80",
        triggerTexto: "Lead minerado com Score > 80",
        condicaoTexto: "Estabelecimento sem website próprio",
        action: "marcar_alta_prioridade",
        actionTexto: "Inserir no topo do Opportunity Center e notificar",
        ativo: true,
        execucoesTotal: 42,
        criado_em: new Date().toISOString(),
      },
      {
        id: "wf-3",
        titulo: "Follow-up Automático pós-Reunião",
        descricao: "Ao concluir uma reunião na agenda, gera automaticamente a tarefa de envio da ata e proposta.",
        trigger: "reuniao_concluida",
        triggerTexto: "Reunião marcada como 'Realizada'",
        condicaoTexto: "Sem tarefas pendentes criadas",
        action: "criar_tarefa_followup",
        actionTexto: "Criar Tarefa: 'Enviar proposta comercial e minuta'",
        ativo: true,
        execucoesTotal: 11,
        criado_em: new Date().toISOString(),
      },
    ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(iniciais));
    return iniciais;
  },

  async alternarAtivo(id: string): Promise<WorkflowRegra | null> {
    const lista = await this.listarWorkflows();
    const idx = lista.findIndex((w) => w.id === id);
    if (idx === -1) return null;

    lista[idx].ativo = !lista[idx].ativo;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    return lista[idx];
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
