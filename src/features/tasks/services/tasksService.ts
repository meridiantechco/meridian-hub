import { leadsService } from "@/features/leads";
import type { TarefaItem, StatusTarefa } from "../types";
import { getScopedItem, setScopedItem } from "@/lib/userStorage";

const STORAGE_KEY = "meridian_tarefas_operacao_v1";

export const tasksService = {
  async listarTarefas(): Promise<TarefaItem[]> {
    if (typeof window === "undefined") return [];

    const salvo = await getScopedItem<TarefaItem[]>(STORAGE_KEY);
    if (salvo && Array.isArray(salvo) && salvo.length > 0) {
      return salvo;
    }

    // Inicialização com tarefas operacionais padrão a partir dos leads
    const hoje = new Date().toISOString().slice(0, 10);
    const amanha = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const ontem = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    const leads = await leadsService.listarLeads();
    const lead1 = leads[0];
    const lead2 = leads[1];
    const lead3 = leads[2];

    const tarefasIniciais: TarefaItem[] = [
      {
        id: "task-1",
        titulo: `Enviar proposta comercial de site para ${lead1?.nome || "Restaurante Porto"}`,
        descricao:
          "Apresentar escopo com desenvolvimento de cardápio digital e integração WhatsApp",
        prioridade: "urgente",
        status: "pendente",
        prazo: hoje,
        empresa_id: lead1?.id || null,
        empresa_nome: lead1?.nome || "Restaurante Porto",
        responsavel: "Equipe Comercial",
        criado_em: new Date().toISOString(),
      },
      {
        id: "task-2",
        titulo: `Follow-up de proposta enviada para ${lead2?.nome || "Barbearia Imperial"}`,
        descricao: "Checar se analisaram a condição de parcelamento sem juros",
        prioridade: "alta",
        status: "pendente",
        prazo: amanha,
        empresa_id: lead2?.id || null,
        empresa_nome: lead2?.nome || "Barbearia Imperial",
        responsavel: "Equipe Comercial",
        criado_em: new Date().toISOString(),
      },
      {
        id: "task-3",
        titulo: `Ligar para decisor de ${lead3?.nome || "Clínica Vida"}`,
        descricao: "Agendar demonstração do sistema de agendamento online",
        prioridade: "media",
        status: "pendente",
        prazo: hoje,
        empresa_id: lead3?.id || null,
        empresa_nome: lead3?.nome || "Clínica Vida",
        responsavel: "Equipe Comercial",
        criado_em: new Date().toISOString(),
      },
      {
        id: "task-4",
        titulo: "Revisar lista de nichos quentes no Opportunity Radar",
        descricao: "Identificar nova leva de prospecção para alimentação e serviços locais",
        prioridade: "baixa",
        status: "concluida",
        prazo: ontem,
        empresa_id: null,
        empresa_nome: null,
        responsavel: "Administrador",
        criado_em: new Date().toISOString(),
        concluida_em: new Date().toISOString(),
      },
    ];

    await setScopedItem(STORAGE_KEY, tarefasIniciais);
    return tarefasIniciais;
  },

  async salvarTarefa(tarefa: Omit<TarefaItem, "id" | "criado_em">): Promise<TarefaItem> {
    const lista = await this.listarTarefas();
    const nova: TarefaItem = {
      ...tarefa,
      id: `task-${Date.now()}`,
      criado_em: new Date().toISOString(),
    };
    const atualizada = [nova, ...lista];
    await setScopedItem(STORAGE_KEY, atualizada);
    return nova;
  },

  async atualizarTarefa(id: string, campos: Partial<TarefaItem>): Promise<TarefaItem | null> {
    const lista = await this.listarTarefas();
    const idx = lista.findIndex((t) => t.id === id);
    const item = lista[idx];
    if (idx === -1 || !item) return null;

    const atualizado: TarefaItem = { ...item, ...campos, id: item.id };
    lista[idx] = atualizado;
    await setScopedItem(STORAGE_KEY, lista);
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
    await setScopedItem(STORAGE_KEY, filtrada);
    return true;
  },
};
