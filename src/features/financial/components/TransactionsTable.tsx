import {
  Receipt,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Building2,
  Trash2,
  Calendar,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CategoriaDespesa,
  CategoriaReceita,
  StatusTransacao,
  TransacaoFinanceira,
} from "../types";
import {
  ROTULOS_CATEGORIAS_DESPESA,
  ROTULOS_CATEGORIAS_RECEITA,
} from "../services/financialService";
import { cn } from "@/lib/utils";

interface TransactionsTableProps {
  transacoes: TransacaoFinanceira[];
  abaAtiva: "todas" | "despesas" | "receitas" | "pendentes";
  setAbaAtiva: (aba: "todas" | "despesas" | "receitas" | "pendentes") => void;
  busca: string;
  setBusca: (val: string) => void;
  filtroCategoria: string;
  setFiltroCategoria: (val: string) => void;
  onAlternarStatus: (tx: TransacaoFinanceira) => void;
  onSolicitarExclusao: (tx: TransacaoFinanceira) => void;
}

export function TransactionsTable({
  transacoes,
  abaAtiva,
  setAbaAtiva,
  busca,
  setBusca,
  filtroCategoria,
  setFiltroCategoria,
  onAlternarStatus,
  onSolicitarExclusao,
}: TransactionsTableProps) {
  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  return (
    <Card className="bg-card/85 backdrop-blur-sm border-border/70 shadow-elev overflow-hidden rounded-3xl">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60 bg-surface/30 p-4 sm:p-5">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Receipt className="size-4 text-primary" />
            Lançamentos Financeiros ({transacoes.length})
          </CardTitle>
          <CardDescription className="text-xs">
            Extrato detalhado de gastos operacionais e receitas comerciais privativas
          </CardDescription>
        </div>

        {/* ABAS & FILTROS PILL */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-secondary/80 backdrop-blur-sm p-1 rounded-2xl sm:rounded-full border border-border/80 flex-wrap">
            <button
              type="button"
              onClick={() => setAbaAtiva("todas")}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer",
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
                "px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer",
                abaAtiva === "despesas"
                  ? "bg-pink-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-pink-400",
              )}
            >
              Despesas
            </button>
            <button
              type="button"
              onClick={() => setAbaAtiva("receitas")}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer",
                abaAtiva === "receitas"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-emerald-400",
              )}
            >
              Receitas
            </button>
            <button
              type="button"
              onClick={() => setAbaAtiva("pendentes")}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer",
                abaAtiva === "pendentes"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-amber-400",
              )}
            >
              Pendentes
            </button>
          </div>
        </div>
      </CardHeader>

      {/* BARRA DE BUSCA E FILTROS */}
      <div className="p-3 sm:p-4 border-b border-border/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 bg-surface/20">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por descrição, empresa, API..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9 text-xs h-8.5 rounded-full bg-surface/60 border-border/70"
          />
        </div>

        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="text-xs h-8.5 rounded-full bg-surface/60 border-border/70">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl bg-card border-border">
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
          Mostrando <strong>{transacoes.length}</strong> lançamentos
        </div>
      </div>

      <CardContent className="p-0">
        {/* MOBILE VIEW (CARDS VERTICAIS SM:HIDDEN) */}
        <div className="block sm:hidden p-3 space-y-3">
          {transacoes.map((t) => {
            const isReceita = t.tipo === "receita";
            const infoDespesa = ROTULOS_CATEGORIAS_DESPESA[t.categoria as CategoriaDespesa];
            const infoReceita = ROTULOS_CATEGORIAS_RECEITA[t.categoria as CategoriaReceita];
            const nomeCategoria = isReceita
              ? infoReceita?.rotulo || t.categoria
              : infoDespesa?.rotulo || t.categoria;

            return (
              <div
                key={t.id}
                className={cn(
                  "p-4 rounded-2xl border transition-all bg-card/90 space-y-3 shadow-xs",
                  isReceita ? "border-emerald-500/25" : "border-pink-500/25",
                )}
              >
                {/* Header do Card Mobile: Badges de Tipo e Categoria + Data */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border",
                        isReceita
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : "bg-pink-500/15 text-pink-400 border-pink-500/30",
                      )}
                    >
                      {isReceita ? (
                        <ArrowUpRight className="size-3" />
                      ) : (
                        <ArrowDownRight className="size-3" />
                      )}
                      {isReceita ? "Receita" : "Despesa"}
                    </span>

                    <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary/80 border border-border/70 text-muted-foreground">
                      {nomeCategoria}
                    </span>
                  </div>

                  <span className="text-[10.5px] text-muted-foreground font-mono flex items-center gap-1">
                    <Calendar className="size-2.5" />
                    {t.data_competencia}
                  </span>
                </div>

                {/* Conteúdo Central: Título, Descrição e Cliente */}
                <div>
                  <h4 className="font-semibold text-foreground text-sm leading-tight">
                    {t.titulo}
                  </h4>
                  {t.descricao && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{t.descricao}</p>
                  )}
                  {t.lead_nome && (
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-primary font-medium">
                      <Building2 className="size-3 shrink-0" />
                      <span className="truncate">{t.lead_nome}</span>
                    </div>
                  )}
                </div>

                {/* Valor em Destaque Tipográfico */}
                <div className="flex items-baseline justify-between border-t border-border/60 pt-2.5">
                  <span className="text-xs text-muted-foreground">Valor</span>
                  <span
                    className={cn(
                      "font-bold font-display text-lg dado",
                      isReceita ? "text-emerald-400" : "text-pink-400",
                    )}
                  >
                    {isReceita ? "+" : "-"} {formatarMoeda(t.valor)}
                  </span>
                </div>

                {/* Ações Mobile: Alternar Status com toque amplo + Excluir */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                  <button
                    type="button"
                    onClick={() => onAlternarStatus(t)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer transition-all border",
                      t.status === "pago"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 active:bg-emerald-500/25"
                        : "bg-amber-500/15 text-amber-400 border-amber-500/30 active:bg-amber-500/25",
                    )}
                  >
                    {t.status === "pago" ? (
                      <>
                        <CheckCircle2 className="size-3.5" />
                        {isReceita ? "Recebido (Concluído)" : "Pago (Concluído)"}
                      </>
                    ) : (
                      <>
                        <Clock className="size-3.5" />
                        Pendente (Toque para dar baixa)
                      </>
                    )}
                  </button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onSolicitarExclusao(t)}
                    className="size-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                    title="Excluir lançamento"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}

          {transacoes.length === 0 && (
            <div className="p-8 text-center text-xs text-muted-foreground rounded-2xl bg-card/50 border border-border/60">
              Nenhum lançamento financeiro encontrado com os filtros aplicados.
            </div>
          )}
        </div>

        {/* DESKTOP VIEW (TABELA BENTO HIDDEN SM:BLOCK) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface/70 text-muted-foreground uppercase text-[10px] rotulo tracking-wider whitespace-nowrap">
                <th className="p-3.5 pl-5">Tipo & Título</th>
                <th className="p-3.5">Categoria</th>
                <th className="p-3.5">Data / Recorrência</th>
                <th className="p-3.5">Valor (R$)</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Cliente / Vinculação</th>
                <th className="p-3.5 pr-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {transacoes.map((t) => {
                const isReceita = t.tipo === "receita";
                const infoDespesa = ROTULOS_CATEGORIAS_DESPESA[t.categoria as CategoriaDespesa];
                const infoReceita = ROTULOS_CATEGORIAS_RECEITA[t.categoria as CategoriaReceita];
                const nomeCategoria = isReceita
                  ? infoReceita?.rotulo || t.categoria
                  : infoDespesa?.rotulo || t.categoria;

                return (
                  <tr key={t.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            "size-8 rounded-xl flex items-center justify-center shrink-0 border",
                            isReceita
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-pink-500/10 text-pink-400 border-pink-500/30",
                          )}
                        >
                          {isReceita ? (
                            <ArrowUpRight className="size-4" />
                          ) : (
                            <ArrowDownRight className="size-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm line-clamp-1">
                            {t.titulo}
                          </p>
                          {t.descricao && (
                            <p className="text-[10.5px] text-muted-foreground line-clamp-1">
                              {t.descricao}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full border",
                          isReceita
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-purple-500/10 text-purple-300 border-purple-500/20",
                        )}
                      >
                        {nomeCategoria}
                      </span>
                    </td>

                    <td className="p-3.5 dado text-muted-foreground">
                      <p>{t.data_competencia}</p>
                      <p className="text-[10px] text-muted-foreground/80 capitalize">
                        {t.recorrencia}
                      </p>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={cn(
                          "font-bold font-display text-sm dado",
                          isReceita ? "text-emerald-400" : "text-pink-400",
                        )}
                      >
                        {isReceita ? "+" : "-"} {formatarMoeda(t.valor)}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <button
                        type="button"
                        onClick={() => onAlternarStatus(t)}
                        className={cn(
                          "inline-flex items-center gap-1.5 text-[10.5px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-all border",
                          t.status === "pago"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                            : "bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25",
                        )}
                        title="Clique para alternar o status"
                      >
                        {t.status === "pago" ? (
                          <>
                            <CheckCircle2 className="size-3" />
                            {isReceita ? "Recebido" : "Pago"}
                          </>
                        ) : (
                          <>
                            <Clock className="size-3" />
                            Pendente
                          </>
                        )}
                      </button>
                    </td>

                    <td className="p-3.5 text-muted-foreground text-xs dado">
                      {t.lead_nome ? (
                        <span className="flex items-center gap-1 text-primary font-medium">
                          <Building2 className="size-3.5 shrink-0" />
                          <span className="truncate max-w-[150px]">{t.lead_nome}</span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="p-3.5 pr-5 text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onSolicitarExclusao(t)}
                        className="size-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Excluir lançamento"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}

              {transacoes.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-xs text-muted-foreground">
                    Nenhum lançamento financeiro encontrado com os filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
