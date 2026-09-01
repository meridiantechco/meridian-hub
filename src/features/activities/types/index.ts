export type TipoAtividade =
  | "lead_criado"
  | "contato_realizado"
  | "reuniao_agendada"
  | "reuniao_concluida"
  | "proposta_enviada"
  | "status_alterado"
  | "tarefa_concluida"
  | "whatsapp_enviado";

export interface AtividadeGlobal {
  id: string;
  tipo: TipoAtividade;
  titulo: string;
  descricao?: string | null | undefined;
  empresa_nome?: string | null | undefined;
  empresa_id?: string | null | undefined;
  usuario_nome: string;
  data_hora: string;
}
