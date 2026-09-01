export interface SinalMercado {
  id: string;
  nicho: string;
  regiao: string;
  scoreMedio: number;
  volumeContas: number;
  taxaSemSite: number; // %
  variacaoDemanda: string; // Ex: "+24%"
  statusOportunidade: "quente" | "em_alta" | "emergente";
  recomendacao: string;
}

export interface MudancaDetectada {
  id: string;
  empresa_nome: string;
  empresa_id?: string | null;
  tipoMudanca: "novo_telefone" | "instagram_ativo" | "sem_site_ativo" | "aumento_avaliacoes";
  descricao: string;
  data_deteccao: string;
}
