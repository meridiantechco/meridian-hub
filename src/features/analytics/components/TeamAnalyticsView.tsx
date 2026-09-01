import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, BarChart3, MapPin, FileSpreadsheet, Trophy, TrendingUp } from "lucide-react";
import { analyticsService } from "../services/analyticsService";
import type { DesempenhoVendedor } from "../types";

export function TeamAnalyticsView() {
  const [equipe, setEquipe] = useState<DesempenhoVendedor[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    analyticsService.obterDesempenhoEquipe().then((res) => {
      setEquipe(res);
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
      titulo="Performance & Produtividade da Equipe"
      descricao="Acompanhamento individual de atividades, propostas, fechamentos e receita gerada por operador"
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
            asChild
            className="h-7 text-xs bg-primary text-primary-foreground font-semibold"
          >
            <Link to="/analytics/team">
              <Users className="size-3.5 mr-1" />
              Performance da Equipe
            </Link>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            asChild
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
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

        {/* TABELA DE DESEMPENHO DA EQUIPE */}
        <Card className="bg-card border-border/80 shadow-elev overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/60 bg-surface/30">
            <CardTitle className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
              <Trophy className="size-4 text-amber-400" />
              Produtividade Individual da Equipe Comercial
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Métricas auditadas de funil e fechamento por vendedor
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface/70 text-muted-foreground uppercase text-[10px] rotulo tracking-wider">
                    <th className="p-3 pl-4">Operador / Vendedor</th>
                    <th className="p-3">Função</th>
                    <th className="p-3">Leads Trabalhados</th>
                    <th className="p-3">Contatos Feitos</th>
                    <th className="p-3">Reuniões</th>
                    <th className="p-3">Propostas</th>
                    <th className="p-3">Fechamentos</th>
                    <th className="p-3">Taxa Conv.</th>
                    <th className="p-3 pr-4 text-right">Receita Gerada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {equipe.map((v) => (
                    <tr key={v.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-3 pl-4 font-bold text-foreground">{v.nome}</td>
                      <td className="p-3 text-muted-foreground text-xs">{v.papel}</td>
                      <td className="p-3 font-mono dado text-foreground">{v.leadsTrabalhados}</td>
                      <td className="p-3 font-mono dado text-foreground">{v.contatosFeitos}</td>
                      <td className="p-3 font-mono dado text-foreground">{v.reunioesRealizadas}</td>
                      <td className="p-3 font-mono dado text-foreground">{v.propostasEnviadas}</td>
                      <td className="p-3 font-bold font-display text-emerald-400 dado">
                        {v.fechamentos}
                      </td>
                      <td className="p-3 font-bold font-display text-primary dado">
                        {v.taxaConversao}%
                      </td>
                      <td className="p-3 pr-4 text-right font-bold font-display text-emerald-400 dado">
                        {formatarMoeda(v.receitaGerada)}
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
