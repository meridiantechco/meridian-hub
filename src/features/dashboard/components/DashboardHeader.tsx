import { Link } from "@tanstack/react-router";
import { Sparkles, RefreshCw, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";

interface DashboardHeaderProps {
  carregando: boolean;
  onAtualizar: () => void;
  totalLeads: number;
  fechados: number;
}

export function DashboardHeader({
  carregando,
  onAtualizar,
  totalLeads,
  fechados,
}: DashboardHeaderProps) {
  const { nome, user } = useAuth();
  const primeiroNome = (nome || user?.email || "Operador").split(" ")[0];

  const dataAtual = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  const dataFormatada = dataAtual.charAt(0).toUpperCase() + dataAtual.slice(1);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/40">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground tracking-tight">
            Olá, {primeiroNome}
          </h2>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-primary/10 border border-primary/25 text-primary">
            <TrendingUp className="size-3" /> Operação Comercial
          </span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Visão consolidada de inteligência comercial, detecção de estabelecimentos e conversão de contratos.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        {/* Badge do Mês Atual */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface/60 border border-border/70 text-xs text-muted-foreground dado">
          <Calendar className="size-3.5 text-primary" />
          <span>{dataFormatada}</span>
        </div>

        {/* Botão Atualizar */}
        <Button
          variant="outline"
          size="sm"
          onClick={onAtualizar}
          disabled={carregando}
          className="h-8.5 px-3 gap-1.5 text-xs border-border/80 text-foreground hover:border-primary/40 transition-colors"
        >
          <RefreshCw className={`size-3.5 ${carregando ? "animate-spin text-primary" : ""}`} />
          <span className="hidden sm:inline">Atualizar</span>
        </Button>

        {/* Botão Nova Varredura */}
        <Button
          asChild
          size="sm"
          className="h-8.5 px-3.5 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm transition-all"
        >
          <Link to="/nova-busca">
            <Sparkles className="size-3.5" />
            <span>Detectar Empresas</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
