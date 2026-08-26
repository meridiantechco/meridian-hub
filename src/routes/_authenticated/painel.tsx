import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/prospecta/AppShell";
import { BadgePrioridade } from "@/components/prospecta/BadgePrioridade";
import { BadgeStatus } from "@/components/prospecta/BadgeStatus";
import { ModalMensagemWhatsApp } from "@/components/prospecta/ModalMensagemWhatsApp";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prospectaService } from "@/lib/prospecta-service";
import { financeiroService, type MetricasFinanceiras } from "@/lib/financeiro-service";
import type { LeadItem } from "@/lib/leads-mock";
import {
  Users,
  Globe,
  TrendingUp,
  TrendingDown,
  Award,
  Search,
  MessageSquare,
  ArrowRight,
  Flame,
  Star,
  RefreshCw,
  Zap,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Radar,
  Building2,
  AlertCircle,
  Plus,
  Instagram,
  Wallet,
  PiggyBank,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Painel Comercial & Lucratividade — Prospecta" },
      {
        name: "description",
        content: "Visão geral da prospecção de estabelecimentos sem site e controle financeiro",
      },
    ],
  }),
  component: PaginaPainel,
});

export function PaginaPainel() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [metricasFin, setMetricasFin] = useState<MetricasFinanceiras | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [leadParaWhatsApp, setLeadParaWhatsApp] = useState<LeadItem | null>(null);
  const [modalWhatsAppAberto, setModalWhatsAppAberto] = useState(false);

  const carregarDados = async () => {
    setCarregando(true);
    const [listaLeads, listaTx] = await Promise.all([
      prospectaService.listarLeads(),
      financeiroService.listarTransacoes(),
    ]);
    setLeads(listaLeads);
    setMetricasFin(financeiroService.calcularMetricas(listaTx));
    setCarregando(false);
  };

  useEffect(() => {
    void carregarDados();
  }, []);

  // Formatação de moeda
  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  // Métricas comerciais
  const totalLeads = leads.length;
  const leadsSemSite = leads.filter((l) => !l.tem_site).length;
  const percSemSite = totalLeads > 0 ? Math.round((leadsSemSite / totalLeads) * 100) : 0;

  const scoreMedio =
    totalLeads > 0 ? Math.round(leads.reduce((acc, l) => acc + l.score, 0) / totalLeads) : 0;

  const fechados = leads.filter((l) => l.status === "fechado").length;
  const taxaConversao = totalLeads > 0 ? ((fechados / totalLeads) * 100).toFixed(1) : "0.0";

  // Leads mais quentes (não contatados, com maior score e sem site)
  const leadsMaisQuentes = useMemo(() => {
    return [...leads]
      .filter((l) => l.status === "novo" && !l.tem_site)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [leads]);

  // Estabelecimentos Recentes
  const leadsRecentes = useMemo(() => {
    return [...leads]
      .sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime())
      .slice(0, 5);
  }, [leads]);

  // Dados para Gráfico por Categoria
  const dadosCategorias = useMemo(() => {
    const contagem: Record<string, { total: number; semSite: number }> = {};
    leads.forEach((l) => {
      const cat = l.categoria || "Outros";
      if (!contagem[cat]) contagem[cat] = { total: 0, semSite: 0 };
      contagem[cat].total += 1;
      if (!l.tem_site) contagem[cat].semSite += 1;
    });

    return Object.entries(contagem)
      .map(([nome, val]) => ({
        categoria: nome.length > 14 ? `${nome.slice(0, 12)}...` : nome,
        categoriaCompleta: nome,
        total: val.total,
        semSite: val.semSite,
      }))
      .sort((a, b) => b.semSite - a.semSite)
      .slice(0, 6);
  }, [leads]);

  // Dados para Funil
  const dadosFunil = useMemo(() => {
    const etapas = [
      { status: "novo", nome: "Novos", cor: "#c084fc" },
      { status: "contatado", nome: "Contatados", cor: "#f59e0b" },
      { status: "proposta", nome: "Propostas", cor: "#a855f7" },
      { status: "fechado", nome: "Fechados", cor: "#34d399" },
      { status: "recusado", nome: "Recusados", cor: "#f43f5e" },
    ];

    return etapas.map((e) => ({
      name: e.nome,
      quantidade: leads.filter((l) => l.status === e.status).length,
      cor: e.cor,
    }));
  }, [leads]);

  return (
    <AppShell
      titulo="Painel Comercial"
      descricao="Monitoramento de estabelecimentos minerados, oportunidades sem site, lucratividade real e taxas de conversão"
      acoes={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={carregarDados}
            disabled={carregando}
            className="h-8 gap-1.5 text-xs"
          >
            <RefreshCw className={`size-3.5 ${carregando ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button
            asChild
            size="sm"
            className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground font-semibold shadow-sm"
          >
            <Link to="/nova-busca">
              <Search className="size-3.5" />
              Detectar Estabelecimentos
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* CARDS DE INDICADORES PRINCIPAIS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border/80 shadow-elev hover:border-primary/40 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider rotulo">
                Total de Estabelecimentos
              </CardTitle>
              <div className="size-9 rounded-xl bg-purple-500/10 text-primary border border-purple-500/20 flex items-center justify-center shadow-sm">
                <Building2 className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl lg:text-3xl font-bold font-display dado">{totalLeads}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span>Empresas cadastradas no sistema</span>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/80 shadow-elev ring-1 ring-[var(--color-alerta)]/30 hover:border-[var(--color-alerta)]/60 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-[var(--color-alerta)] uppercase tracking-wider rotulo">
                Sem Site Próprio
              </CardTitle>
              <div className="size-9 rounded-xl bg-[var(--color-alerta)]/15 text-[var(--color-alerta)] border border-[var(--color-alerta)]/30 flex items-center justify-center shadow-sm">
                <Globe className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl lg:text-3xl font-bold font-display text-[var(--color-alerta)] dado">
                  {leadsSemSite}
                </span>
                <span className="text-xs font-semibold text-[var(--color-alerta)] bg-[var(--color-alerta)]/10 px-2 py-0.5 rounded-full border border-[var(--color-alerta)]/20 dado">
                  {percSemSite}% do total
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Oportunidades imediatas de abordagem
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/80 shadow-elev hover:border-primary/40 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider rotulo">
                Score Médio
              </CardTitle>
              <div className="size-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shadow-sm">
                <Award className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl lg:text-3xl font-bold font-display text-amber-400 dado">
                {scoreMedio}{" "}
                <span className="text-xs font-normal text-muted-foreground">/ 100</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Índice de potencial de conversão</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/80 shadow-elev hover:border-primary/40 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider rotulo">
                Taxa de Conversão
              </CardTitle>
              <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-sm">
                <TrendingUp className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl lg:text-3xl font-bold font-display text-emerald-400 dado">
                {taxaConversao}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {fechados} contratos fechados com sucesso
              </p>
            </CardContent>
          </Card>
        </div>

        {/* WIDGET DE GESTÃO FINANCEIRA & LUCRO (DESTAQUE) */}
        {metricasFin && (
          <div className="rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/15 via-card to-card p-5 shadow-elev flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Wallet className="size-5 text-primary" />
                <h3 className="text-base font-bold text-foreground font-display flex items-center gap-2">
                  Gestão Financeira & Apuração de Lucro
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-mono">
                    Margem: {metricasFin.margemLucroPercentual}%
                  </span>
                </h3>
              </div>
              <p className="text-xs text-muted-foreground max-w-2xl">
                Controle integral de todos os tipos de gastos (Google Places API, Servidores,
                WhatsApp, Equipe, Impostos) vs. Contratos faturados.
              </p>
            </div>

            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
              <div className="text-right">
                <p className="rotulo text-[10px]">Lucro Líquido Real</p>
                <p className="text-xl font-bold font-display text-emerald-400 dado">
                  {formatarMoeda(metricasFin.lucroLiquido)}
                </p>
              </div>

              <div className="text-right">
                <p className="rotulo text-[10px]">Gastos Totais</p>
                <p className="text-xl font-bold font-display text-pink-400 dado">
                  {formatarMoeda(metricasFin.despesaTotal)}
                </p>
              </div>

              <Button
                asChild
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 px-4 gap-1.5 font-semibold shrink-0"
              >
                <Link to="/financeiro">
                  Acessar Financeiro
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* GRÁFICOS: CATEGORIAS + FUNIL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Barras: Oportunidades por Categoria */}
          <Card className="bg-card border-border shadow-elev">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Oportunidades por Segmento</CardTitle>
              <CardDescription className="text-xs">
                Distribuição de estabelecimentos sem site vs total por nicho comercial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dadosCategorias}
                    margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                  >
                    <XAxis
                      dataKey="categoria"
                      stroke="#a19cb2"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#a19cb2"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#161224",
                        borderColor: "#3b2f5c",
                        borderRadius: "8px",
                        color: "#ffffff",
                        fontSize: "12px",
                      }}
                      formatter={(val: number, name: string) => [
                        `${val} estabelecimentos`,
                        name === "semSite" ? "Sem site" : "Total",
                      ]}
                      labelFormatter={(_, items) => {
                        const item = items[0]?.payload as { categoriaCompleta?: string };
                        return item?.categoriaCompleta || "";
                      }}
                    />
                    <Bar dataKey="total" fill="#2b2244" radius={[4, 4, 0, 0]} name="Total" />
                    <Bar dataKey="semSite" fill="#a855f7" radius={[4, 4, 0, 0]} name="Sem site" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Distribuição do Funil */}
          <Card className="bg-card border-border shadow-elev">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Status do Funil Comercial</CardTitle>
              <CardDescription className="text-xs">
                Distribuição percentual dos estabelecimentos em cada fase de negociação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dadosFunil.map((etapa) => {
                  const perc = totalLeads > 0 ? (etapa.quantidade / totalLeads) * 100 : 0;
                  return (
                    <div key={etapa.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="flex items-center gap-2">
                          <span
                            className="size-2.5 rounded-full"
                            style={{ backgroundColor: etapa.cor }}
                          />
                          {etapa.name}
                        </span>
                        <span className="dado text-muted-foreground">
                          {etapa.quantidade} estabelecimentos ({perc.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${perc}%`,
                            backgroundColor: etapa.cor,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ESTABELECIMENTOS MAIS QUENTES (ALTO SCORE NÃO CONTATADOS) */}
        <Card className="bg-card border-border shadow-elev">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Flame className="size-4 text-primary fill-primary" />
                Oportunidades Mais Quentes
              </CardTitle>
              <CardDescription className="text-xs">
                Estabelecimentos sem site com maior pontuação aguardando primeiro contato
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs gap-1">
              <Link to="/leads">
                Ver todos
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {leadsMaisQuentes.map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-xl border border-border bg-surface/60 p-3.5 space-y-3 hover:border-primary/50 hover:bg-card transition-all flex flex-col justify-between shadow-sm"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider rotulo">
                        {lead.categoria}
                      </span>
                      <BadgePrioridade score={lead.score} />
                    </div>

                    <h4 className="font-semibold text-sm line-clamp-1 text-foreground">
                      {lead.nome}
                    </h4>

                    <p className="text-xs text-muted-foreground truncate dado">
                      📍 {lead.bairro || lead.cidade || "Localização não informada"}
                    </p>

                    {lead.avaliacao_google && (
                      <div className="flex items-center gap-1 text-xs text-amber-400 dado">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        <span>{lead.avaliacao_google.toFixed(1)}</span>
                        <span className="text-muted-foreground text-[11px]">
                          ({lead.total_avaliacoes} avaliações)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white h-7 text-xs gap-1.5 font-semibold"
                      onClick={() => {
                        setLeadParaWhatsApp(lead);
                        setModalWhatsAppAberto(true);
                      }}
                    >
                      <MessageSquare className="size-3" />
                      Abordar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="h-7 text-xs px-2.5 border-border/80 hover:border-primary/40"
                    >
                      <Link to="/leads/$id" params={{ id: lead.id }}>
                        Ver
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ÚLTIMOS ESTABELECIMENTOS CADASTRADOS */}
        <Card className="bg-card border-border shadow-elev">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Building2 className="size-4 text-primary" />
                Últimos Estabelecimentos Cadastrados
              </CardTitle>
              <CardDescription className="text-xs">
                Registro das últimas empresas importadas para o banco de dados
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs gap-1">
              <Link to="/leads">
                Ver base completa
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface/70 text-muted-foreground uppercase text-[10px] rotulo tracking-wider">
                    <th className="p-3 pl-4">Estabelecimento</th>
                    <th className="p-3">Categoria</th>
                    <th className="p-3">Localização</th>
                    <th className="p-3">Presença Web</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 pr-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leadsRecentes.map((item) => (
                    <tr key={item.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-3 pl-4 font-semibold text-foreground">
                        <Link
                          to="/leads/$id"
                          params={{ id: item.id }}
                          className="hover:text-primary transition-colors"
                        >
                          {item.nome}
                        </Link>
                      </td>
                      <td className="p-3 text-muted-foreground">{item.categoria}</td>
                      <td className="p-3 dado text-muted-foreground">
                        {item.bairro || item.cidade || "—"}
                      </td>
                      <td className="p-3">
                        <div className="space-y-0.5">
                          {!item.tem_site ? (
                            <span className="inline-flex items-center gap-1 rounded bg-purple-500/15 px-2 py-0.5 text-[10px] font-semibold text-purple-300 border border-purple-500/30">
                              <AlertCircle className="size-2.5" /> Sem site
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                              <Globe className="size-2.5" /> Com site
                            </span>
                          )}

                          {item.instagram && (
                            <p className="text-[10px] text-pink-400 font-mono flex items-center gap-0.5">
                              <Instagram className="size-2.5" /> @{item.instagram}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <BadgePrioridade score={item.score} />
                      </td>
                      <td className="p-3">
                        <BadgeStatus status={item.status} />
                      </td>
                      <td className="p-3 pr-4 text-right">
                        <Button
                          size="sm"
                          onClick={() => {
                            setLeadParaWhatsApp(item);
                            setModalWhatsAppAberto(true);
                          }}
                          className="h-7 px-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] gap-1 font-semibold"
                        >
                          <MessageSquare className="size-3" />
                          WhatsApp
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <ModalMensagemWhatsApp
        lead={leadParaWhatsApp}
        aberto={modalWhatsAppAberto}
        onOpenChange={setModalWhatsAppAberto}
        onMensagemEnviada={carregarDados}
      />
    </AppShell>
  );
}
