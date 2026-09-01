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
  descricao?: string | null;
  empresa_nome?: string | null;
  empresa_id?: string | null;
  usuario_nome: string;
  data_hora: string;
}
