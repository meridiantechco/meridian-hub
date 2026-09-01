import type { LeadItem } from "@/features/leads";

export type NivelOportunidadeMapa = "alta" | "qualificado" | "atencao" | "risco";

export interface PontoMapa {
  lead: LeadItem;
  latitude: number;
  longitude: number;
  score: number;
  nivel: NivelOportunidadeMapa;
  potencialValor: number;
}

export interface ResumoRegiaoMapa {
  cidade: string;
  totalEmpresas: number;
  totalOportunidades: number;
  scoreMedio: number;
  potencialEstimadoTotal: number;
  semSitePercentual: number;
}
