import { Link } from "@tanstack/react-router";
import { ArrowRight, Kanban } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FunnelOverviewProps {
  dadosFunil: {
    name: string;
    quantidade: number;
    cor: string;
    status: string;
  }[];
  totalLeads: number;
}

export function FunnelOverview({ dadosFunil, totalLeads }: FunnelOverviewProps) {
  const fechados = dadosFunil.find((f) => f.status === "fechado")?.quantidade || 0;
  const taxaGeral = totalLeads > 0 ? ((fechados / totalLeads) * 100).toFixed(1) : "0.0";

  return (
    <Card className="bg-card border-border/80 shadow-elev flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
        <div>
          <CardTitle className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
            <Kanban className="size-4 text-primary" />
            Funil de Conversão
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Taxa de conversão: <strong className="text-emerald-400 dado">{taxaGeral}%</strong>
          </CardDescription>
        </div>

        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
        >
          <Link to="/funil">
            <span>Ver Kanban</span>
            <ArrowRight className="size-3" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <div className="space-y-3.5">
          {dadosFunil.map((etapa) => {
            const perc = totalLeads > 0 ? (etapa.quantidade / totalLeads) * 100 : 0;

            return (
              <div key={etapa.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="flex items-center gap-2 text-foreground">
                    <span
                      className="size-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: etapa.cor }}
                    />
                    <span>{etapa.name}</span>
                  </span>
                  <div className="flex items-center gap-2 text-muted-foreground dado">
                    <span className="font-semibold text-foreground">{etapa.quantidade}</span>
                    <span className="text-[11px] text-muted-foreground/80">({perc.toFixed(0)}%)</span>
                  </div>
                </div>

                <div className="h-2 w-full rounded-full bg-secondary/80 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.max(perc, 2)}%`,
                      backgroundColor: etapa.cor,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 rounded-xl bg-surface/50 border border-border/60 flex items-center justify-between text-xs">
          <div>
            <p className="rotulo text-[9px]">Resultado Final</p>
            <p className="font-semibold text-foreground text-xs mt-0.5">
              {fechados} contratos fechados com sucesso
            </p>
          </div>

          <Button
            size="sm"
            asChild
            className="h-7 px-2.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            <Link to="/funil">Gerenciar Pipeline</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
