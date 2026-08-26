import { supabase } from "@/integrations/supabase/client";

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

const STORAGE_KEY_FINANCEIRO = "prospecta_transacoes_financeiras_v1";

// Dados iniciais realistas de exemplo para inicialização imediata da plataforma
const TRANSACOES_INICIAIS: TransacaoFinanceira[] = [
  {
    id: "tx-rec-1",
    tipo: "receita",
    titulo: "Criação de Site — Barbearia Corleone",
    descricao: "Desenvolvimento de landing page institucional + integração WhatsApp",
    categoria: "venda_site",
    valor: 2500.0,
    data_competencia: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    data_pagamento: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    recorrencia: "pontual",
    status: "pago",
    lead_nome: "Barbearia Corleone",
    criado_em: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tx-rec-2",
    tipo: "receita",
    titulo: "Website & Cardápio Digital — Pizzaria Bella Napoli",
    descricao: "Setup do site responsivo e domínio próprio",
    categoria: "venda_site",
    valor: 3200.0,
    data_competencia: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    data_pagamento: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    recorrencia: "pontual",
    status: "pago",
    lead_nome: "Pizzaria Bella Napoli",
    criado_em: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tx-rec-3",
    tipo: "receita",
    titulo: "Mensalidade Gestão & Hospedagem — Barbearia Corleone",
    descricao: "Manutenção mensal de infraestrutura e SEO local",
    categoria: "mensalidade",
    valor: 250.0,
    data_competencia: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    data_pagamento: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    recorrencia: "mensal",
    status: "pago",
    lead_nome: "Barbearia Corleone",
    criado_em: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tx-rec-4",
    tipo: "receita",
    titulo: "Otimização Google Meu Negócio — Oficina do Alemão",
    descricao: "Adequação de perfil, fotos, catálogo e SEO regional",
    categoria: "consultoria",
    valor: 1200.0,
    data_competencia: new Date().toISOString().slice(0, 10),
    recorrencia: "pontual",
    status: "pendente",
    lead_nome: "Oficina do Alemão",
    criado_em: new Date().toISOString(),
  },
  // Despesas Operacionais e de Tecnologia
  {
    id: "tx-desp-1",
    tipo: "despesa",
    titulo: "Google Cloud / Places API",
    descricao: "Créditos de varredura e busca cartográfica de estabelecimentos",
    categoria: "tecnologia",
    valor: 215.4,
    data_competencia: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    data_pagamento: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    recorrencia: "mensal",
    status: "pago",
    criado_em: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tx-desp-2",
    tipo: "despesa",
    titulo: "Supabase Pro Plan & Database",
    descricao: "Hospedagem de banco Postgres e autenticação",
    categoria: "tecnologia",
    valor: 145.0,
    data_competencia: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    data_pagamento: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    recorrencia: "mensal",
    status: "pago",
    criado_em: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tx-desp-3",
    tipo: "despesa",
    titulo: "WhatsApp Business API / Disparador",
    descricao: "Licença de software para envio de abordagens comerciais",
    categoria: "marketing",
    valor: 189.9,
    data_competencia: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    data_pagamento: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    recorrencia: "mensal",
    status: "pago",
    criado_em: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tx-desp-4",
    tipo: "despesa",
    titulo: "Anúncios Meta Ads (Prospecção Inbound)",
    descricao: "Campanha de captação de leads empresariais locais",
    categoria: "marketing",
    valor: 450.0,
    data_competencia: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    data_pagamento: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    recorrencia: "pontual",
    status: "pago",
    criado_em: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tx-desp-5",
    tipo: "despesa",
    titulo: "Design Freelancer (Templates de Landing Pages)",
    descricao: "Criação de 3 layouts prontos no Figma para apresentação a clientes",
    categoria: "equipe",
    valor: 600.0,
    data_competencia: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    data_pagamento: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    recorrencia: "pontual",
    status: "pago",
    criado_em: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tx-desp-6",
    tipo: "despesa",
    titulo: "DAS MEI / Simples Nacional",
    descricao: "Guia tributária mensal da empresa",
    categoria: "impostos",
    valor: 75.6,
    data_competencia: new Date().toISOString().slice(0, 10),
    recorrencia: "mensal",
    status: "pendente",
    criado_em: new Date().toISOString(),
  },
  {
    id: "tx-desp-7",
    tipo: "despesa",
    titulo: "Registro.br (Domínios dos Clientes)",
    descricao: "Registro anual de 3 novos domínios .com.br",
    categoria: "tecnologia",
    valor: 120.0,
    data_competencia: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    data_pagamento: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    recorrencia: "anual",
    status: "pago",
    criado_em: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tx-desp-8",
    tipo: "despesa",
    titulo: "Internet Fibra & Telefonia Comercial",
    descricao: "Conexão dedicada e chip comercial WhatsApp",
    categoria: "operacional",
    valor: 179.9,
    data_competencia: new Date().toISOString().slice(0, 10),
    recorrencia: "mensal",
    status: "pendente",
    criado_em: new Date().toISOString(),
  },
];

