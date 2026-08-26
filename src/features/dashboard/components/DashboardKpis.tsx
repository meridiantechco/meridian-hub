import { Building2, Globe, Award, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
            <span>Empresas cadastradas no Meridian Hub</span>
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
            Oportunidades imediatas de abordagem comercial
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
            {scoreMedio} <span className="text-xs font-normal text-muted-foreground">/ 100</span>
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
  );
}
