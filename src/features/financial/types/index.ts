export type TipoTransacao = "receita" | "despesa";

export type CategoriaDespesa =
  | "tecnologia" // Google Places API, Supabase, Servidores, Domínios
  | "marketing" // WhatsApp API, Tráfego Pago, Anúncios, Comissões
  | "equipe" // Salários, Freelancers, Pró-labore
  | "operacional" // Internet, Luz, Aluguel, Softwares de Gestão
  | "impostos" // DAS MEI, Simples Nacional, Taxas Gateway
  | "outros"; // Custos variáveis gerais

export type CategoriaReceita =
  | "venda_site" // Criação de Site / Landing Page
  | "mensalidade" // Mensalidade de Gestão / Hospedagem (MRR)
  | "consultoria" // Otimização Google Meu Negócio / SEO Local
  | "gestao_trafego" // Gestão de Tráfego / Anúncios
  | "outra_receita"; // Outros serviços

export type RecorrenciaTransacao = "pontual" | "mensal" | "anual";

export type StatusTransacao = "pago" | "pendente" | "cancelado";

export interface TransacaoFinanceira {
  id: string;
  tipo: TipoTransacao;
  titulo: string;
  descricao?: string | null;
  categoria: CategoriaDespesa | CategoriaReceita | string;
  valor: number; // Em Reais (BRL)
  data_competencia: string; // YYYY-MM-DD
  data_pagamento?: string | null; // YYYY-MM-DD
  recorrencia: RecorrenciaTransacao;
  status: StatusTransacao;
  lead_id?: string | null;
  lead_nome?: string | null;
  anexo_comprovante?: string | null;
  criado_em: string;
  atualizado_em?: string;
}

export interface MetricasFinanceiras {
  receitaTotal: number;
  receitaRecebida: number;
  receitaPendente: number;
  despesaTotal: number;
  despesaPaga: number;
  despesaPendente: number;
  lucroLiquido: number;
  margemLucroPercentual: number;
  roiMultiplicador: number;
  gastosPorCategoria: Record<string, number>;
  receitasPorCategoria: Record<string, number>;
  evolucaoMensal: {
    mes: string;
    mesRotulo: string;
    receita: number;
    despesa: number;
    lucro: number;
  }[];
}
