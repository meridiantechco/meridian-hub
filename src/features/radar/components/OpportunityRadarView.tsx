import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Radar,
  Radio,
  Flame,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Building2,
  RefreshCw,
  Bell,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { radarService } from "../services/radarService";
import type { SinalMercado, MudancaDetectada } from "../types";
import { cn } from "@/lib/utils";

export function OpportunityRadarView() {
  const [sinais, setSinais] = useState<SinalMercado[]>([]);
  const [mudancas, setMudancas] = useState<MudancaDetectada[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const [s, m] = await Promise.all([
        radarService.obterSinaisRadar(),
        radarService.obterMudancasDetectadas(),
      ]);
      setSinais(s);
      setMudancas(m);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    void carregarDados();
  }, []);

  return (
    <AppShell
      titulo="Radar de Oportunidades de Mercado"
      descricao="Varredura algorítmica contínua de nichos de alta demanda, carência de presença digital e sinais de compra"
      acoes={
        <Button
          variant="outline"
          size="sm"
          onClick={carregarDados}
          disabled={carregando}
          className="h-8 text-xs gap-1.5 border-border/80"
        >
          <RefreshCw className={`size-3.5 ${carregando ? "animate-spin text-primary" : ""}`} />
          <span>Escanear Mercado</span>
        </Button>
      }
    >
      <div className="space-y-6 max-w-6xl">
        {/* GRID DE SINAIS DE MERCADO POR NICHO */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider rotulo">
            Nichos Comerciais em Destaque no Radar
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sinais.map((sinal) => (
              <Card
                key={sinal.id}
                className="bg-card border-border/80 p-4 space-y-3.5 shadow-elev hover:border-primary/50 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-muted-foreground rotulo uppercase font-bold">
                        {sinal.regiao}
                      </span>
                      <h4 className="font-bold text-sm text-foreground">{sinal.nicho}</h4>
                    </div>

                    <span
                      className={cn(
                        "text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded border",
                        sinal.statusOportunidade === "quente"
                          ? "bg-primary/15 text-primary border-primary/30"
                          : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
                      )}
                    >
                      {sinal.statusOportunidade === "quente" ? "🔥 Quente" : "📈 Em Alta"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-surface/50 border border-border/60 text-xs text-center dado">
                    <div>
                      <span className="text-[9.5px] text-muted-foreground block rotulo">Mapeados</span>
                      <strong className="text-foreground font-display text-xs">
                        {sinal.volumeContas}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-muted-foreground block rotulo">Sem Site</span>
                      <strong className="text-emerald-400 font-display text-xs">
                        {sinal.taxaSemSite}%
                      </strong>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-muted-foreground block rotulo">Score Médio</span>
                      <strong className="text-primary font-display text-xs">
                        {sinal.scoreMedio}
                      </strong>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed bg-surface/30 p-2.5 rounded-lg border border-border/40">
                    {sinal.recomendacao}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-semibold font-mono flex items-center gap-1">
                    <TrendingUp className="size-3" /> Demanda {sinal.variacaoDemanda}
                  </span>

                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10 gap-1 px-2.5"
                  >
                    <Link to="/nova-busca">
                      <span>Prospectar</span>
                      <ArrowRight className="size-3" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* FEED DE MUDANÇAS DETECTADAS */}
        <Card className="bg-card border-border/80 shadow-elev p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                <Bell className="size-3.5" />
              </div>
              <h4 className="text-sm font-bold text-foreground">
                Sinais Recentes de Detecção de Mudanças
              </h4>
            </div>
            <span className="text-xs text-muted-foreground dado font-mono">
              {mudancas.length} eventos monitorados
            </span>
          </div>

          <div className="space-y-2.5">
            {mudancas.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-surface/40 border border-border/60 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                    <span>{m.empresa_nome}</span>
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-5">
                    {m.descricao}
                  </p>
                </div>

                {m.empresa_id && (
                  <Link
                    to="/companies/$id"
                    params={{ id: m.empresa_id }}
                    className="text-primary hover:underline font-semibold shrink-0 text-xs inline-flex items-center gap-1"
                  >
                    <span>Ver Conta</span>
                    <ArrowRight className="size-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
