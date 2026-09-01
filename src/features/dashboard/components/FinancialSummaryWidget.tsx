import { Link } from "@tanstack/react-router";
import { Wallet, ArrowRight, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MetricasFinanceiras } from "@/features/financial";

interface FinancialSummaryWidgetProps {
  metricas: MetricasFinanceiras | null;
}

export function FinancialSummaryWidget({ metricas }: FinancialSummaryWidgetProps) {
  if (!metricas) return null;

  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card to-card p-4 sm:p-5 shadow-elev flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
      <div className="space-y-1 max-w-xl">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
            <Wallet className="size-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-foreground font-display flex items-center gap-2">
            Gestão Financeira & Lucro Real
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-mono font-bold">
              Margem: {metricas.margemLucroPercentual}%
            </span>
          </h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed pl-10">
          Apuração consolidada de contratos fechados vs. despesas operacionais da empresa.
        </p>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-border/40">
        <div className="text-left sm:text-right">
          <p className="rotulo text-[9px]">Lucro Líquido</p>
          <p className="text-lg sm:text-xl font-bold font-display text-emerald-400 dado">
            {formatarMoeda(metricas.lucroLiquido)}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="rotulo text-[9px]">Gastos Totais</p>
          <p className="text-lg sm:text-xl font-bold font-display text-rose-400 dado">
            {formatarMoeda(metricas.despesaTotal)}
          </p>
        </div>

        <Button
          asChild
          size="sm"
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8.5 px-3.5 gap-1.5 font-semibold shrink-0 justify-center shadow-xs"
        >
          <Link to="/financeiro">
            <span>Acessar Financeiro</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
