import type { LeadItem } from "@/features/leads";

export type CategoriaOportunidade =
  | "todas"
  | "quentes"
  | "em_risco"
  | "novas"
  | "paradas"
  | "alto_potencial";

export interface FatorScore {
  rotulo: string;
  pontos: number;
  tipo: "positivo" | "neutro" | "atencao";
  descricao: string;
}

export interface ProximaAcao {
  titulo: string;
  motivo: string;
  tipo: "whatsapp" | "ligacao" | "proposta" | "follow_up" | "reuniao";
  urgencia: "alta" | "media" | "normal";
}

export interface OportunidadeEnriquecida {
  lead: LeadItem;
  score: number;
  categoriaOportunidade: CategoriaOportunidade[];
  fatoresScore: FatorScore[];
  proximaAcao: ProximaAcao;
  diasSemContato: number;
  valorEstimadoContrato: number;
  responsavelNome: string;
}
