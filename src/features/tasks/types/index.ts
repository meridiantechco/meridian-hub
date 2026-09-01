export type PrioridadeTarefa = "baixa" | "media" | "alta" | "urgente";
export type StatusTarefa = "pendente" | "em_andamento" | "concluida";

export interface TarefaItem {
  id: string;
  titulo: string;
  descricao?: string | null;
  prioridade: PrioridadeTarefa;
  status: StatusTarefa;
  prazo: string; // ISO string ou YYYY-MM-DD
  empresa_id?: string | null;
  empresa_nome?: string | null;
  responsavel?: string | null;
  criado_em: string;
  concluida_em?: string | null;
}
