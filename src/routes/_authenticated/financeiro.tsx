import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/prospecta/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  financeiroService,
  ROTULOS_CATEGORIAS_DESPESA,
  ROTULOS_CATEGORIAS_RECEITA,
  type TransacaoFinanceira,
  type CategoriaDespesa,
  type CategoriaReceita,
  type TipoTransacao,
  type RecorrenciaTransacao,
  type StatusTransacao,
} from "@/lib/financeiro-service";
import { prospectaService } from "@/lib/prospecta-service";
import { auditoriaService } from "@/lib/auditoria-service";
import type { LeadItem } from "@/lib/leads-mock";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Receipt,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Trash2,
  Pencil,
  RotateCcw,
  Search,
  Building2,
  Cpu,
  Megaphone,
  Users,
  Package,
  Layers,
  Sparkles,
  PieChart as PieChartIcon,
  BarChart3,
  Flame,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/financeiro")({
  head: () => ({
    meta: [
      { title: "Gestão Financeira & Lucro — Prospecta" },
      {
        name: "description",
        content:
          "Controle completo de gastos, despesas operacionais, receitas e lucratividade líquida",
      },
    ],
  }),
  component: PaginaFinanceiro,
});

const CORES_DONUT: Record<string, string> = {
  tecnologia: "#a855f7", // Roxo neon
  marketing: "#ec4899", // Rosa vibrante
  equipe: "#3b82f6", // Azul
  operacional: "#f59e0b", // Âmbar
  impostos: "#f43f5e", // Rose / Vermelho
  outros: "#71717a", // Cinza zinc
};

