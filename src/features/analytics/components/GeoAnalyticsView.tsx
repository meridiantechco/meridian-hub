import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, BarChart3, Users, FileSpreadsheet, Compass, ArrowRight } from "lucide-react";
import { analyticsService } from "../services/analyticsService";
import type { DesempenhoGeografico } from "../types";

export function GeoAnalyticsView() {
  const [geoData, setGeoData] = useState<DesempenhoGeografico[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    analyticsService.obterDesempenhoGeografico().then((res) => {
      setGeoData(res);
      setCarregando(false);
    });
  }, []);

  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <AppShell
      titulo="Performance Geográfica & Territorial"
      descricao="Análise de penetração comercial por município, polo empresarial e bairros mapeados"
      acoes={
        <Button asChild size="sm" className="h-8 text-xs bg-primary text-primary-foreground font-semibold gap-1.5 shadow-xs">
          <Link to="/map">
            <Compass className="size-3.5" />
            <span>Abrir Mapa Interativo</span>
          </Link>
        </Button>
      }
    >
      <div className="space-y-6 max-w-6xl">
        {/* SUBMENU DE ANALYTICS */}
        <div className="flex items-center gap-1.5 bg-surface/80 p-1 rounded-xl border border-border/70 overflow-x-auto">
          <Button
            size="sm"
            variant="ghost"
            asChild
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
          >
            <Link to="/analytics">
              <BarChart3 className="size-3.5 mr-1" />
              Overview
            </Link>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            asChild
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
          >
            <Link to="/analytics/team">
              <Users className="size-3.5 mr-1" />
              Performance da Equipe
            </Link>
          </Button>

          <Button
            size="sm"
            asChild
            className="h-7 text-xs bg-primary text-primary-foreground font-semibold"
          >
            <Link to="/analytics/geo">
              <MapPin className="size-3.5 mr-1" />
              Performance Geográfica
            </Link>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            asChild
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
          >
            <Link to="/reports">
              <FileSpreadsheet className="size-3.5 mr-1" />
              Relatórios & Exportação
            </Link>
          </Button>
        </div>

        {/* TABELA DE DESEMPENHO TERRITORIAL */}
        <Card className="bg-card border-border/80 shadow-elev overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/60 bg-surface/30">
            <CardTitle className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              Densidade & Oportunidades por Localidade
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Mapeamento de empresas ativas, score médio e potencial acumulado por território
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface/70 text-muted-foreground uppercase text-[10px] rotulo tracking-wider">
                    <th className="p-3 pl-4">Cidade / Região</th>
                    <th className="p-3">Bairro / Polo</th>
                    <th className="p-3">Total Mapeado</th>
                    <th className="p-3">Sem Site Próprio</th>
                    <th className="p-3">Score Médio</th>
                    <th className="p-3 pr-4 text-right">Potencial Estimado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {geoData.map((g, i) => (
                    <tr key={i} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-3 pl-4 font-bold text-foreground">{g.cidade}</td>
                      <td className="p-3 text-muted-foreground">{g.bairro}</td>
                      <td className="p-3 font-mono dado text-foreground">{g.totalLeads} contas</td>
                      <td className="p-3 font-mono dado text-emerald-400 font-bold">
                        {g.semSite} contas
                      </td>
                      <td className="p-3 font-bold font-display text-primary dado">
                        {g.scoreMedio} pts
                      </td>
                      <td className="p-3 pr-4 text-right font-bold font-display text-emerald-400 dado">
                        {formatarMoeda(g.potencialTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
