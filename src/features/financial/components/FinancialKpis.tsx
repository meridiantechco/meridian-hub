import {
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MetricasFinanceiras } from "../types";
import { cn } from "@/lib/utils";

interface FinancialKpisProps {
  metricas: MetricasFinanceiras;
}

export function FinancialKpis({ metricas }: FinancialKpisProps) {
  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* CARD 1: LUCRO LÍQUIDO */}
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
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span className="font-mono font-semibold text-foreground">
              {metricas.margemLucroPercentual}%
            </span>{" "}
            de margem líquida sobre vendas
          </div>
        </CardContent>
      </Card>

      {/* CARD 2: RECEITA BRUTA */}
      <Card className="bg-card border-border shadow-elev">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider rotulo">
            Receita Total (Contratos)
          </CardTitle>
          <div className="size-9 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <TrendingUp className="size-4.5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-display text-foreground dado">
            {formatarMoeda(metricas.receitaTotal)}
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <ArrowUpRight className="size-3" />
              {formatarMoeda(metricas.receitaRecebida)} recebido
            </span>
            {metricas.receitaPendente > 0 && (
              <span className="text-amber-400 font-medium">
                {formatarMoeda(metricas.receitaPendente)} a receber
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* CARD 3: DESPESAS TOTAIS */}
      <Card className="bg-card border-border shadow-elev">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider rotulo">
            Despesas & Custos Totais
          </CardTitle>
          <div className="size-9 rounded-xl bg-pink-500/15 text-pink-400 border border-pink-500/30 flex items-center justify-center">
            <TrendingDown className="size-4.5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-display text-foreground dado">
            {formatarMoeda(metricas.despesaTotal)}
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1 text-pink-400 font-medium">
              <ArrowDownRight className="size-3" />
              {formatarMoeda(metricas.despesaPaga)} pago
            </span>
            {metricas.despesaPendente > 0 && (
              <span className="text-amber-400 font-medium">
                {formatarMoeda(metricas.despesaPendente)} a pagar
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* CARD 4: RETORNO SOBRE INVESTIMENTO (ROI) */}
      <Card className="bg-card border-border shadow-elev">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider rotulo">
            ROI da Operação B2B
          </CardTitle>
          <div className="size-9 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Flame className="size-4.5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-display text-amber-400 dado">
            {metricas.roiMultiplicador}x
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
            <Sparkles className="size-3 text-primary shrink-0" />
            <span>Para cada R$ 1 gasto, voltam R$ {metricas.roiMultiplicador}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
