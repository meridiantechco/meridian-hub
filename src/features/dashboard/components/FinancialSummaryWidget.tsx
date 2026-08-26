import { Link } from "@tanstack/react-router";
import { Wallet, ArrowRight } from "lucide-react";
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
    <div className="rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/15 via-card to-card p-5 shadow-elev flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Wallet className="size-5 text-primary" />
          <h3 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            Gestão Financeira & Apuração de Lucro
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-mono">
              Margem: {metricas.margemLucroPercentual}%
            </span>
          </h3>
        </div>
        <p className="text-xs text-muted-foreground max-w-2xl">
          Controle integral de despesas (Google Places API, Servidores, WhatsApp, Equipe, Impostos) vs. Contratos faturados da Meridian Tech.
        </p>
      </div>

      <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
        <div className="text-right">
          <p className="rotulo text-[10px]">Lucro Líquido Real</p>
          <p className="text-xl font-bold font-display text-emerald-400 dado">
            {formatarMoeda(metricas.lucroLiquido)}
          </p>
        </div>

        <div className="text-right">
          <p className="rotulo text-[10px]">Gastos Totais</p>
          <p className="text-xl font-bold font-display text-pink-400 dado">
            {formatarMoeda(metricas.despesaTotal)}
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
  );
}
