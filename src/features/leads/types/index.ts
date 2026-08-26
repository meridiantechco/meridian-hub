import type { Tables } from "@/integrations/supabase/types";

export type LeadItem = Tables<"leads">;
export type BuscaItem = Tables<"buscas">;
export type InteracaoItem = Tables<"interacoes">;

export type NivelPrioridade = "alta" | "media" | "baixa";

export interface DadosParaScore {
  tem_site?: boolean | null;
  instagram?: string | null;
  facebook?: string | null;
  avaliacao_google?: number | null;
  total_avaliacoes?: number | null;
  criado_em?: string | null;
}

export interface MensagemWhatsAppParams {
  telefone: string;
  nomeEmpresa: string;
  categoria?: string | null;
  cidadeOuBairro?: string | null;
  nomeVendedor?: string | null;
  instagram?: string | null;
}
