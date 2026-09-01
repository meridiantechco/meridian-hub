export type TriggerTipo =
  | "lead_criado"
  | "status_alterado_proposta"
  | "sem_contato_3_dias"
  | "score_maior_80"
  | "reuniao_concluida";

export type ActionTipo =
  | "criar_tarefa_followup"
  | "marcar_alta_prioridade"
  | "notificar_equipe"
  | "enviar_whatsapp_padrao";

export interface WorkflowRegra {
  id: string;
  titulo: string;
  descricao: string;
  trigger: TriggerTipo;
  triggerTexto: string;
  condicaoTexto: string;
  action: ActionTipo;
  actionTexto: string;
  ativo: boolean;
  execucoesTotal: number;
  criado_em: string;
}