function obterTransacoesStorage(): TransacaoFinanceira[] {
  if (typeof window === "undefined") return TRANSACOES_INICIAIS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FINANCEIRO);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_FINANCEIRO, JSON.stringify(TRANSACOES_INICIAIS));
      return TRANSACOES_INICIAIS;
    }
    const parsed = JSON.parse(raw) as TransacaoFinanceira[];
    return Array.isArray(parsed) ? parsed : TRANSACOES_INICIAIS;
  } catch {
    return TRANSACOES_INICIAIS;
  }
}

function salvarTransacoesStorage(lista: TransacaoFinanceira[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_FINANCEIRO, JSON.stringify(lista));
  } catch {
    // ignore
  }
}

export const financeiroService = {
  /**
   * Retorna todas as transações cadastradas (receitas e despesas)
   */
  async listarTransacoes(): Promise<TransacaoFinanceira[]> {
    try {
      const { data, error } = await supabase
        .from("transacoes_financeiras" as any)
        .select("*")
        .order("data_competencia", { ascending: false });

      if (!error && data && Array.isArray(data) && data.length > 0) {
        return data as unknown as TransacaoFinanceira[];
      }
    } catch {
      // Tabela do Supabase não criada ou sem permissão -> usa armazenamento local
    }

    const locais = obterTransacoesStorage();
    locais.sort(
      (a, b) =>
        new Date(b.data_competencia).getTime() - new Date(a.data_competencia).getTime() ||
        new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime(),
    );
    return locais;
  },

  /**
   * Cria uma nova transação financeira (Receita ou Gasto)
   */
  async criarTransacao(
    dados: Omit<TransacaoFinanceira, "id" | "criado_em">,
  ): Promise<TransacaoFinanceira> {
    const nova: TransacaoFinanceira = {
      ...dados,
      id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      criado_em: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from("transacoes_financeiras" as any)
        .insert([nova as any])
        .select()
        .single();

      if (!error && data) {
        const atual = obterTransacoesStorage();
        salvarTransacoesStorage([data as unknown as TransacaoFinanceira, ...atual]);
        return data as unknown as TransacaoFinanceira;
      }
    } catch {
      // Salva no storage local
    }

    const atual = obterTransacoesStorage();
    const atualizado = [nova, ...atual];
    salvarTransacoesStorage(atualizado);
    return nova;
  },

  /**
   * Atualiza uma transação financeira existente
   */
  async atualizarTransacao(
    id: string,
    dados: Partial<Omit<TransacaoFinanceira, "id" | "criado_em">>,
  ): Promise<TransacaoFinanceira | null> {
    try {
      const { data, error } = await supabase
        .from("transacoes_financeiras" as any)
        .update({ ...dados, atualizado_em: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        const atual = obterTransacoesStorage();
        const novo = atual.map((t) => (t.id === id ? (data as unknown as TransacaoFinanceira) : t));
        salvarTransacoesStorage(novo);
        return data as unknown as TransacaoFinanceira;
      }
    } catch {
      // Local fallback
    }

    const atual = obterTransacoesStorage();
    let modificado: TransacaoFinanceira | null = null;
    const novo = atual.map((t) => {
      if (t.id === id) {
        modificado = { ...t, ...dados, atualizado_em: new Date().toISOString() };
        return modificado;
      }
      return t;
    });
    salvarTransacoesStorage(novo);
    return modificado;
  },

  /**
   * Exclui uma transação financeira
   */
  async excluirTransacao(id: string): Promise<boolean> {
    try {
      await supabase
        .from("transacoes_financeiras" as any)
        .delete()
        .eq("id", id);
    } catch {
      // Local
    }

    const atual = obterTransacoesStorage();
    const novo = atual.filter((t) => t.id !== id);
    salvarTransacoesStorage(novo);
    return true;
  },

  /**
   * Calcula todas as métricas financeiras consolidadas (Lucro, ROI, Despesas por Categoria, Evolução Mensal)
   */
  calcularMetricas(
    transacoes: TransacaoFinanceira[],
    filtroMes?: string | null,
  ): MetricasFinanceiras {
    const lista = transacoes.filter((t) => {
      if (t.status === "cancelado") return false;
      if (filtroMes && filtroMes !== "todos") {
        return t.data_competencia.startsWith(filtroMes);
      }
      return true;
    });

    let receitaTotal = 0;
    let receitaRecebida = 0;
    let receitaPendente = 0;

    let despesaTotal = 0;
    let despesaPaga = 0;
    let despesaPendente = 0;

    const gastosPorCategoria: Record<string, number> = {
      tecnologia: 0,
      marketing: 0,
      equipe: 0,
      operacional: 0,
      impostos: 0,
      outros: 0,
    };

    const receitasPorCategoria: Record<string, number> = {
      venda_site: 0,
      mensalidade: 0,
      consultoria: 0,
      gestao_trafego: 0,
      outra_receita: 0,
    };

    for (const t of lista) {
      if (t.tipo === "receita") {
        receitaTotal += t.valor;
        if (t.status === "pago") {
          receitaRecebida += t.valor;
        } else if (t.status === "pendente") {
          receitaPendente += t.valor;
        }
        receitasPorCategoria[t.categoria] = (receitasPorCategoria[t.categoria] || 0) + t.valor;
      } else if (t.tipo === "despesa") {
        despesaTotal += t.valor;
        if (t.status === "pago") {
          despesaPaga += t.valor;
        } else if (t.status === "pendente") {
          despesaPendente += t.valor;
        }
        gastosPorCategoria[t.categoria] = (gastosPorCategoria[t.categoria] || 0) + t.valor;
      }
    }

    const lucroLiquido = receitaTotal - despesaTotal;
    const margemLucroPercentual =
      receitaTotal > 0 ? Number(((lucroLiquido / receitaTotal) * 100).toFixed(1)) : 0;
    const roiMultiplicador =
      despesaTotal > 0 ? Number((receitaTotal / despesaTotal).toFixed(2)) : 0;

    // Calcular evolução mensal agrupando por Ano-Mês
    const mapaMeses: Record<string, { receita: number; despesa: number }> = {};

    // Agrupar todas as transações (mesmo que haja filtro de exibição para ter gráfico completo)
    for (const t of transacoes) {
      if (t.status === "cancelado") continue;
      const chaveMes = t.data_competencia.slice(0, 7); // "YYYY-MM"
      if (!mapaMeses[chaveMes]) {
        mapaMeses[chaveMes] = { receita: 0, despesa: 0 };
      }
      if (t.tipo === "receita") {
        mapaMeses[chaveMes].receita += t.valor;
      } else {
        mapaMeses[chaveMes].despesa += t.valor;
      }
    }

    // Ordenar cronologicamente os últimos 6 meses
    const mesesOrdenados = Object.keys(mapaMeses).sort();
    const mesesNomes = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    const evolucaoMensal = mesesOrdenados.map((m) => {
      const [ano, mesNum] = m.split("-");
      const idxMes = parseInt(mesNum || "1", 10) - 1;
      const rotulo = `${mesesNomes[idxMes] || mesNum}/${ano?.slice(2)}`;
      const rec = mapaMeses[m]?.receita ?? 0;
      const desp = mapaMeses[m]?.despesa ?? 0;
      return {
        mes: m,
        mesRotulo: rotulo,
        receita: Number(rec.toFixed(2)),
        despesa: Number(desp.toFixed(2)),
        lucro: Number((rec - desp).toFixed(2)),
      };
    });

    return {
      receitaTotal: Number(receitaTotal.toFixed(2)),
      receitaRecebida: Number(receitaRecebida.toFixed(2)),
      receitaPendente: Number(receitaPendente.toFixed(2)),
      despesaTotal: Number(despesaTotal.toFixed(2)),
      despesaPaga: Number(despesaPaga.toFixed(2)),
      despesaPendente: Number(despesaPendente.toFixed(2)),
      lucroLiquido: Number(lucroLiquido.toFixed(2)),
      margemLucroPercentual,
      roiMultiplicador,
      gastosPorCategoria,
      receitasPorCategoria,
      evolucaoMensal,
    };
  },

  /**
   * Registra automaticamente uma receita a partir de um Lead fechado no Funil
   */
  async registrarReceitaLeadFechado(
    leadId: string,
    leadNome: string,
    valorContrato: number,
    categoria: CategoriaReceita = "venda_site",
    tipoRecorrencia: RecorrenciaTransacao = "pontual",
  ): Promise<TransacaoFinanceira> {
    return this.criarTransacao({
      tipo: "receita",
      titulo: `Contrato Fechado — ${leadNome}`,
      descricao: `Receita gerada pelo fechamento do estabelecimento ${leadNome} no Funil de Vendas`,
      categoria,
      valor: valorContrato,
      data_competencia: new Date().toISOString().slice(0, 10),
      data_pagamento: new Date().toISOString().slice(0, 10),
      recorrencia: tipoRecorrencia,
      status: "pago",
      lead_id: leadId,
      lead_nome: leadNome,
    });
  },

  /**
   * Zera a base de transações financeiras (para testes e limpeza)
   */
  async zerarTransacoes(): Promise<number> {
    const total = obterTransacoesStorage().length;
    salvarTransacoesStorage([]);
    try {
      await supabase
        .from("transacoes_financeiras" as any)
        .delete()
        .neq("id", "0");
    } catch {
      // ignore
    }
    return total;
  },

  /**
   * Restaura dados de demonstração
   */
  async restaurarDadosExemplo(): Promise<number> {
    salvarTransacoesStorage(TRANSACOES_INICIAIS);
    return TRANSACOES_INICIAIS.length;
  },
};

export const ROTULOS_CATEGORIAS_DESPESA: Record<
  CategoriaDespesa,
  { rotulo: string; descricao: string; cor: string; icone: string }
> = {
  tecnologia: {
    rotulo: "Tecnologia & APIs",
    descricao: "Google Places API, Supabase, Servidores, Domínios e Cloud",
    cor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    icone: "Cpu",
  },
  marketing: {
    rotulo: "Marketing & Vendas",
    descricao: "WhatsApp API, Anúncios Meta/Google, Comissões e Tráfego",
    cor: "text-pink-400 bg-pink-500/10 border-pink-500/30",
    icone: "Megaphone",
  },
  equipe: {
    rotulo: "Equipe & Pessoal",
    descricao: "Salários, Pró-labore, Freelancers e Designers",
    cor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    icone: "Users",
  },
  operacional: {
    rotulo: "Custos Operacionais",
    descricao: "Internet, Luz, Telefonia e Softwares de Gestão",
    cor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    icone: "Building2",
  },
  impostos: {
    rotulo: "Impostos & Tributos",
    descricao: "DAS MEI, Simples Nacional e Taxas de Gateway",
    cor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    icone: "Receipt",
  },
  outros: {
    rotulo: "Outros Gastos",
    descricao: "Despesas gerais e custos variáveis diversos",
    cor: "text-zinc-400 bg-zinc-500/10 border-zinc-500/30",
    icone: "Package",
  },
};

export const ROTULOS_CATEGORIAS_RECEITA: Record<
  CategoriaReceita,
  { rotulo: string; descricao: string; cor: string }
> = {
  venda_site: {
    rotulo: "Desenvolvimento de Site",
    descricao: "Criação de Landing Page ou Site Institucional",
    cor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  mensalidade: {
    rotulo: "Mensalidade / Hospedagem",
    descricao: "Recorrência mensal de manutenção (MRR)",
    cor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  },
  consultoria: {
    rotulo: "Consultoria & Google Meu Negócio",
    descricao: "Otimização de Perfil, SEO Local e Catálogo",
    cor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  },
  gestao_trafego: {
    rotulo: "Gestão de Tráfego & Redes",
    descricao: "Gerenciamento de anúncios e perfil do Instagram",
    cor: "text-pink-400 bg-pink-500/10 border-pink-500/30",
  },
  outra_receita: {
    rotulo: "Outras Receitas",
    descricao: "Serviços comerciais complementares",
    cor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
};
