import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import type { BuscaItem, InteracaoItem, LeadItem } from "../types";
import { calcularScoreLead } from "../utils/score";
import { memoryCache } from "@/lib/memoryCache";

export const leadsService = {
  // LEADS
  async listarLeads(): Promise<LeadItem[]> {
    return memoryCache.fetchWithCache(
      "leads:lista",
      async () => {
        const { data, error } = await supabase
          .from("leads")
          .select("*")
          .order("score", { ascending: false })
          .order("criado_em", { ascending: false });

        if (error) {
          console.error("Erro ao listar leads:", error);
          return [];
        }

        return (data as LeadItem[]) || [];
      },
      15,
      ["leads"],
    );
  },

  async obterLeadPorId(id: string): Promise<LeadItem | null> {
    return memoryCache.fetchWithCache(
      `lead:${id}`,
      async () => {
        const { data, error } = await supabase
          .from("leads")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) {
          console.error("Erro ao obter lead por ID:", error);
          return null;
        }

        return (data as LeadItem) || null;
      },
      20,
      ["leads", `lead:${id}`],
    );
  },

  async atualizarStatusLead(id: string, status: LeadItem["status"]): Promise<void> {
    const agora = new Date().toISOString();
    const { error } = await supabase
      .from("leads")
      .update({ status, atualizado_em: agora })
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar status do lead:", error);
      throw error;
    }
    memoryCache.invalidateTag("leads");
  },

  async atualizarLead(
    id: string,
    campos: Partial<TablesUpdate<"leads">>,
  ): Promise<LeadItem | null> {
    const agora = new Date().toISOString();
    const { data, error } = await supabase
      .from("leads")
      .update({ ...campos, atualizado_em: agora })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Erro ao atualizar lead:", error);
      return null;
    }

    memoryCache.invalidateTag("leads");
    return (data as LeadItem) || null;
  },

  async removerLead(id: string): Promise<boolean> {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) {
      console.error("Erro ao remover lead:", error);
      return false;
    }
    memoryCache.invalidateTag("leads");
    return true;
  },

  async salvarNovosLeads(
    novosLeads: TablesInsert<"leads">[],
    dadosBusca?: TablesInsert<"buscas">,
  ): Promise<{ importados: number }> {
    let importados = 0;

    if (dadosBusca) {
      const { error: buscaErr } = await supabase.from("buscas").insert(dadosBusca);
      if (buscaErr) {
        console.warn("Aviso ao registrar histórico de busca:", buscaErr);
      }
      memoryCache.invalidateTag("buscas");
    }

    if (novosLeads.length > 0) {
      const formatados = novosLeads.map((nl) => ({
        ...nl,
        score: nl.score ?? calcularScoreLead(nl as any),
        status: nl.status ?? "novo",
        origem: nl.origem ?? "google_places",
      }));

      const { data, error } = await supabase
        .from("leads")
        .upsert(formatados, { onConflict: "place_id" })
        .select();

      if (error) {
        console.error("Erro ao inserir leads no Supabase:", error);
        throw error;
      }

      if (data) {
        importados = data.length;
      }
      memoryCache.invalidateTag("leads");
    }

    return { importados };
  },

  // BUSCAS
  async listarBuscas(): Promise<BuscaItem[]> {
    return memoryCache.fetchWithCache(
      "buscas:lista",
      async () => {
        const { data, error } = await supabase
          .from("buscas")
          .select("*")
          .order("criada_em", { ascending: false });

        if (error) {
          console.error("Erro ao listar buscas:", error);
          return [];
        }

        return (data as BuscaItem[]) || [];
      },
      15,
      ["buscas"],
    );
  },

  // INTERAÇÕES
  async listarInteracoes(leadId: string): Promise<InteracaoItem[]> {
    const { data, error } = await supabase
      .from("interacoes")
      .select("*")
      .eq("lead_id", leadId)
      .order("criado_em", { ascending: false });

    if (error) {
      console.error("Erro ao listar interações do lead:", error);
      return [];
    }

    return (data as InteracaoItem[]) || [];
  },

  async registrarInteracao(interacao: TablesInsert<"interacoes">): Promise<InteracaoItem> {
    const { data, error } = await supabase
      .from("interacoes")
      .insert(interacao)
      .select()
      .single();

    if (error || !data) {
      console.error("Erro ao registrar interação:", error);
      throw new Error(error?.message || "Falha ao registrar interação");
    }

    return data as InteracaoItem;
  },

  async zerarBaseLeads(): Promise<number> {
    const { count, error } = await supabase
      .from("leads")
      .delete({ count: "exact" })
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      console.error("Erro ao zerar leads no Supabase:", error);
    }
    memoryCache.invalidateTag("leads");
    return count ?? 0;
  },

  async reiniciarFunilLeads(): Promise<number> {
    const agora = new Date().toISOString();
    const { count, error } = await supabase
      .from("leads")
      .update({ status: "novo", atualizado_em: agora }, { count: "exact" })
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      console.error("Erro ao reiniciar funil de leads:", error);
    }
    memoryCache.invalidateTag("leads");
    return count ?? 0;
  },

  limparDadosLocais(): void {
    if (typeof window === "undefined") return;
    memoryCache.clear();
    localStorage.removeItem("meridian_leads_v1");
    localStorage.removeItem("prospecta_leads_v4");
    localStorage.removeItem("meridian_buscas_v1");
    localStorage.removeItem("prospecta_buscas_v4");
    localStorage.removeItem("meridian_interacoes_v1");
    localStorage.removeItem("prospecta_interacoes_v4");
  },
};

export const prospectaService = leadsService;