export function PaginaFinanceiro() {
  const [transacoes, setTransacoes] = useState<TransacaoFinanceira[]>([]);
  const [leadsDisponiveis, setLeadsDisponiveis] = useState<LeadItem[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Filtros
  const [filtroMes, setFiltroMes] = useState<string>("todos");
  const [abaAtiva, setAbaAtiva] = useState<"todas" | "despesas" | "receitas" | "pendentes">(
    "todas",
  );
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");

  // Modais
  const [modalNovaDespesaAberto, setModalNovaDespesaAberto] = useState(false);
  const [modalNovaReceitaAberto, setModalNovaReceitaAberto] = useState(false);
  const [transacaoParaEditar, setTransacaoParaEditar] = useState<TransacaoFinanceira | null>(null);
  const [transacaoParaExcluir, setTransacaoParaExcluir] = useState<TransacaoFinanceira | null>(
    null,
  );
  const [modalRestaurarAberto, setModalRestaurarAberto] = useState(false);

  const carregarDados = async () => {
    setCarregando(true);
    const [listaTx, listaLeads] = await Promise.all([
      financeiroService.listarTransacoes(),
      prospectaService.listarLeads(),
    ]);
    setTransacoes(listaTx);
    setLeadsDisponiveis(listaLeads);
    setCarregando(false);
  };

  useEffect(() => {
    void carregarDados();
  }, []);

  // Meses únicos disponíveis para filtragem
  const mesesDisponiveis = useMemo(() => {
    const set = new Set(transacoes.map((t) => t.data_competencia.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [transacoes]);

  // Métricas Consolidadas do Período
  const metricas = useMemo(() => {
    return financeiroService.calcularMetricas(transacoes, filtroMes);
  }, [transacoes, filtroMes]);

  // Transações Filtradas para a Tabela
  const transacoesFiltradas = useMemo(() => {
    return transacoes.filter((t) => {
      // Filtro de mês
      if (filtroMes !== "todos" && !t.data_competencia.startsWith(filtroMes)) {
        return false;
      }

      // Filtro de Aba
      if (abaAtiva === "despesas" && t.tipo !== "despesa") return false;
      if (abaAtiva === "receitas" && t.tipo !== "receita") return false;
      if (abaAtiva === "pendentes" && t.status !== "pendente") return false;

      // Filtro de Categoria
      if (filtroCategoria !== "todas" && t.categoria !== filtroCategoria) return false;

      // Busca textual
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const matchTitulo = t.titulo.toLowerCase().includes(termo);
        const matchDesc = (t.descricao || "").toLowerCase().includes(termo);
        const matchLead = (t.lead_nome || "").toLowerCase().includes(termo);
        const matchCat = t.categoria.toLowerCase().includes(termo);
        if (!matchTitulo && !matchDesc && !matchLead && !matchCat) return false;
      }

      return true;
    });
  }, [transacoes, filtroMes, abaAtiva, filtroCategoria, busca]);

  // Dados para o gráfico de Donut de Gastos
  const dadosDonutGastos = useMemo(() => {
    return Object.entries(metricas.gastosPorCategoria)
      .filter(([_, valor]) => valor > 0)
      .map(([cat, valor]) => {
        const info = ROTULOS_CATEGORIAS_DESPESA[cat as CategoriaDespesa];
        return {
          name: info?.rotulo || cat,
          key: cat,
          value: Number(valor.toFixed(2)),
          color: CORES_DONUT[cat] || "#a855f7",
        };
      });
  }, [metricas.gastosPorCategoria]);

  // Formatação de Moeda BRL
  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  // Alternar status pago/pendente rápido
  const alternarStatusTransacao = async (tx: TransacaoFinanceira) => {
    const novoStatus: StatusTransacao = tx.status === "pago" ? "pendente" : "pago";
    const dataPagamento = novoStatus === "pago" ? new Date().toISOString().slice(0, 10) : null;

    const atualizado = await financeiroService.atualizarTransacao(tx.id, {
      status: novoStatus,
      data_pagamento: dataPagamento,
    });

    if (atualizado) {
      setTransacoes((prev) => prev.map((t) => (t.id === tx.id ? atualizado : t)));
      toast.success(
        `Status alterado para "${novoStatus === "pago" ? "Pago / Liquidado" : "Pendente"}"`,
      );
    }
  };

  const confirmarExclusao = async () => {
    if (!transacaoParaExcluir) return;
    await financeiroService.excluirTransacao(transacaoParaExcluir.id);
    setTransacoes((prev) => prev.filter((t) => t.id !== transacaoParaExcluir.id));

    await auditoriaService.registrarAtividade({
      tipo: "financeiro",
      titulo: `Lançamento excluído: ${transacaoParaExcluir.titulo}`,
      descricao: `Removido registro de ${transacaoParaExcluir.tipo} no valor de ${formatarMoeda(transacaoParaExcluir.valor)}.`,
      metadados: { transacao_id: transacaoParaExcluir.id, valor: transacaoParaExcluir.valor },
    });

    toast.success("Lançamento financeiro removido!");
    setTransacaoParaExcluir(null);
  };

  const exportarCSV = () => {
    const cabecalho =
      "Tipo,Título,Categoria,Valor,Data Competência,Data Pagamento,Recorrência,Status,Cliente/Lead\n";
    const linhas = transacoesFiltradas
      .map(
        (t) =>
          `"${t.tipo.toUpperCase()}","${t.titulo}","${t.categoria}",${t.valor},"${t.data_competencia}","${t.data_pagamento || ""}","${t.recorrencia}","${t.status}","${t.lead_nome || ""}"`,
      )
      .join("\n");

    const blob = new Blob([cabecalho + linhas], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `financeiro_prospecta_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Relatório financeiro exportado com sucesso!");
  };

  const restaurarDadosDemonstracao = async () => {
    await financeiroService.restaurarDadosExemplo();
    await carregarDados();
    setModalRestaurarAberto(false);
    toast.success("Dados de exemplo restaurados!");
  };

  return (
    <AppShell
      titulo="Financeiro & Lucratividade"
      descricao="Gestão completa de despesas operacionais (APIs, Marketing, Pessoal, Impostos), receitas de contratos e visão consolidada de lucro real"
      acoes={
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={exportarCSV}
            className="h-8 gap-1.5 text-xs border-border/80 text-foreground"
          >
            <Download className="size-3.5" />
            Exportar CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setModalNovaDespesaAberto(true)}
            className="h-8 gap-1.5 text-xs border-pink-500/30 text-pink-400 hover:bg-pink-500/10 font-semibold"
          >
            <TrendingDown className="size-3.5" />
            Novo Gasto / Despesa
          </Button>

          <Button
            size="sm"
            onClick={() => setModalNovaReceitaAberto(true)}
            className="h-8 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
          >
            <TrendingUp className="size-3.5" />
            Nova Receita / Fechamento
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-w-7xl">
        {/* BARRA DE SELEÇÃO DE PERÍODO */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-card border border-border shadow-elev">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Período de Apuração:</span>
            <Select value={filtroMes} onValueChange={setFiltroMes}>
              <SelectTrigger className="w-44 h-8 text-xs bg-surface/50 border-border">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todo o Histórico</SelectItem>
                {mesesDisponiveis.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400" />
              Receita:{" "}
              <strong className="text-foreground">{formatarMoeda(metricas.receitaTotal)}</strong>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-pink-400" />
              Gastos:{" "}
              <strong className="text-foreground">{formatarMoeda(metricas.despesaTotal)}</strong>
            </span>
          </div>
        </div>

        {/* CARDS PRINCIPAIS DE KPI & LUCRO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CARD 1: LUCRO LÍQUIDO (DESTAQUE MÁXIMO) */}
          <Card
            className={cn(
              "bg-card border shadow-elev relative overflow-hidden transition-all duration-200",
              metricas.lucroLiquido >= 0
                ? "border-primary/50 shadow-[0_0_25px_-5px_rgba(168,85,247,0.25)]"
                : "border-rose-500/50 shadow-[0_0_25px_-5px_rgba(244,63,94,0.25)]",
            )}
          >
            <div
              className={cn(
                "absolute -right-10 -top-10 size-32 rounded-full blur-2xl pointer-events-none",
                metricas.lucroLiquido >= 0 ? "bg-primary/20" : "bg-rose-500/20",
              )}
            />

            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider rotulo">
                Lucro Líquido Real
              </CardTitle>
              <div
                className={cn(
                  "size-9 rounded-xl border flex items-center justify-center shadow-sm",
                  metricas.lucroLiquido >= 0
                    ? "bg-primary/15 text-primary border-primary/30"
                    : "bg-rose-500/15 text-rose-400 border-rose-500/30",
                )}
              >
                <PiggyBank className="size-4.5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span
                  className={cn(
                    "text-2xl lg:text-3xl font-bold font-display dado",
                    metricas.lucroLiquido >= 0 ? "text-emerald-400" : "text-rose-400",
                  )}
                >
                  {formatarMoeda(metricas.lucroLiquido)}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 dado">
                  Margem: {metricas.margemLucroPercentual}%
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {metricas.lucroLiquido >= 0 ? "Operação Lucrativa" : "Atenção ao Caixa"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* CARD 2: FATURAMENTO / RECEITAS */}
          <Card className="bg-card border-border/80 shadow-elev hover:border-primary/40 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider rotulo">
                Receita Bruta Total
              </CardTitle>
              <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="size-4.5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl lg:text-3xl font-bold font-display text-emerald-400 dado">
                {formatarMoeda(metricas.receitaTotal)}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                <span>Recebido: {formatarMoeda(metricas.receitaRecebida)}</span>
                {metricas.receitaPendente > 0 && (
                  <span className="text-amber-400 font-medium">
                    +{formatarMoeda(metricas.receitaPendente)} pend.
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          {/* CARD 3: GASTOS & DESPESAS */}
          <Card className="bg-card border-border/80 shadow-elev hover:border-pink-500/40 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider rotulo">
                Gastos & Custos Totais
              </CardTitle>
              <div className="size-9 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center">
                <TrendingDown className="size-4.5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl lg:text-3xl font-bold font-display text-pink-400 dado">
                {formatarMoeda(metricas.despesaTotal)}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                <span>Pago: {formatarMoeda(metricas.despesaPaga)}</span>
                {metricas.despesaPendente > 0 && (
                  <span className="text-rose-400 font-medium">
                    {formatarMoeda(metricas.despesaPendente)} a pagar
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          {/* CARD 4: RETORNO SOBRE INVESTIMENTO (ROI) */}
          <Card className="bg-card border-border/80 shadow-elev hover:border-primary/40 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider rotulo">
                ROI / Retorno Operacional
              </CardTitle>
              <div className="size-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                <Flame className="size-4.5 fill-current" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl lg:text-3xl font-bold font-display text-primary dado">
                {metricas.roiMultiplicador}x
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Para cada R$ 1,00 gasto, retornam R$ {metricas.roiMultiplicador.toFixed(2)} em
                contratos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* SEÇÃO DE GRÁFICOS: EVOLUÇÃO MENSAL E COMPOSIÇÃO DE CUSTOS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* GRÁFICO 1: EVOLUÇÃO MENSAL DE FLUXO DE CAIXA (2 COLUNAS) */}
          <Card className="lg:col-span-2 bg-card border-border shadow-elev">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/60">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                  <BarChart3 className="size-4 text-primary" />
                  Evolução do Fluxo de Caixa & Lucratividade
                </CardTitle>
                <CardDescription className="text-xs">
                  Comparativo mensal entre Receitas, Gastos e Lucro Líquido apurado
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="h-[280px] w-full">
                {metricas.evolucaoMensal.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={metricas.evolucaoMensal}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="gradLucro" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#34d399" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2b2244" vertical={false} />
                      <XAxis
                        dataKey="mesRotulo"
                        stroke="#a19cb2"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: "#2b2244" }}
                      />
                      <YAxis
                        stroke="#a19cb2"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `R$${v}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#161224",
                          borderColor: "#3b2f5c",
                          borderRadius: "8px",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                        formatter={(val: any) => [formatarMoeda(Number(val)), ""]}
                      />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        formatter={(value) => (
                          <span className="text-xs text-muted-foreground capitalize">{value}</span>
                        )}
                      />
                      <Area
                        type="monotone"
                        dataKey="receita"
                        name="Receita Bruta"
                        stroke="#a855f7"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#gradReceita)"
                      />
                      <Area
                        type="monotone"
                        dataKey="despesa"
                        name="Despesas & Gastos"
                        stroke="#f43f5e"
                        strokeWidth={2}
                        fill="#f43f5e"
                        fillOpacity={0.1}
                      />
                      <Area
                        type="monotone"
                        dataKey="lucro"
                        name="Lucro Líquido"
                        stroke="#34d399"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#gradLucro)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                    Nenhum lançamento no período para gerar o gráfico.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* GRÁFICO 2: COMPOSIÇÃO DOS GASTOS POR CATEGORIA */}
          <Card className="bg-card border-border shadow-elev">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/60">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                  <PieChartIcon className="size-4 text-pink-400" />
                  Onde Estamos Gastando?
                </CardTitle>
                <CardDescription className="text-xs">
                  Distribuição percentual dos custos operacionais
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[210px] w-full">
                {dadosDonutGastos.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dadosDonutGastos}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={78}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {dadosDonutGastos.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#161224",
                          borderColor: "#3b2f5c",
                          borderRadius: "8px",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                        formatter={(val: any) => [formatarMoeda(Number(val)), ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                    Sem despesas cadastradas no período.
                  </div>
                )}
              </div>

              {/* Legenda Resumida */}
              <div className="space-y-1.5 pt-2 border-t border-border/60">
                {dadosDonutGastos.map((item) => (
                  <div key={item.key} className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-muted-foreground truncate">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate">{item.name}</span>
                    </span>
                    <span className="font-semibold text-foreground dado">
                      {formatarMoeda(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* TABELA DE GESTÃO DE LANÇAMENTOS COM FILTROS */}
        <Card className="bg-card border-border shadow-elev overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border bg-surface/30">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Receipt className="size-4 text-primary" />
                Lançamentos Financeiros ({transacoesFiltradas.length})
              </CardTitle>
              <CardDescription className="text-xs">
                Extrato detalhado de gastos operacionais e receitas comerciais
              </CardDescription>
            </div>

            {/* ABAS & FILTROS */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Seletor de Aba */}
              <div className="flex items-center gap-1 bg-secondary/80 p-0.5 rounded-lg border border-border/80">
                <button
                  type="button"
                  onClick={() => setAbaAtiva("todas")}
                  className={cn(
                    "px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer",
                    abaAtiva === "todas"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Todas
                </button>
                <button
                  type="button"
                  onClick={() => setAbaAtiva("despesas")}
                  className={cn(
                    "px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer",
                    abaAtiva === "despesas"
                      ? "bg-pink-600 text-white shadow-xs"
                      : "text-muted-foreground hover:text-pink-400",
                  )}
                >
                  Gastos / Despesas
                </button>
                <button
                  type="button"
                  onClick={() => setAbaAtiva("receitas")}
                  className={cn(
                    "px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer",
                    abaAtiva === "receitas"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-muted-foreground hover:text-emerald-400",
                  )}
                >
                  Receitas / Vendas
                </button>
                <button
                  type="button"
                  onClick={() => setAbaAtiva("pendentes")}
                  className={cn(
                    "px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer",
                    abaAtiva === "pendentes"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-muted-foreground hover:text-amber-400",
                  )}
                >
                  Pendentes
                </button>
              </div>

              {/* Reset de Dados */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setModalRestaurarAberto(true)}
                className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1"
                title="Restaurar dados de exemplo"
              >
                <RotateCcw className="size-3" />
                Restaurar Demo
              </Button>
            </div>
          </CardHeader>

          {/* BARRA DE BUSCA E FILTROS */}
          <div className="p-3 border-b border-border/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-surface/20">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar por descrição, empresa, API..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-8 text-xs h-8 bg-surface/50"
              />
            </div>

            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="text-xs h-8 bg-surface/50">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as categorias</SelectItem>
                <SelectItem value="tecnologia">🔌 Tecnologia & APIs</SelectItem>
                <SelectItem value="marketing">📢 Marketing & Vendas</SelectItem>
                <SelectItem value="equipe">👥 Equipe & Pessoal</SelectItem>
                <SelectItem value="operacional">🏢 Custos Operacionais</SelectItem>
                <SelectItem value="impostos">⚖️ Impostos & Tributos</SelectItem>
                <SelectItem value="venda_site">💻 Desenvolvimento de Sites</SelectItem>
                <SelectItem value="mensalidade">🔄 Mensalidades (MRR)</SelectItem>
                <SelectItem value="consultoria">🔍 Consultoria Google</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-xs text-muted-foreground flex items-center justify-end dado">
              Mostrando <strong>{transacoesFiltradas.length}</strong> lançamentos
            </div>
          </div>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface/70 text-muted-foreground uppercase text-[10px] rotulo tracking-wider">
                    <th className="p-3 pl-4">Tipo & Título</th>
                    <th className="p-3">Categoria</th>
                    <th className="p-3">Data / Recorrência</th>
                    <th className="p-3">Valor (R$)</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Cliente / Vinculação</th>
                    <th className="p-3 pr-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transacoesFiltradas.map((t) => {
                    const isReceita = t.tipo === "receita";
                    const infoDespesa = ROTULOS_CATEGORIAS_DESPESA[t.categoria as CategoriaDespesa];
                    const infoReceita = ROTULOS_CATEGORIAS_RECEITA[t.categoria as CategoriaReceita];
                    const nomeCategoria = isReceita
                      ? infoReceita?.rotulo || t.categoria
                      : infoDespesa?.rotulo || t.categoria;

                    return (
                      <tr key={t.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="p-3 pl-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={cn(
                                "size-7 rounded-lg flex items-center justify-center shrink-0 border",
                                isReceita
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                  : "bg-pink-500/10 text-pink-400 border-pink-500/30",
                              )}
                            >
                              {isReceita ? (
                                <ArrowUpRight className="size-3.5" />
                              ) : (
                                <ArrowDownRight className="size-3.5" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground text-sm line-clamp-1">
                                {t.titulo}
                              </p>
                              {t.descricao && (
                                <p className="text-[10px] text-muted-foreground line-clamp-1">
                                  {t.descricao}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                              isReceita
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-purple-500/10 text-purple-300 border-purple-500/20",
                            )}
                          >
                            {nomeCategoria}
                          </span>
                        </td>

                        <td className="p-3 dado text-muted-foreground">
                          <p>{t.data_competencia}</p>
                          <p className="text-[10px] text-muted-foreground/80 capitalize">
                            {t.recorrencia}
                          </p>
                        </td>

                        <td className="p-3">
                          <span
                            className={cn(
                              "font-bold font-display text-sm dado",
                              isReceita ? "text-emerald-400" : "text-pink-400",
                            )}
                          >
                            {isReceita ? "+" : "-"} {formatarMoeda(t.valor)}
                          </span>
                        </td>

                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => alternarStatusTransacao(t)}
                            className={cn(
                              "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-all border",
                              t.status === "pago"
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                                : "bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25",
                            )}
                            title="Clique para alternar o status"
                          >
                            {t.status === "pago" ? (
                              <>
                                <CheckCircle2 className="size-2.5" />
                                {isReceita ? "Recebido" : "Pago"}
                              </>
                            ) : (
                              <>
                                <Clock className="size-2.5" />
                                Pendente
                              </>
                            )}
                          </button>
                        </td>

                        <td className="p-3 text-muted-foreground text-[11px] dado">
                          {t.lead_nome ? (
                            <span className="flex items-center gap-1 text-primary">
                              <Building2 className="size-3" />
                              {t.lead_nome}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="p-3 pr-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setTransacaoParaEditar(t)}
                              className="size-7 p-0 text-muted-foreground hover:text-foreground"
                              title="Editar"
                            >
                              <Pencil className="size-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setTransacaoParaExcluir(t)}
                              className="size-7 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                              title="Excluir"
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {transacoesFiltradas.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-xs text-muted-foreground">
                        Nenhum lançamento financeiro encontrado com os filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MODAL CRIAR DESPESA / GASTO */}
      <ModalNovaDespesa
        aberto={modalNovaDespesaAberto}
        onOpenChange={setModalNovaDespesaAberto}
        onSalvar={async (dados) => {
          const nova = await financeiroService.criarTransacao({
            ...dados,
            tipo: "despesa",
          });
          setTransacoes((prev) => [nova, ...prev]);
          await auditoriaService.registrarAtividade({
            tipo: "financeiro",
            titulo: `Nova despesa: ${nova.titulo}`,
            descricao: `Registrado gasto de ${formatarMoeda(nova.valor)} na categoria ${nova.categoria}.`,
            metadados: { valor: nova.valor, categoria: nova.categoria },
          });
          toast.success("Despesa cadastrada com sucesso!");
        }}
      />

      {/* MODAL CRIAR RECEITA / FECHAMENTO */}
      <ModalNovaReceita
        aberto={modalNovaReceitaAberto}
        onOpenChange={setModalNovaReceitaAberto}
        leadsDisponiveis={leadsDisponiveis}
        onSalvar={async (dados) => {
          const nova = await financeiroService.criarTransacao({
            ...dados,
            tipo: "receita",
          });
          setTransacoes((prev) => [nova, ...prev]);
          await auditoriaService.registrarAtividade({
            tipo: "financeiro",
            titulo: `Receita registrada: ${nova.titulo}`,
            descricao: `Entrada de ${formatarMoeda(nova.valor)} (${nova.categoria}).`,
            metadados: { valor: nova.valor, categoria: nova.categoria, lead_nome: nova.lead_nome },
          });
          toast.success("Receita cadastrada com sucesso!");
        }}
      />

      {/* MODAL EDITAR LANÇAMENTO */}
      {transacaoParaEditar && (
        <ModalEditarTransacao
          transacao={transacaoParaEditar}
          aberto={Boolean(transacaoParaEditar)}
          onOpenChange={(aberto) => !aberto && setTransacaoParaEditar(null)}
          onSalvar={async (id, dados) => {
            const atualizado = await financeiroService.atualizarTransacao(id, dados);
            if (atualizado) {
              setTransacoes((prev) => prev.map((t) => (t.id === id ? atualizado : t)));
              toast.success("Lançamento atualizado!");
            }
          }}
        />
      )}

      {/* DIÁLOGO CONFIRMAÇÃO DE EXCLUSÃO */}
      <AlertDialog
        open={Boolean(transacaoParaExcluir)}
        onOpenChange={(aberto) => !aberto && setTransacaoParaExcluir(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-400 flex items-center gap-2">
              <AlertTriangle className="size-5" />
              Excluir Lançamento Financeiro?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Você está prestes a remover o registro de{" "}
              <strong className="text-foreground">{transacaoParaExcluir?.titulo}</strong> no valor
              de{" "}
              <strong className="text-foreground">
                {transacaoParaExcluir ? formatarMoeda(transacaoParaExcluir.valor) : ""}
              </strong>
              . Esta ação recalculará as métricas de lucro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarExclusao}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs"
            >
              Sim, Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DIÁLOGO RESTAURAR DADOS DE EXEMPLO */}
      <AlertDialog open={modalRestaurarAberto} onOpenChange={setModalRestaurarAberto}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground flex items-center gap-2">
              <RotateCcw className="size-5 text-primary" />
              Restaurar Dados de Exemplo?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Esta ação redefinirá as transações financeiras para os dados padrão de demonstração
              (contendo despesas com Google Places API, WhatsApp, Servidores e Contratos fechados).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={restaurarDadosDemonstracao}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
            >
              Restaurar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

// ---------------------------------------------------------------------------
// MODAL: CADASTRAR DESPESA / GASTO
// ---------------------------------------------------------------------------
function ModalNovaDespesa({
  aberto,
  onOpenChange,
  onSalvar,
}: {
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  onSalvar: (dados: Omit<TransacaoFinanceira, "id" | "tipo" | "criado_em">) => Promise<void>;
}) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState<CategoriaDespesa>("tecnologia");
  const [valor, setValor] = useState("");
  const [dataCompetencia, setDataCompetencia] = useState(new Date().toISOString().slice(0, 10));
  const [recorrencia, setRecorrencia] = useState<RecorrenciaTransacao>("mensal");
  const [status, setStatus] = useState<StatusTransacao>("pago");
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numValor = parseFloat(valor.replace(",", "."));
    if (isNaN(numValor) || numValor <= 0) {
      toast.error("Informe um valor válido em reais.");
      return;
    }
    if (!titulo.trim()) {
      toast.error("Informe o título do gasto.");
      return;
    }

    setSalvando(true);
    try {
      await onSalvar({
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        categoria,
        valor: numValor,
        data_competencia: dataCompetencia,
        data_pagamento: status === "pago" ? dataCompetencia : null,
        recorrencia,
        status,
      });
      // Limpar form
      setTitulo("");
      setDescricao("");
      setValor("");
      onOpenChange(false);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base flex items-center gap-2">
            <TrendingDown className="size-4 text-pink-400" />
            Cadastrar Novo Gasto / Despesa
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Registre custos operacionais, APIs, infraestrutura ou despesas da sua agência
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Título */}
          <div className="space-y-1.5">
            <Label htmlFor="desp-titulo" className="text-xs font-semibold text-foreground">
              Descrição do Gasto *
            </Label>
            <Input
              id="desp-titulo"
              placeholder="Ex: Google Places API, WhatsApp Disparador, Aluguel..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              className="text-xs h-9 bg-surface/50"
            />
          </div>

          {/* Categoria & Valor */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="desp-cat" className="text-xs font-semibold text-foreground">
                Categoria *
              </Label>
              <Select
                value={categoria}
                onValueChange={(val) => setCategoria(val as CategoriaDespesa)}
              >
                <SelectTrigger id="desp-cat" className="text-xs h-9 bg-surface/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tecnologia">🔌 Tecnologia & APIs</SelectItem>
                  <SelectItem value="marketing">📢 Marketing & Vendas</SelectItem>
                  <SelectItem value="equipe">👥 Equipe & Pessoal</SelectItem>
                  <SelectItem value="operacional">🏢 Custos Operacionais</SelectItem>
                  <SelectItem value="impostos">⚖️ Impostos & Taxas</SelectItem>
                  <SelectItem value="outros">📦 Outros Gastos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desp-valor" className="text-xs font-semibold text-foreground">
                Valor (R$) *
              </Label>
              <Input
                id="desp-valor"
                placeholder="Ex: 250.00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required
                className="text-xs h-9 bg-surface/50 font-mono"
              />
            </div>
          </div>

          {/* Data & Recorrência */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="desp-data" className="text-xs font-semibold text-foreground">
                Data de Vencimento / Competência
              </Label>
              <Input
                id="desp-data"
                type="date"
                value={dataCompetencia}
                onChange={(e) => setDataCompetencia(e.target.value)}
                className="text-xs h-9 bg-surface/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desp-rec" className="text-xs font-semibold text-foreground">
                Recorrência
              </Label>
              <Select
                value={recorrencia}
                onValueChange={(val) => setRecorrencia(val as RecorrenciaTransacao)}
              >
                <SelectTrigger id="desp-rec" className="text-xs h-9 bg-surface/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pontual">Pontual / Avulso</SelectItem>
                  <SelectItem value="mensal">Mensal (Recorrente)</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label htmlFor="desp-status" className="text-xs font-semibold text-foreground">
              Situação do Pagamento
            </Label>
            <Select value={status} onValueChange={(val) => setStatus(val as StatusTransacao)}>
              <SelectTrigger id="desp-status" className="text-xs h-9 bg-surface/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pago">🟢 Pago / Liquidado</SelectItem>
                <SelectItem value="pendente">🟡 Pendente / A Pagar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2 border-t border-border flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={salvando}
              className="bg-pink-600 hover:bg-pink-500 text-white text-xs h-8 gap-1.5 font-semibold"
            >
              {salvando ? "Salvando..." : "Salvar Despesa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// MODAL: CADASTRAR RECEITA / CONTRATO
// ---------------------------------------------------------------------------
function ModalNovaReceita({
  aberto,
  onOpenChange,
  leadsDisponiveis,
  onSalvar,
}: {
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  leadsDisponiveis: LeadItem[];
  onSalvar: (dados: Omit<TransacaoFinanceira, "id" | "tipo" | "criado_em">) => Promise<void>;
}) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState<CategoriaReceita>("venda_site");
  const [valor, setValor] = useState("");
  const [leadSelecionadoId, setLeadSelecionadoId] = useState<string>("nenhum");
  const [leadNomeManual, setLeadNomeManual] = useState("");
  const [dataCompetencia, setDataCompetencia] = useState(new Date().toISOString().slice(0, 10));
  const [recorrencia, setRecorrencia] = useState<RecorrenciaTransacao>("pontual");
  const [status, setStatus] = useState<StatusTransacao>("pago");
  const [salvando, setSalvando] = useState(false);

  // Auto-preencher quando selecionar um lead da base
  const handleLeadChange = (val: string) => {
    setLeadSelecionadoId(val);
    if (val !== "nenhum") {
      const alvo = leadsDisponiveis.find((l) => l.id === val);
      if (alvo) {
        setLeadNomeManual(alvo.nome);
        if (!titulo) {
          setTitulo(`Contrato de Site — ${alvo.nome}`);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numValor = parseFloat(valor.replace(",", "."));
    if (isNaN(numValor) || numValor <= 0) {
      toast.error("Informe um valor válido em reais.");
      return;
    }
    if (!titulo.trim()) {
      toast.error("Informe o título do contrato / receita.");
      return;
    }

    setSalvando(true);
    try {
      await onSalvar({
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        categoria,
        valor: numValor,
        data_competencia: dataCompetencia,
        data_pagamento: status === "pago" ? dataCompetencia : null,
        recorrencia,
        status,
        lead_id: leadSelecionadoId !== "nenhum" ? leadSelecionadoId : null,
        lead_nome: leadNomeManual.trim() || null,
      });
      // Limpar form
      setTitulo("");
      setDescricao("");
      setValor("");
      setLeadSelecionadoId("nenhum");
      setLeadNomeManual("");
      onOpenChange(false);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base flex items-center gap-2">
            <TrendingUp className="size-4 text-emerald-400" />
            Cadastrar Nova Receita / Fechamento
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Lance contratos fechados, mensalidades ou serviços vendidos a estabelecimentos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Vincular a Estabelecimento */}
          <div className="space-y-1.5">
            <Label
              htmlFor="rec-lead"
              className="text-xs font-semibold text-foreground flex items-center justify-between"
            >
              <span>Estabelecimento / Cliente</span>
              <span className="text-[10px] text-muted-foreground font-normal">Opcional</span>
            </Label>
            <Select value={leadSelecionadoId} onValueChange={handleLeadChange}>
              <SelectTrigger id="rec-lead" className="text-xs h-9 bg-surface/50">
                <SelectValue placeholder="Selecione um lead da base..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhum">Nenhum (Cliente avulso)</SelectItem>
                {leadsDisponiveis.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.nome} ({l.categoria})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Título do Contrato */}
          <div className="space-y-1.5">
            <Label htmlFor="rec-titulo" className="text-xs font-semibold text-foreground">
              Título da Receita *
            </Label>
            <Input
              id="rec-titulo"
              placeholder="Ex: Criação de Website, Manutenção Mensal..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              className="text-xs h-9 bg-surface/50"
            />
          </div>

          {/* Categoria & Valor */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rec-cat" className="text-xs font-semibold text-foreground">
                Tipo de Serviço *
              </Label>
              <Select
                value={categoria}
                onValueChange={(val) => setCategoria(val as CategoriaReceita)}
              >
                <SelectTrigger id="rec-cat" className="text-xs h-9 bg-surface/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venda_site">💻 Criação de Site</SelectItem>
                  <SelectItem value="mensalidade">🔄 Mensalidade (MRR)</SelectItem>
                  <SelectItem value="consultoria">🔍 Consultoria Google</SelectItem>
                  <SelectItem value="gestao_trafego">📢 Gestão de Tráfego</SelectItem>
                  <SelectItem value="outra_receita">💵 Outra Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rec-valor" className="text-xs font-semibold text-foreground">
                Valor do Contrato (R$) *
              </Label>
              <Input
                id="rec-valor"
                placeholder="Ex: 2500.00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required
                className="text-xs h-9 bg-surface/50 font-mono"
              />
            </div>
          </div>

          {/* Data & Recorrência */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rec-data" className="text-xs font-semibold text-foreground">
                Data do Recebimento / Fechamento
              </Label>
              <Input
                id="rec-data"
                type="date"
                value={dataCompetencia}
                onChange={(e) => setDataCompetencia(e.target.value)}
                className="text-xs h-9 bg-surface/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rec-rec" className="text-xs font-semibold text-foreground">
                Modalidade
              </Label>
              <Select
                value={recorrencia}
                onValueChange={(val) => setRecorrencia(val as RecorrenciaTransacao)}
              >
                <SelectTrigger id="rec-rec" className="text-xs h-9 bg-surface/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pontual">Pagamento Único (Setup)</SelectItem>
                  <SelectItem value="mensal">Mensalidade Recorrente</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label htmlFor="rec-status" className="text-xs font-semibold text-foreground">
              Situação do Pagamento
            </Label>
            <Select value={status} onValueChange={(val) => setStatus(val as StatusTransacao)}>
              <SelectTrigger id="rec-status" className="text-xs h-9 bg-surface/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pago">🟢 Recebido / Liquidado</SelectItem>
                <SelectItem value="pendente">🟡 A Receber / Agendado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2 border-t border-border flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={salvando}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 gap-1.5 font-semibold"
            >
              {salvando ? "Salvando..." : "Salvar Receita"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// MODAL: EDITAR TRANSAÇÃO
// ---------------------------------------------------------------------------
function ModalEditarTransacao({
  transacao,
  aberto,
  onOpenChange,
  onSalvar,
}: {
  transacao: TransacaoFinanceira;
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  onSalvar: (
    id: string,
    dados: Partial<Omit<TransacaoFinanceira, "id" | "criado_em">>,
  ) => Promise<void>;
}) {
  const [titulo, setTitulo] = useState(transacao.titulo);
  const [descricao, setDescricao] = useState(transacao.descricao || "");
  const [valor, setValor] = useState(String(transacao.valor));
  const [dataCompetencia, setDataCompetencia] = useState(transacao.data_competencia);
  const [status, setStatus] = useState<StatusTransacao>(transacao.status);
  const [recorrencia, setRecorrencia] = useState<RecorrenciaTransacao>(transacao.recorrencia);
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numValor = parseFloat(valor.replace(",", "."));
    if (isNaN(numValor) || numValor <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }

    setSalvando(true);
    try {
      await onSalvar(transacao.id, {
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        valor: numValor,
        data_competencia: dataCompetencia,
        status,
        recorrencia,
      });
      onOpenChange(false);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base flex items-center gap-2">
            <Pencil className="size-4 text-primary" />
            Editar Lançamento Financeiro
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Título *</Label>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              className="text-xs h-9 bg-surface/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Valor (R$) *</Label>
            <Input
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
              className="text-xs h-9 bg-surface/50 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Data</Label>
              <Input
                type="date"
                value={dataCompetencia}
                onChange={(e) => setDataCompetencia(e.target.value)}
                className="text-xs h-9 bg-surface/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as StatusTransacao)}>
                <SelectTrigger className="text-xs h-9 bg-surface/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pago">Liquidado (Pago/Recebido)</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Descrição / Notas</Label>
            <Input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="text-xs h-9 bg-surface/50"
            />
          </div>

          <DialogFooter className="pt-2 border-t border-border flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={salvando}
              className="bg-primary text-primary-foreground text-xs h-8 font-semibold"
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
