import { Building2, Globe2, Award, TrendingUp, ArrowUpRight, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardKpisProps {
  totalLeads: number;
  leadsSemSite: number;
  percSemSite: number;
  scoreMedio: number;
  taxaConversao: string;
  fechados: number;
}

export function DashboardKpis({
  totalLeads,
  leadsSemSite,
  percSemSite,
  scoreMedio,
  taxaConversao,
  fechados,
}: DashboardKpisProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: TOTAL DE LEADS */}
      <Card className="bg-card border-border/80 shadow-elev hover:border-primary/40 transition-all duration-200">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider rotulo">
              Leads Mapeados
            </span>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Building2 className="size-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div className="text-2xl lg:text-3xl font-bold font-display text-foreground dado">
              {totalLeads.toLocaleString("pt-BR")}
            </div>
            <span className="inline-flex items-center text-[11px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              <ArrowUpRight className="size-3 mr-0.5" /> +12.4%
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <span>Base ativa de inteligência</span>
            <span className="text-muted-foreground/50">·</span>
            <span className="text-foreground/80">vs. mês anterior</span>
          </p>
        </CardContent>
      </Card>

      {/* KPI 2: SEM SITE (OPORTUNIDADE IMEDIATA) */}
      <Card className="bg-card border-border/80 shadow-elev hover:border-primary/50 transition-all duration-200 ring-1 ring-primary/25">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider rotulo flex items-center gap-1">
              <Zap className="size-3 fill-current text-primary" /> Sem Site Próprio
            </span>
            <div className="size-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center shadow-xs">
              <Globe2 className="size-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div className="text-2xl lg:text-3xl font-bold font-display text-foreground dado">
              {leadsSemSite.toLocaleString("pt-BR")}
            </div>
            <span className="inline-flex items-center text-[11px] font-mono font-semibold text-primary bg-primary/15 px-2 py-0.5 rounded-full border border-primary/30">
              {percSemSite}% do total
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <span>Alvo prioritário para abordagem de presença digital</span>
          </p>
        </CardContent>
      </Card>

      {/* KPI 3: TAXA DE CONVERSÃO */}
      <Card className="bg-card border-border/80 shadow-elev hover:border-emerald-500/40 transition-all duration-200">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider rotulo">
              Taxa de Conversão
            </span>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="size-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div className="text-2xl lg:text-3xl font-bold font-display text-emerald-400 dado">
              {taxaConversao}%
            </div>
            <span className="inline-flex items-center text-[11px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              <ArrowUpRight className="size-3 mr-0.5" /> +2.1%
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <strong className="text-foreground font-mono">{fechados}</strong>
            <span>contratos fechados com sucesso</span>
          </p>
        </CardContent>
      </Card>

      {/* KPI 4: SCORE MÉDIO */}
      <Card className="bg-card border-border/80 shadow-elev hover:border-amber-500/40 transition-all duration-200">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider rotulo">
              Score Médio
            </span>
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Award className="size-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div className="text-2xl lg:text-3xl font-bold font-display text-amber-400 dado flex items-baseline gap-1">
              <span>{scoreMedio}</span>
              <span className="text-xs font-normal text-muted-foreground font-mono">/ 100</span>
            </div>
            <span className="inline-flex items-center text-[11px] font-mono font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              Alta Qualidade
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <span>Índice médio de propensão comercial</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
