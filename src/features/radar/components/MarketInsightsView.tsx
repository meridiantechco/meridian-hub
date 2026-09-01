import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Sparkles,
  TrendingUp,
  Target,
  BarChart3,
  Lightbulb,
  CheckCircle2,
  PieChart,
} from "lucide-react";

export function MarketInsightsView() {
  const benchmarks = [
    {
      nicho: "Barbearias & Salões de Beleza",
      taxaConversao: "42%",
      ticketMedio: "R$ 1.800",
      tempoFechamento: "4 dias",
      argumentoPrincipal: "Agendamento online e cardápio de serviços direto pelo WhatsApp.",
    },
    {
      nicho: "Restaurantes & Gastronomia",
      taxaConversao: "38%",
      ticketMedio: "R$ 2.500",
      tempoFechamento: "6 dias",
      argumentoPrincipal: "Cardápio digital próprio sem pagar taxas abusivas de marketplaces.",
    },
    {
      nicho: "Clínicas Médicas & Odontológicas",
      taxaConversao: "34%",
      ticketMedio: "R$ 3.500",
      tempoFechamento: "9 dias",
      argumentoPrincipal: "Posicionamento no topo do Google para buscas de especialidades e convênios.",
    },
    {
      nicho: "Petshops & Veterinárias",
      taxaConversao: "31%",
      ticketMedio: "R$ 2.000",
      tempoFechamento: "5 dias",
      argumentoPrincipal: "Integração de agendamento de banho e tosa e catálogo de produtos.",
    },
  ];

  return (
    <AppShell
      titulo="Insights Estratégicos & Benchmarks"
      descricao="Análise comparativa de nichos, taxas de conversão históricas e argumentos de alta tração"
    >
      <div className="space-y-6 max-w-5xl">
        {/* CARDS DE DESTAQUE */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-card border-border/80 shadow-elev p-4 space-y-1">
            <span className="rotulo text-[10px] text-muted-foreground">Maior Taxa de Fechamento</span>
            <p className="text-xl font-bold font-display text-emerald-400">
              Barbearias & Beleza (42%)
            </p>
            <p className="text-[11px] text-muted-foreground">Ciclo rápido de decisão de 4 dias</p>
          </Card>

          <Card className="bg-card border-border/80 shadow-elev p-4 space-y-1">
            <span className="rotulo text-[10px] text-muted-foreground">Maior Ticket Médio</span>
            <p className="text-xl font-bold font-display text-primary">
              Clínicas & Saúde (R$ 3.500)
            </p>
            <p className="text-[11px] text-muted-foreground">Projetos com páginas de especialidades</p>
          </Card>

          <Card className="bg-card border-border/80 shadow-elev p-4 space-y-1">
            <span className="rotulo text-[10px] text-muted-foreground">Canal de Maior Resposta</span>
            <p className="text-xl font-bold font-display text-amber-400">
              WhatsApp Direto (68%)
            </p>
            <p className="text-[11px] text-muted-foreground">Abordagem com foto do mockup</p>
          </Card>
        </div>

        {/* TABELA DE BENCHMARKS */}
        <Card className="bg-card border-border/80 shadow-elev overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/60 bg-surface/30">
            <CardTitle className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="size-4 text-primary" />
              Benchmarks por Nicho B2B Mapeado
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Métricas consolidadas de mercado para orientar a equipe comercial
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface/70 text-muted-foreground uppercase text-[10px] rotulo tracking-wider">
                    <th className="p-3 pl-4">Segmento de Mercado</th>
                    <th className="p-3">Taxa de Conversão</th>
                    <th className="p-3">Ticket Médio</th>
                    <th className="p-3">Tempo Médio</th>
                    <th className="p-3 pr-4">Argumento de Maior Conversão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {benchmarks.map((b, i) => (
                    <tr key={i} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-3 pl-4 font-semibold text-foreground">{b.nicho}</td>
                      <td className="p-3 font-bold font-display text-emerald-400 dado">
                        {b.taxaConversao}
                      </td>
                      <td className="p-3 font-bold text-foreground dado">{b.ticketMedio}</td>
                      <td className="p-3 text-muted-foreground dado">{b.tempoFechamento}</td>
                      <td className="p-3 pr-4 text-xs text-muted-foreground leading-relaxed">
                        {b.argumentoPrincipal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* DIRETRIZES PRÁTICAS */}
        <Card className="bg-card border-border/80 shadow-elev p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-4 text-amber-400" />
            <h4 className="text-sm font-bold text-foreground">Diretrizes Práticas para a Prospecção</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-surface/40 border border-border/60 space-y-1">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-primary" />
                1. Priorize leads sem site e com nota &ge; 4.2 no Google
              </span>
              <p className="text-[11px] text-muted-foreground leading-relaxed pl-5">
                Empresas com boa reputação já possuem demanda e faturamento, necessitando apenas da ferramenta digital de captação.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface/40 border border-border/60 space-y-1">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-primary" />
                2. Envie mensagem personalizada em até 24h
              </span>
              <p className="text-[11px] text-muted-foreground leading-relaxed pl-5">
                A taxa de resposta diminui em 60% após o 3º dia de mineração se nenhum contato for realizado.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
