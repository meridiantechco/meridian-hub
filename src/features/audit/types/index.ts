export type TipoAtividade =
  | "whatsapp"
  | "mudanca_status"
  | "mineracao"
  | "novo_lead"
  | "edicao_lead"
  | "interacao"
  | "usuario_criado"
  | "usuario_papel"
  | "primeiro_acesso"
  | "financeiro"
  | "login";

export interface AtividadeUsuario {
  id: string;
  usuario_id: string;
  usuario_nome: string;
  usuario_email: string;
  tipo: TipoAtividade;
  titulo: string;
  descricao: string;
  lead_id?: string | null;
  lead_nome?: string | null;
  metadados?: Record<string, any> | null;
  criado_em: string;
}
