import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import type { BuscaItem, InteracaoItem, LeadItem } from "../types";
import { calcularScoreLead } from "../utils/score";

async function obterUidAtivo(): Promise<string | null> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user?.id) {
      return sessionData.session.user.id;
    }
    const { data: userData } = await supabase.auth.getUser();
    return userData?.user?.id ?? null;
  } catch {
    return null;
  }
}

export const leadsService = {
  // LEADS
  async listarLeads(): Promise<LeadItem[]> {
    const uid = await obterUidAtivo();
    if (!uid) return [];

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("responsavel_id", uid)
      .order("score", { ascending: false })
      .order("criado_em", { ascending: false });

    if (error) {
      console.error("Erro ao listar leads:", error);
      return [];
    }

    return (data as LeadItem[]) || [];
  },

  async obterLeadPorId(id: string): Promise<LeadItem | null> {
    const uid = await obterUidAtivo();

    let query = supabase.from("leads").select("*").eq("id", id);
    if (uid) {
      query = query.eq("responsavel_id", uid);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error("Erro ao obter lead por ID:", error);
      return null;
    }

    return (data as LeadItem) || null;
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
  },

  async atualizarLead(id: string, dados: Partial<TablesUpdate<"leads">>): Promise<LeadItem | null> {
    const { data, error } = await supabase
      .from("leads")
      .update({ ...dados, atualizado_em: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar lead:", error);
      throw error;
    }

    return (data as LeadItem) || null;
  },

  async removerLead(id: string): Promise<boolean> {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) {
      console.error("Erro ao remover lead:", error);
      return false;
    }
    return true;
  },

  async salvarNovosLeads(
    novosLeads: TablesInsert<"leads">[],
    dadosBusca?: TablesInsert<"buscas">,
  ): Promise<{ importados: number }> {
    let importados = 0;
    const uid = await obterUidAtivo();

    if (dadosBusca && uid) {
      try {
        const buscaComUsuario = {
          ...dadosBusca,
          executada_por: uid,
        };
        await supabase.from("buscas").insert(buscaComUsuario);
      } catch (buscaErr) {
        console.warn("Aviso ao registrar histórico de busca:", buscaErr);
      }
    }

    if (novosLeads.length > 0) {
      // Salva cada lead de forma resiliente contra falhas de lote ou duplicidades
      const resultados = await Promise.allSettled(novosLeads.map((nl) => this.salvarLeadUnico(nl)));

      for (const res of resultados) {
        if (res.status === "fulfilled") {
          importados++;
        } else {
          console.warn("Aviso ao salvar item do lote de leads:", res.reason);
        }
      }

      if (importados === 0 && novosLeads.length > 0) {
        const primeiroErro = resultados.find((r) => r.status === "rejected") as
          PromiseRejectedResult | undefined;
        throw new Error(
          primeiroErro?.reason?.message ||
            "Não foi possível salvar os estabelecimentos selecionados.",
        );
      }
    }

    return { importados };
  },

  async salvarLeadUnico(lead: TablesInsert<"leads">): Promise<LeadItem> {
    const uid = await obterUidAtivo();

    const formatado: TablesInsert<"leads"> = {
      ...lead,
      responsavel_id: lead.responsavel_id || uid || null,
      score: lead.score ?? calcularScoreLead(lead as any),
      status: lead.status ?? "novo",
      origem: lead.origem ?? "google_places",
    };

    // 1. Se tiver place_id e uid, busca se já existe um lead com esse place_id para este operador
    if (formatado.place_id && uid) {
      const { data: existente } = await supabase
        .from("leads")
        .select("*")
        .eq("place_id", formatado.place_id)
        .eq("responsavel_id", uid)
        .maybeSingle();

      if (existente) {
        const { data: atualizado, error: errUpdate } = await supabase
          .from("leads")
          .update({
            ...formatado,
            atualizado_em: new Date().toISOString(),
          })
          .eq("id", existente.id)
          .select()
          .maybeSingle();

        if (!errUpdate && atualizado) {
          return atualizado as LeadItem;
        }
        return existente as LeadItem;
      }
    }

    // 2. Se o lead já existir globalmente no banco por place_id
    if (formatado.place_id) {
      const { data: globalExistente } = await supabase
        .from("leads")
        .select("*")
        .eq("place_id", formatado.place_id)
        .maybeSingle();

      if (globalExistente) {
        const { data: atualizado, error: errUpdate } = await supabase
          .from("leads")
          .update({
            ...formatado,
            responsavel_id: uid,
            atualizado_em: new Date().toISOString(),
          })
          .eq("id", globalExistente.id)
          .select()
          .maybeSingle();

        if (!errUpdate && atualizado) {
          return atualizado as LeadItem;
        }
        return globalExistente as LeadItem;
      }
    }

    // 3. Tenta inserção direta
    const { data: novo, error: errInsert } = await supabase
      .from("leads")
      .insert(formatado)
      .select()
      .maybeSingle();

    if (!errInsert && novo) {
      return novo as LeadItem;
    }

    // 4. Se falhar por duplicidade ou constraint, tenta buscar por nome e vincular
    if (formatado.nome && uid) {
      const { data: porNome } = await supabase
        .from("leads")
        .select("*")
        .ilike("nome", formatado.nome)
        .maybeSingle();

      if (porNome) {
        const { data: atualizado } = await supabase
          .from("leads")
          .update({
            ...formatado,
            responsavel_id: uid,
            atualizado_em: new Date().toISOString(),
          })
          .eq("id", porNome.id)
          .select()
          .maybeSingle();

        if (atualizado) return atualizado as LeadItem;
        return porNome as LeadItem;
      }
    }

    if (errInsert) {
      console.error("Erro ao salvar lead no Supabase:", errInsert);
      throw new Error(errInsert.message || "Falha ao salvar estabelecimento no banco de dados.");
    }

    throw new Error("Não foi possível salvar o estabelecimento.");
  },

  // BUSCAS
  async listarBuscas(): Promise<BuscaItem[]> {
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData?.session?.user?.id;
    if (!uid) return [];

    const { data, error } = await supabase
      .from("buscas")
      .select("*")
      .eq("executada_por", uid)
      .order("criada_em", { ascending: false });

    if (error) {
      console.error("Erro ao listar buscas:", error);
      return [];
    }

    return (data as BuscaItem[]) || [];
  },

  // INTERAÇÕES
  async listarInteracoes(leadId: string): Promise<InteracaoItem[]> {
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData?.session?.user?.id;

    let query = supabase.from("interacoes").select("*").eq("lead_id", leadId);
    if (uid) {
      query = query.eq("usuario_id", uid);
    }

    const { data, error } = await query.order("criado_em", { ascending: false });

    if (error) {
      console.error("Erro ao listar interações do lead:", error);
      return [];
    }

    return (data as InteracaoItem[]) || [];
  },

  async registrarInteracao(interacao: TablesInsert<"interacoes">): Promise<InteracaoItem> {
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData?.session?.user?.id;

    const payload = {
      ...interacao,
      usuario_id: interacao.usuario_id || uid || null,
    };

    const { data, error } = await supabase.from("interacoes").insert(payload).select().single();

    if (error || !data) {
      console.error("Erro ao registrar interação:", error);
      throw new Error(error?.message || "Falha ao registrar interação");
    }

    return data as InteracaoItem;
  },

  async zerarBaseLeads(): Promise<number> {
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData?.session?.user?.id;
    if (!uid) return 0;

    const { count, error } = await supabase
      .from("leads")
      .delete({ count: "exact" })
      .eq("responsavel_id", uid);

    if (error) {
      console.error("Erro ao zerar leads do operador no Supabase:", error);
    }
    return count ?? 0;
  },

  async reiniciarFunilLeads(): Promise<number> {
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData?.session?.user?.id;
    if (!uid) return 0;

    const agora = new Date().toISOString();
    const { count, error } = await supabase
      .from("leads")
      .update({ status: "novo", atualizado_em: agora }, { count: "exact" })
      .eq("responsavel_id", uid);

    if (error) {
      console.error("Erro ao reiniciar funil de leads do operador:", error);
    }
    return count ?? 0;
  },

  limparDadosLocais(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("meridian_leads_v1");
    localStorage.removeItem("prospecta_leads_v4");
    localStorage.removeItem("meridian_buscas_v1");
    localStorage.removeItem("prospecta_buscas_v4");
    localStorage.removeItem("meridian_interacoes_v1");
    localStorage.removeItem("prospecta_interacoes_v4");
  },
};

export const prospectaService = leadsService;
