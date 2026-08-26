import type { Tables } from "@/integrations/supabase/types";

export type LeadItem = Tables<"leads">;
export type BuscaItem = Tables<"buscas">;
export type InteracaoItem = Tables<"interacoes">;

export const LEADS_DEMO: LeadItem[] = [];
export const BUSCAS_DEMO: BuscaItem[] = [];
export const INTERACOES_DEMO: InteracaoItem[] = [];
