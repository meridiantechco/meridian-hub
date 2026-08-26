import { supabase } from "@/integrations/supabase/client";

export type TipoAtividade =
  | "whatsapp"
  | "mudanca_status"
  | "mineracao"
  | "novo_lead"
  | "edicao_lead"
  | "interacao"
  | "usuario_criado"
  | "usuario_papel"
  | "primeiro_acesso"
  | "financeiro"
  | "login";

export interface AtividadeUsuario {
  id: string;
  usuario_id: string;
  usuario_nome: string;
  usuario_email: string;
  tipo: TipoAtividade;
  titulo: string;
  descricao: string;
  lead_id?: string | null;
  lead_nome?: string | null;
  metadados?: Record<string, any> | null;
  criado_em: string;
}

const STORAGE_KEY_AUDITORIA = "prospecta_auditoria_atividades_v1";

function obterAtividadesStorage(): AtividadeUsuario[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDITORIA);
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
    const usuario_email = params.usuario_email || user?.email || "admin@prospecta.com.br";

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

    // 1. Tentar gravar no Supabase interações/audit logs se houver lead
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
          resultado: params.titulo,
          usuario_id: user?.id ?? null,
        });
      } catch {
        // continua para salvar no feed de auditoria
      }
    }

    // 2. Gravar no log de auditoria local e compartilhado
    const lista = obterAtividadesStorage();
    const novaLista = [nova, ...lista];
    salvarAtividadesStorage(novaLista);

    return nova;
  },

  /**
   * Lista todas as atividades registradas com filtros opcionais
   */
  async listarAtividades(filtro?: {
    usuario_id?: string | undefined;
    tipo?: TipoAtividade | undefined;
    lead_id?: string | undefined;
    limite?: number | undefined;
  }): Promise<AtividadeUsuario[]> {
    let lista = obterAtividadesStorage();

    if (filtro?.usuario_id && filtro.usuario_id !== "todos") {
      lista = lista.filter((a) => a.usuario_id === filtro.usuario_id);
    }

    if (filtro?.tipo && filtro.tipo !== ("todos" as any)) {
      lista = lista.filter((a) => a.tipo === filtro.tipo);
    }

    if (filtro?.lead_id) {
      lista = lista.filter((a) => a.lead_id === filtro.lead_id);
    }

    const limite = filtro?.limite || 150;
    return lista.slice(0, limite);
  },

  /**
   * Calcula o resumo consolidado de movimentações para cada usuário da equipe
   */
  obterResumoPorUsuario(usuario_id: string): {
    totalAcoes: number;
    totalWhatsApp: number;
    totalMudancasStatus: number;
    totalFechados: number;
    totalMinerados: number;
    ultimaAtividade: string | null;
  } {
    const lista = obterAtividadesStorage().filter((a) => a.usuario_id === usuario_id);

    let totalWhatsApp = 0;
    let totalMudancasStatus = 0;
    let totalFechados = 0;
    let totalMinerados = 0;

    lista.forEach((a) => {
      if (a.tipo === "whatsapp") totalWhatsApp += 1;
      if (a.tipo === "mudanca_status") {
        totalMudancasStatus += 1;
        if (a.metadados?.["novo_status"] === "fechado") {
          totalFechados += 1;
        }
      }
      if (a.tipo === "mineracao") {
        totalMinerados += Number(a.metadados?.["quantidade"] || 1);
      }
    });

    return {
      totalAcoes: lista.length,
      totalWhatsApp,
      totalMudancasStatus,
      totalFechados,
      totalMinerados,
      ultimaAtividade: lista[0]?.criado_em || null,
    };
  },
};
