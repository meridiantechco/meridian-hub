export interface ReuniaoItem {
  id: string;
  titulo: string;
  empresa_id?: string | null;
  empresa_nome: string;
  contato_nome?: string | null;
  data: string; // YYYY-MM-DD
  horario: string; // HH:mm
  duracao_minutos: number;
  local?: string | null;
  link_reuniao?: string | null;
  pauta?: string | null;
  notas?: string | null;
  status: "agendada" | "realizada" | "cancelada";
  criado_em: string;
}
