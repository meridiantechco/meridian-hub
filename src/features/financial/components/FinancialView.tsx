import { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calendar,
  Download,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { leadsService, type LeadItem } from "@/features/leads";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { MetricCardsSkeleton, TableSkeleton } from "@/components/ui/skeletons";
import { useFinancial } from "../hooks/useFinancial";
import { FinancialKpis } from "./FinancialKpis";
import { FinancialCharts } from "./FinancialCharts";
import { TransactionsTable } from "./TransactionsTable";
import { ModalNovaDespesa, ModalNovaReceita } from "./TransactionModal";
import type { TransacaoFinanceira } from "../types";

export function FinancialView() {
  const {
    transacoes,
    transacoesFiltradas,
    metricas,
    filtroMes,
    setFiltroMes,
    filtroCategoria,
    setFiltroCategoria,
    buscaTermo,
    setBuscaTermo,
    criarTransacao,
    atualizarTransacao,
    excluirTransacao,
  } = useFinancial();

  const [abaAtiva, setAbaAtiva] = useState<"todas" | "despesas" | "receitas" | "pendentes">("todas");
  const [modalNovaDespesaAberto, setModalNovaDespesaAberto] = useState(false);
  const [modalNovaReceitaAberto, setModalNovaReceitaAberto] = useState(false);
  const [transacaoParaExcluir, setTransacaoParaExcluir] = useState<TransacaoFinanceira | null>(null);
  const [leadsDisponiveis, setLeadsDisponiveis] = useState<LeadItem[]>([]);

  useEffect(() => {
    void leadsService.listarLeads().then(setLeadsDisponiveis);
  }, []);

  const mesesDisponiveis = useMemo(() => {
    const set = new Set(transacoes.map((t) => t.data_competencia.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [transacoes]);

  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const alternarStatus = async (tx: TransacaoFinanceira) => {
    const novoStatus = tx.status === "pago" ? "pendente" : "pago";
    const dataPagamento = novoStatus === "pago" ? new Date().toISOString().slice(0, 10) : null;
    await atualizarTransacao(tx.id, {
      status: novoStatus,
      data_pagamento: dataPagamento,
    });
  };

  const confirmarExclusao = async () => {
    if (!transacaoParaExcluir) return;
    await excluirTransacao(transacaoParaExcluir.id, transacaoParaExcluir.titulo);
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
      `financeiro_meridian_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Relatório financeiro exportado com sucesso!");
  };

  return (
    <AppShell
      titulo="Financeiro"
      descricao="Gestão de despesas operacionais, receitas e fluxo de caixa da operação"
      acoes={
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8.5 px-2.5 gap-1.5 text-xs border-border/80 text-foreground"
              >
                <MoreHorizontal className="size-3.5" />
                <span className="hidden sm:inline">Opções</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card border-border shadow-elev">
              <DropdownMenuItem
                onClick={exportarCSV}
                className="text-xs cursor-pointer gap-2"
              >
                <Download className="size-3.5 text-primary" />
                Exportar CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setModalNovaDespesaAberto(true)}
            className="h-8.5 px-3 gap-1.5 text-xs border-pink-500/30 text-pink-400 hover:bg-pink-500/10 font-semibold"
          >
            <TrendingDown className="size-3.5" />
            <span>Novo Gasto</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setModalNovaReceitaAberto(true)}
            className="h-8.5 px-3 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
          >
            <TrendingUp className="size-3.5" />
            <span>Nova Receita</span>
          </Button>
        </div>
      }
    >
      {transacoes.length === 0 ? (
        <div className="space-y-6 max-w-7xl animate-fade-in">
          <MetricCardsSkeleton quantidade={4} colunas="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" />
          <TableSkeleton colunas={7} linhas={6} mostrarFiltros={true} />
        </div>
      ) : (
        <div className="space-y-6 max-w-7xl animate-fade-in">
          {/* BARRA DE SELEÇÃO DE PERÍODO */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-card border border-border shadow-elev">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="size-4 text-primary shrink-0" />
            <span className="text-xs font-semibold text-foreground whitespace-nowrap">Período:</span>
            <Select value={filtroMes} onValueChange={setFiltroMes}>
              <SelectTrigger className="w-full sm:w-44 h-8 text-xs bg-surface/50 border-border">
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

          <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400" />
              Receita: <strong className="text-foreground">{formatarMoeda(metricas.receitaTotal)}</strong>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-pink-400" />
              Gastos: <strong className="text-foreground">{formatarMoeda(metricas.despesaTotal)}</strong>
            </span>
          </div>
        </div>

        {/* CARDS PRINCIPAIS DE KPI & LUCRO */}
        <FinancialKpis metricas={metricas} />

        {/* GRÁFICOS */}
        <FinancialCharts metricas={metricas} />

        {/* TABELA DE LANÇAMENTOS */}
        <TransactionsTable
          transacoes={transacoesFiltradas}
          abaAtiva={abaAtiva}
          setAbaAtiva={setAbaAtiva}
          busca={buscaTermo}
          setBusca={setBuscaTermo}
          filtroCategoria={filtroCategoria}
          setFiltroCategoria={setFiltroCategoria}
          onAlternarStatus={alternarStatus}
          onSolicitarExclusao={(tx) => setTransacaoParaExcluir(tx)}
        />
      </div>
      )}

      {/* MODAL CRIAR DESPESA */}
      <ModalNovaDespesa
        aberto={modalNovaDespesaAberto}
        onOpenChange={setModalNovaDespesaAberto}
        onSalvar={async (dados) => {
          await criarTransacao({ ...dados, tipo: "despesa" });
        }}
      />

      {/* MODAL CRIAR RECEITA */}
      <ModalNovaReceita
        aberto={modalNovaReceitaAberto}
        onOpenChange={setModalNovaReceitaAberto}
        leadsDisponiveis={leadsDisponiveis}
        onSalvar={async (dados) => {
          await criarTransacao({ ...dados, tipo: "receita" });
        }}
      />

      {/* DIÁLOGO CONFIRMAÇÃO DE EXCLUSÃO */}
      <ConfirmDeleteDialog
        open={Boolean(transacaoParaExcluir)}
        onOpenChange={(aberto) => !aberto && setTransacaoParaExcluir(null)}
        titulo="Excluir Lançamento Financeiro?"
        descricao="Esta ação removerá permanentemente esta transação e recalculará as métricas financeiras."
        itemNome={transacaoParaExcluir ? `${transacaoParaExcluir.titulo} (${formatarMoeda(transacaoParaExcluir.valor)})` : undefined}
        onConfirmar={confirmarExclusao}
      />
    </AppShell>
  );
}
