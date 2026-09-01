import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  TrendingUp,
  Target,
  BarChart3,
  Users,
  MapPin,
  FileSpreadsheet,
  Coins,
  Clock,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { analyticsService } from "../services/analyticsService";
import type { MetricasGeraisAnalytics } from "../types";

export function AnalyticsOverviewView() {
  const [metricas, setMetricas] = useState<MetricasGeraisAnalytics | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const m = await analyticsService.obterMetricasGerais();
      setMetricas(m);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    void carregarDados();
  }, []);

  const dadosFunil = [
    { etapa: "1. Mapeados", total: metricas?.leadsGerados || 24, taxa: "100%" },
    { etapa: "2. Qualificados", total: metricas?.leadsQualificados || 16, taxa: "67%" },
    { etapa: "3. Contatados", total: 11, taxa: "45%" },
    { etapa: "4. Proposta", total: 6, taxa: "25%" },
    { etapa: "5. Fechados", total: 4, taxa: "16%" },
  ];

  const dadosEvolucaoMensal = [
    { mes: "Out", leads: 12, receita: 4500 },
    { mes: "Nov", leads: 18, receita: 6200 },
    { mes: "Dez", leads: 22, receita: 7800 },
    { mes: "Jan", leads: 31, receita: 9500 },
    { mes: "Fev", leads: 28, receita: 8800 },
    { mes: "Mar", leads: metricas?.leadsGerados || 34, receita: metricas?.receitaFechada || 11200 },
  ];

  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <AppShell
      titulo="Analytics & Inteligência de Performance"
      descricao="Visão consolidada de conversão comercial, ciclo médio de vendas, receita gerada e pipeline"
      acoes={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 text-xs border-border/80 gap-1.5"
          >
            <Link to="/reports">
              <FileSpreadsheet className="size-3.5" />
              <span>Gerador de Relatórios</span>
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={carregarDados}
            disabled={carregando}
            className="h-8 text-xs gap-1.5 border-border/80"
          >
            <RefreshCw className={`size-3.5 ${carregando ? "animate-spin text-primary" : ""}`} />
            <span>Atualizar</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-w-6xl">
        {/* SUBMENU DE ANALYTICS */}
        <div className="flex items-center gap-1.5 bg-surface/80 p-1 rounded-xl border border-border/70 overflow-x-auto">
          <Button
            size="sm"
            asChild
            className="h-7 text-xs bg-primary text-primary-foreground font-semibold"
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

        {/* 6 CARDS DE KPIS EXECUTIVOS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="bg-card border-border/80 shadow-elev p-3.5 space-y-1">
            <span className="rotulo text-[9.5px] text-muted-foreground block">Leads Gerados</span>
            <p className="text-2xl font-bold font-display dado text-foreground">
              {metricas?.leadsGerados ?? 0}
            </p>
            <p className="text-[10px] text-muted-foreground">Mapeamento total</p>
          </Card>

          <Card className="bg-card border-border/80 shadow-elev p-3.5 space-y-1">
            <span className="rotulo text-[9.5px] text-primary block font-bold">Qualificados</span>
            <p className="text-2xl font-bold font-display dado text-primary">
              {metricas?.leadsQualificados ?? 0}
            </p>
            <p className="text-[10px] text-muted-foreground">Score &ge; 60 pts</p>
          </Card>

          <Card className="bg-card border-emerald-500/30 shadow-elev p-3.5 space-y-1 ring-1 ring-emerald-500/20">
            <span className="rotulo text-[9.5px] text-emerald-400 block font-bold">Conversão Geral</span>
            <p className="text-2xl font-bold font-display dado text-emerald-400">
              {metricas?.taxaConversaoGeral ?? 0}%
            </p>
            <p className="text-[10px] text-muted-foreground">Lead para Fechamento</p>
          </Card>

          <Card className="bg-card border-border/80 shadow-elev p-3.5 space-y-1">
            <span className="rotulo text-[9.5px] text-muted-foreground block">Pipeline Ativo</span>
            <p className="text-xl font-bold font-display dado text-foreground">
              {formatarMoeda(metricas?.pipelineEstimado ?? 0)}
            </p>
            <p className="text-[10px] text-muted-foreground">Valor em negociação</p>
          </Card>

          <Card className="bg-card border-border/80 shadow-elev p-3.5 space-y-1">
            <span className="rotulo text-[9.5px] text-muted-foreground block">Ticket Médio</span>
            <p className="text-xl font-bold font-display dado text-foreground">
              {formatarMoeda(metricas?.ticketMedio ?? 2200)}
            </p>
            <p className="text-[10px] text-muted-foreground">Por implantação</p>
          </Card>

          <Card className="bg-card border-border/80 shadow-elev p-3.5 space-y-1">
            <span className="rotulo text-[9.5px] text-muted-foreground block">Ciclo Médio</span>
            <p className="text-2xl font-bold font-display dado text-foreground">
              {metricas?.tempoMedioFechamentoDias ?? 6} dias
            </p>
            <p className="text-[10px] text-muted-foreground">Do 1º contato ao sim</p>
          </Card>
        </div>

        {/* GRÁFICOS: EVOLUÇÃO DE RECEITA & FUNIL DE CONVERSÃO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* EVOLUÇÃO TEMPORAL */}
          <Card className="bg-card border-border/80 shadow-elev p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-foreground">Evolução Mensal de Receita (R$)</h4>
                <p className="text-xs text-muted-foreground">Faturamento bruto fechado nos últimos 6 meses</p>
              </div>
              <Coins className="size-4 text-emerald-400" />
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dadosEvolucaoMensal} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="mes" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181b", borderColor: "#3f3f46", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(val: any) => [formatarMoeda(Number(val)), "Receita"]}
                  />
                  <Area type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#gradReceita)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* FUNIL DE CONVERSÃO VISUAL */}
          <Card className="bg-card border-border/80 shadow-elev p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-foreground">Eficiência de Conversão do Funil</h4>
                <p className="text-xs text-muted-foreground">Gargalos e retenção entre cada etapa comercial</p>
              </div>
              <Target className="size-4 text-primary" />
            </div>

            <div className="space-y-3 pt-2">
              {dadosFunil.map((d, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{d.etapa}</span>
                    <span className="font-mono text-muted-foreground dado">
                      {d.total} contas ({d.taxa})
                    </span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: d.taxa }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
