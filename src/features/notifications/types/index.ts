export type TipoNotificacao =
  | "nova_oportunidade"
  | "lead_em_risco"
  | "tarefa_atrasada"
  | "reuniao_proxima"
  | "follow_up"
  | "workflow_executado"
  | "sistema";

export interface NotificacaoItem {
  id: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  lida: boolean;
  link?: string | null;
  criado_em: string;
}
