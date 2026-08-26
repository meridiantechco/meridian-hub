import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import type { BuscaItem, InteracaoItem, LeadItem } from "../types";
import { calcularScoreLead } from "../utils/score";

const STORAGE_KEY_LEADS = "meridian_leads_v1";
const STORAGE_KEY_LEADS_LEGADO = "prospecta_leads_v4";
const STORAGE_KEY_BUSCAS = "meridian_buscas_v1";
const STORAGE_KEY_BUSCAS_LEGADO = "prospecta_buscas_v4";
const STORAGE_KEY_INTERACOES = "meridian_interacoes_v1";
const STORAGE_KEY_INTERACOES_LEGADO = "prospecta_interacoes_v4";

function obterDoStorage<T>(chave: string, chaveLegada: string, padrao: T[] = []): T[] {
  if (typeof window === "undefined") return padrao;
  try {
    const raw = localStorage.getItem(chave) || localStorage.getItem(chaveLegada);
    if (!raw) {
      return padrao;
    }
    const guardados = JSON.parse(raw) as T[];
    return Array.isArray(guardados) ? guardados : padrao;
  } catch {
    return padrao;
  }
}

function salvarNoStorage<T>(chave: string, itens: T[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(chave, JSON.stringify(itens));
  } catch (err) {
    console.error("Erro ao salvar no storage local", err);
  }
}

