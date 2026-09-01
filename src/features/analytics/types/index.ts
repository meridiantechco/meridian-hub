export interface MetricasGeraisAnalytics {
  leadsGerados: number;
  leadsQualificados: number;
  taxaConversaoGeral: number; // %
  pipelineEstimado: number;
  receitaFechada: number;
  ticketMedio: number;
  tempoMedioFechamentoDias: number;
}

export interface DesempenhoVendedor {
  id: string;
  nome: string;
  papel: string;
  leadsTrabalhados: number;
  contatosFeitos: number;
  reunioesRealizadas: number;
  propostasEnviadas: number;
  fechamentos: number;
  receitaGerada: number;
  taxaConversao: number;
}

export interface DesempenhoGeografico {
  cidade: string;
  bairro?: string;
  totalLeads: number;
  semSite: number;
  scoreMedio: number;
  taxaConversao: number;
  potencialTotal: number;
}

export interface RelatorioFiltros {
  categoria: string;
  status: string;
  scoreMinimo: number;
  apenasSemSite: boolean;
  cidade: string;
}
