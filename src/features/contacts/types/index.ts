export interface ContatoItem {
  id: string;
  empresa_id?: string | null;
  empresa_nome: string;
  nome: string;
  cargo: string;
  telefone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  linkedin?: string | null;
  observacoes?: string | null;
  criado_em: string;
}