export const leadsService = {
  // LEADS
  async listarLeads(): Promise<LeadItem[]> {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("criado_em", { ascending: false });

      if (!error && data) {
        salvarNoStorage(STORAGE_KEY_LEADS, data as LeadItem[]);
        return data as LeadItem[];
      }
    } catch {
      // fallback
    }

    return obterDoStorage<LeadItem>(STORAGE_KEY_LEADS, STORAGE_KEY_LEADS_LEGADO, []);
  },

  async obterLeadPorId(id: string): Promise<LeadItem | null> {
    try {
      const { data, error } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
      if (!error && data) return data as LeadItem;
    } catch {
      // fallback
    }

    const lista = obterDoStorage<LeadItem>(STORAGE_KEY_LEADS, STORAGE_KEY_LEADS_LEGADO, []);
    return lista.find((l) => l.id === id) ?? null;
  },

  async atualizarStatusLead(id: string, status: LeadItem["status"]): Promise<void> {
    const agora = new Date().toISOString();
    try {
      await supabase.from("leads").update({ status, atualizado_em: agora }).eq("id", id);
    } catch {
      // continua para atualizar local
    }

    const lista = obterDoStorage<LeadItem>(STORAGE_KEY_LEADS, STORAGE_KEY_LEADS_LEGADO, []);
    const index = lista.findIndex((l) => l.id === id);
    if (index !== -1) {
      const item = lista[index]!;
      lista[index] = { ...item, status, atualizado_em: agora };
      salvarNoStorage(STORAGE_KEY_LEADS, lista);
    }
  },

  async atualizarLead(
    id: string,
    campos: Partial<TablesUpdate<"leads">>,
  ): Promise<LeadItem | null> {
    const agora = new Date().toISOString();
    try {
      const { data } = await supabase
        .from("leads")
        .update({ ...campos, atualizado_em: agora })
        .eq("id", id)
        .select()
        .maybeSingle();

      if (data) {
        const lista = obterDoStorage<LeadItem>(STORAGE_KEY_LEADS, STORAGE_KEY_LEADS_LEGADO, []);
        const index = lista.findIndex((l) => l.id === id);
        if (index !== -1) {
          lista[index] = data as LeadItem;
          salvarNoStorage(STORAGE_KEY_LEADS, lista);
        }
        return data as LeadItem;
      }
    } catch {
      // fallback
    }

    const lista = obterDoStorage<LeadItem>(STORAGE_KEY_LEADS, STORAGE_KEY_LEADS_LEGADO, []);
    const index = lista.findIndex((l) => l.id === id);
    if (index !== -1) {
      const item = lista[index]!;
      const atualizado: LeadItem = {
        ...item,
        ...campos,
        atualizado_em: agora,
      } as LeadItem;
      lista[index] = atualizado;
      salvarNoStorage(STORAGE_KEY_LEADS, lista);
      return atualizado;
    }
    return null;
  },

  async removerLead(id: string): Promise<boolean> {
    try {
      await supabase.from("leads").delete().eq("id", id);
    } catch {
      // fallback
    }
    const lista = obterDoStorage<LeadItem>(STORAGE_KEY_LEADS, STORAGE_KEY_LEADS_LEGADO, []);
    const novaLista = lista.filter((l) => l.id !== id);
    salvarNoStorage(STORAGE_KEY_LEADS, novaLista);
    return true;
  },

  async salvarNovosLeads(
    novosLeads: TablesInsert<"leads">[],
    dadosBusca?: TablesInsert<"buscas">,
  ): Promise<{ importados: number }> {
    let importados = 0;
    try {
      if (dadosBusca) {
        await supabase.from("buscas").insert(dadosBusca);
      }

      if (novosLeads.length > 0) {
        const { data, error } = await supabase.from("leads").insert(novosLeads).select();

        if (!error && data) {
          importados = data.length;
        }
      }
    } catch (e) {
      console.warn("Supabase insert falhou, sincronizando localmente", e);
    }

    const listaAtual = obterDoStorage<LeadItem>(STORAGE_KEY_LEADS, STORAGE_KEY_LEADS_LEGADO, []);
    const leadsFormatados: LeadItem[] = novosLeads.map((nl) => ({
      id: nl.id ?? `lead-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      nome: nl.nome,
      categoria: nl.categoria ?? "Geral",
      endereco: nl.endereco ?? null,
      bairro: nl.bairro ?? null,
      cidade: nl.cidade ?? null,
      estado: nl.estado ?? null,
      latitude: nl.latitude ?? null,
      longitude: nl.longitude ?? null,
      telefone: nl.telefone ?? null,
      whatsapp_link: nl.whatsapp_link ?? null,
      instagram: nl.instagram ?? null,
      facebook: nl.facebook ?? null,
      site_url: nl.site_url ?? null,
      tem_site: nl.tem_site ?? false,
      avaliacao_google: nl.avaliacao_google ?? null,
      total_avaliacoes: nl.total_avaliacoes ?? 0,
      place_id: nl.place_id ?? null,
      status: nl.status ?? "novo",
      score: nl.score ?? calcularScoreLead(nl),
      origem: nl.origem ?? "google_places",
      responsavel_id: nl.responsavel_id ?? null,
      observacoes: nl.observacoes ?? null,
      criado_em: nl.criado_em ?? new Date().toISOString(),
      atualizado_em: nl.atualizado_em ?? new Date().toISOString(),
    }));

    const novosFiltrados = leadsFormatados.filter(
      (novo) =>
        !listaAtual.some((existente) =>
          Boolean(existente.place_id && existente.place_id === novo.place_id),
        ),
    );

    const listaFinal = [...novosFiltrados, ...listaAtual];
    salvarNoStorage(STORAGE_KEY_LEADS, listaFinal);

    if (dadosBusca) {
      const buscasAtuais = obterDoStorage<BuscaItem>(STORAGE_KEY_BUSCAS, STORAGE_KEY_BUSCAS_LEGADO, []);
      const novaBusca: BuscaItem = {
        id: dadosBusca.id ?? `busca-${Date.now()}`,
        termo_busca: dadosBusca.termo_busca,
        categoria: dadosBusca.categoria ?? null,
        regiao: dadosBusca.regiao ?? null,
        raio_km: dadosBusca.raio_km ?? 5,
        total_resultados: dadosBusca.total_resultados ?? novosLeads.length,
        total_sem_site: dadosBusca.total_sem_site ?? novosLeads.filter((l) => !l.tem_site).length,
        executada_por: dadosBusca.executada_por ?? null,
        criada_em: dadosBusca.criada_em ?? new Date().toISOString(),
      };
      salvarNoStorage(STORAGE_KEY_BUSCAS, [novaBusca, ...buscasAtuais]);
    }

    return { importados: novosFiltrados.length || novosLeads.length };
  },

  // BUSCAS
  async listarBuscas(): Promise<BuscaItem[]> {
    try {
      const { data, error } = await supabase
        .from("buscas")
        .select("*")
        .order("criada_em", { ascending: false });

      if (!error && data && data.length > 0) {
        salvarNoStorage(STORAGE_KEY_BUSCAS, data as BuscaItem[]);
        return data as BuscaItem[];
      }
    } catch {
      // fallback
    }

    return obterDoStorage<BuscaItem>(STORAGE_KEY_BUSCAS, STORAGE_KEY_BUSCAS_LEGADO, []);
  },

  // INTERAÇÕES
  async listarInteracoes(leadId: string): Promise<InteracaoItem[]> {
    try {
      const { data, error } = await supabase
        .from("interacoes")
        .select("*")
        .eq("lead_id", leadId)
        .order("criado_em", { ascending: false });

      if (!error && data && data.length > 0) {
        return data as InteracaoItem[];
      }
    } catch {
      // fallback
    }

    const interacoes = obterDoStorage<InteracaoItem>(STORAGE_KEY_INTERACOES, STORAGE_KEY_INTERACOES_LEGADO, []);
    return interacoes.filter((i) => i.lead_id === leadId);
  },

  async registrarInteracao(interacao: TablesInsert<"interacoes">): Promise<InteracaoItem> {
    const nova: InteracaoItem = {
      id: interacao.id ?? `int-${Date.now()}`,
      lead_id: interacao.lead_id,
      tipo: interacao.tipo ?? "whatsapp",
      descricao: interacao.descricao ?? null,
      resultado: interacao.resultado ?? null,
      usuario_id: interacao.usuario_id ?? null,
      criado_em: interacao.criado_em ?? new Date().toISOString(),
    };

    try {
      await supabase.from("interacoes").insert(nova);
    } catch {
      // fallback
    }

    const lista = obterDoStorage<InteracaoItem>(STORAGE_KEY_INTERACOES, STORAGE_KEY_INTERACOES_LEGADO, []);
    salvarNoStorage(STORAGE_KEY_INTERACOES, [nova, ...lista]);
    return nova;
  },

  async zerarBaseLeads(): Promise<number> {
    const listaAtual = obterDoStorage<LeadItem>(STORAGE_KEY_LEADS, STORAGE_KEY_LEADS_LEGADO, []);
    const total = listaAtual.length;

    try {
      await supabase.from("interacoes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("leads").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    } catch (e) {
      console.warn("Falha ao zerar no Supabase, limpando localmente:", e);
    }

    salvarNoStorage(STORAGE_KEY_LEADS, []);
    salvarNoStorage(STORAGE_KEY_INTERACOES, []);
    return total;
  },

  async reiniciarFunilLeads(): Promise<number> {
    const agora = new Date().toISOString();
    try {
      await supabase
        .from("leads")
        .update({ status: "novo", atualizado_em: agora })
        .neq("id", "00000000-0000-0000-0000-000000000000");
    } catch (e) {
      console.warn("Falha ao reiniciar funil no Supabase, atualizando localmente:", e);
    }

    const lista = obterDoStorage<LeadItem>(STORAGE_KEY_LEADS, STORAGE_KEY_LEADS_LEGADO, []);
    const atualizados = lista.map((l) => ({ ...l, status: "novo" as const, atualizado_em: agora }));
    salvarNoStorage(STORAGE_KEY_LEADS, atualizados);
    return lista.length;
  },

  limparDadosLocais(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY_LEADS);
    localStorage.removeItem(STORAGE_KEY_BUSCAS);
    localStorage.removeItem(STORAGE_KEY_INTERACOES);
  },
};

export const prospectaService = leadsService;
