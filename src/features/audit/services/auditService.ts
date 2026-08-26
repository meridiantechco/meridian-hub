import { supabase } from "@/integrations/supabase/client";
import type { AtividadeUsuario, TipoAtividade } from "../types";

const STORAGE_KEY_AUDITORIA = "meridian_auditoria_atividades_v1";
const STORAGE_KEY_AUDITORIA_LEGADO = "prospecta_auditoria_atividades_v1";

function obterAtividadesStorage(): AtividadeUsuario[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDITORIA) || localStorage.getItem(STORAGE_KEY_AUDITORIA_LEGADO);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AtividadeUsuario[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function salvarAtividadesStorage(itens: AtividadeUsuario[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_AUDITORIA, JSON.stringify(itens.slice(0, 500)));
  } catch (err) {
    console.error("Erro ao salvar auditoria no storage", err);
  }
}

export const auditoriaService = {
  /**
   * Registra uma nova movimentação ou ação efetuada por um usuário
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

    const usuario_id = params.usuario_id || user?.id || "anonimo";
    const usuario_nome =
      params.usuario_nome ||
      (user?.user_metadata?.["nome"] as string) ||
      user?.email?.split("@")[0] ||
      "Administrador";
    const usuario_email = params.usuario_email || user?.email || "admin@meridiantech.com.br";

    const nova: AtividadeUsuario = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      usuario_id,
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

    // 1. Tentar gravar no Supabase interações se houver lead
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
        console.warn("Falha ao sincronizar interação com banco", e);
      }
    }

    // 2. Persistir localmente no histórico unificado de auditoria
    const atuais = obterAtividadesStorage();
    const atualizados = [nova, ...atuais];
    salvarAtividadesStorage(atualizados);

    return nova;
  },

  /**
   * Retorna resumo de atividades para um usuário específico
   */
  obterResumoPorUsuario(usuarioId: string): {
    totalAcoes: number;
    totalWhatsApp: number;
    totalFechados: number;
    totalStatus: number;
    totalMudancasStatus: number;
    ultimaAcao: AtividadeUsuario | null;
  } {
    const lista = obterAtividadesStorage().filter((a) => a.usuario_id === usuarioId);
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
   * Retorna lista de atividades registradas com filtros opcionais
   */
  async listarAtividades(filtro?: {
    usuario_id?: string;
    lead_id?: string;
    tipo?: TipoAtividade;
    limite?: number;
  }): Promise<AtividadeUsuario[]> {
    let lista = obterAtividadesStorage();

    if (filtro?.usuario_id) {
      lista = lista.filter((a) => a.usuario_id === filtro.usuario_id);
    }
    if (filtro?.lead_id) {
      lista = lista.filter((a) => a.lead_id === filtro.lead_id);
    }
    if (filtro?.tipo) {
      lista = lista.filter((a) => a.tipo === filtro.tipo);
    }

    const limite = filtro?.limite || 50;
    return lista.slice(0, limite);
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
    const lista = obterAtividadesStorage();
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
