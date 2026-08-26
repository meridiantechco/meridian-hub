import { supabase } from "@/integrations/supabase/client";
import type { AtividadeUsuario, TipoAtividade } from "../types";

export const auditoriaService = {
  /**
   * Registra uma nova movimentação ou ação efetuada por um usuário diretamente no banco
   */
  async registrarAtividade(params: {
    tipo: TipoAtividade;
    titulo: string;
    descricao: string;
    lead_id?: string | null | undefined;
    lead_nome?: string | null | undefined;
    usuario_id?: string | null | undefined;
    usuario_nome?: string | null | undefined;
    usuario_email?: string | null | undefined;
    metadados?: Record<string, any> | null | undefined;
  }): Promise<AtividadeUsuario> {
    const session = (await supabase.auth.getSession()).data.session;
    const user = session?.user;

    const usuario_id = params.usuario_id || user?.id || null;
    const usuario_nome =
      params.usuario_nome ||
      (user?.user_metadata?.["nome"] as string) ||
      user?.email?.split("@")[0] ||
      "Administrador";
    const usuario_email = params.usuario_email || user?.email || "admin@meridiantech.com.br";

    // 1. Gravar interação caso esteja associada a um lead
    if (
      params.lead_id &&
      (params.tipo === "whatsapp" ||
        params.tipo === "interacao" ||
        params.tipo === "mudanca_status")
    ) {
      try {
        await supabase.from("interacoes").insert({
          lead_id: params.lead_id,
          tipo: params.tipo === "whatsapp" ? "whatsapp" : "outro",
          descricao: params.descricao,
          usuario_id: user?.id ?? null,
        });
      } catch (e) {
        console.warn("Falha ao registrar interação de lead:", e);
      }
    }

    // 2. Gravar no log unificado de auditoria no Supabase
    const payload = {
      usuario_id,
      usuario_nome,
      usuario_email,
      tipo: params.tipo,
      titulo: params.titulo,
      descricao: params.descricao,
      lead_id: params.lead_id ?? null,
      lead_nome: params.lead_nome ?? null,
      metadados: params.metadados ?? {},
    };

    try {
      const { data, error } = await supabase
        .from("auditoria_atividades")
        .insert(payload)
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          usuario_id: data.usuario_id ?? "anonimo",
          usuario_nome: data.usuario_nome ?? usuario_nome,
          usuario_email: data.usuario_email ?? usuario_email,
          tipo: data.tipo as TipoAtividade,
          titulo: data.titulo,
          descricao: data.descricao ?? "",
          lead_id: data.lead_id,
          lead_nome: data.lead_nome,
          metadados: (data.metadados as Record<string, any>) ?? null,
          criado_em: data.criado_em,
        };
      }
    } catch (err) {
      console.error("Erro ao salvar auditoria:", err);
    }

    return {
      id: `act-${Date.now()}`,
      usuario_id: usuario_id || "anonimo",
      usuario_nome,
      usuario_email,
      tipo: params.tipo,
      titulo: params.titulo,
      descricao: params.descricao,
      lead_id: params.lead_id ?? null,
      lead_nome: params.lead_nome ?? null,
      metadados: params.metadados ?? null,
      criado_em: new Date().toISOString(),
    };
  },

  /**
   * Retorna resumo de atividades para um usuário específico
   */
  async obterResumoPorUsuario(usuarioId: string): Promise<{
    totalAcoes: number;
    totalWhatsApp: number;
    totalFechados: number;
    totalStatus: number;
    totalMudancasStatus: number;
    ultimaAcao: AtividadeUsuario | null;
  }> {
    const lista = await this.listarAtividades({ usuario_id: usuarioId, limite: 200 });
    const totalWhatsApp = lista.filter((a) => a.tipo === "whatsapp").length;
    const totalStatus = lista.filter((a) => a.tipo === "mudanca_status").length;
    const totalFechados = lista.filter(
      (a) => a.tipo === "mudanca_status" && a.descricao?.toLowerCase().includes("fechado"),
    ).length;
    const ultimaAcao = lista.length > 0 ? lista[0] || null : null;

    return {
      totalAcoes: lista.length,
      totalWhatsApp,
      totalFechados,
      totalStatus,
      totalMudancasStatus: totalStatus,
      ultimaAcao,
    };
  },

  /**
   * Retorna lista de atividades registradas com filtros opcionais direto do Supabase
   */
  async listarAtividades(filtro?: {
    usuario_id?: string;
    lead_id?: string;
    tipo?: TipoAtividade;
    limite?: number;
  }): Promise<AtividadeUsuario[]> {
    let query = supabase
      .from("auditoria_atividades")
      .select("*")
      .order("criado_em", { ascending: false });

    if (filtro?.usuario_id) {
      query = query.eq("usuario_id", filtro.usuario_id);
    }
    if (filtro?.lead_id) {
      query = query.eq("lead_id", filtro.lead_id);
    }
    if (filtro?.tipo) {
      query = query.eq("tipo", filtro.tipo);
    }

    const limite = filtro?.limite || 50;
    query = query.limit(limite);

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return data.map((d) => ({
      id: d.id,
      usuario_id: d.usuario_id ?? "anonimo",
      usuario_nome: d.usuario_nome ?? "Usuário",
      usuario_email: d.usuario_email ?? "",
      tipo: d.tipo as TipoAtividade,
      titulo: d.titulo,
      descricao: d.descricao ?? "",
      lead_id: d.lead_id,
      lead_nome: d.lead_nome,
      metadados: (d.metadados as Record<string, any>) ?? null,
      criado_em: d.criado_em,
    }));
  },

  /**
   * Retorna métricas agregadas de produtividade por usuário
   */
  async obterMetricasUsuarios(): Promise<
    Record<
      string,
      {
        total: number;
        whatsapp: number;
        mudancas_status: number;
        mineracoes: number;
        ultimo_acesso: string;
      }
    >
  > {
    const lista = await this.listarAtividades({ limite: 500 });
    const mapa: Record<string, any> = {};

    for (const item of lista) {
      const chave = item.usuario_id || item.usuario_email;
      if (!mapa[chave]) {
        mapa[chave] = {
          total: 0,
          whatsapp: 0,
          mudancas_status: 0,
          mineracoes: 0,
          ultimo_acesso: item.criado_em,
        };
      }

      mapa[chave].total += 1;
      if (item.tipo === "whatsapp") mapa[chave].whatsapp += 1;
      if (item.tipo === "mudanca_status") mapa[chave].mudancas_status += 1;
      if (item.tipo === "mineracao") mapa[chave].mineracoes += 1;
    }

    return mapa;
  },
};
