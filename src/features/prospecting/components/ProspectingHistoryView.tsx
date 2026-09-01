import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { leadsService, type BuscaItem } from "@/features/leads";
import { prospectingService } from "../services/prospectingService";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { MetricCardsSkeleton, TableSkeleton } from "@/components/ui/skeletons";
import { Plus, History, Radar, Sparkles, ArrowRight, MapPin, Calendar, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function ProspectingHistoryView() {
  const navigate = useNavigate();
  const [buscas, setBuscas] = useState<BuscaItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [buscaParaExcluir, setBuscaParaExcluir] = useState<BuscaItem | null>(null);
  const [excluindoBusca, setExcluindoBusca] = useState(false);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const lista = await leadsService.listarBuscas();
      setBuscas(lista);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    void carregarDados();
  }, []);

  const totalVarreduras = buscas.length;
  const totalResultadosGeral = buscas.reduce((acc, b) => acc + b.total_resultados, 0);
  const totalSemSiteGeral = buscas.reduce((acc, b) => acc + b.total_sem_site, 0);

  const reexecutarBusca = (busca: BuscaItem) => {
    toast.info(`Preparando re-execução para ${busca.categoria || busca.termo_busca}...`);
    void navigate({ to: "/nova-busca" });
  };

  return (
    <AppShell
      titulo="Histórico de Varreduras"
      descricao="Registro consolidado das regiões, segmentos de mercado e oportunidades mapeadas"
      acoes={
        <Button
          asChild
          size="sm"
          className="h-8.5 px-3.5 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
        >
          <Link to="/nova-busca">
            <Plus className="size-3.5" />
            <span>Nova Varredura</span>
          </Link>
        </Button>
      }
    >
      {carregando && buscas.length === 0 ? (
        <div className="space-y-6 max-w-6xl animate-fade-in">
          <MetricCardsSkeleton quantidade={3} colunas="grid-cols-1 sm:grid-cols-3" />
          <TableSkeleton colunas={6} linhas={5} mostrarFiltros={false} />
        </div>
      ) : (
        <div className="space-y-6 max-w-6xl animate-fade-in">
          {/* KPI CARDS RESUMO DO HISTÓRICO */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-card border-border/80 shadow-elev p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider rotulo">
                Varreduras Executadas
              </span>
              <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <History className="size-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-display text-foreground dado">
              {totalVarreduras}
            </div>
            <p className="text-[11px] text-muted-foreground">Sessões de prospecção registradas</p>
          </Card>

          <Card className="bg-card border-border/80 shadow-elev p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider rotulo">
                Empresas Mineradas
              </span>
              <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Radar className="size-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-display text-emerald-400 dado">
              {totalResultadosGeral.toLocaleString("pt-BR")}
            </div>
            <p className="text-[11px] text-muted-foreground">Volume total de estabelecimentos encontrados</p>
          </Card>

          <Card className="bg-card border-border/80 shadow-elev p-4 space-y-2 ring-1 ring-primary/25">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider rotulo">
                Sem Site Identificadas
              </span>
              <div className="size-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                <Sparkles className="size-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-display text-primary dado">
              {totalSemSiteGeral.toLocaleString("pt-BR")}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {totalResultadosGeral > 0
                ? `${Math.round((totalSemSiteGeral / totalResultadosGeral) * 100)}% de taxa de oportunidade`
                : "Aguardando novas varreduras"}
            </p>
          </Card>
        </div>

        {/* TABELA / TIMELINE DE BUSCAS */}
        <Card className="bg-card border-border/80 shadow-elev overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/60 bg-surface/30">
            <CardTitle className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
              <History className="size-4 text-primary" />
              Sessões de Varredura Mapeadas
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Consulte os resultados anteriores e re-execute varreduras em bairros específicos
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface/60 text-muted-foreground uppercase text-[10px] rotulo tracking-wider whitespace-nowrap">
                    <th className="p-3 pl-4">Nicho / Segmento</th>
                    <th className="p-3">Região & Raio</th>
                    <th className="p-3">Detectados</th>
                    <th className="p-3">Sem Site</th>
                    <th className="p-3">Data da Varredura</th>
                    <th className="p-3 pr-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {buscas.map((b) => {
                    const percSemSite =
                      b.total_resultados > 0
                        ? Math.round((b.total_sem_site / b.total_resultados) * 100)
                        : 0;

                    return (
                      <tr key={b.id} className="hover:bg-secondary/30 transition-colors group">
                        <td className="p-3 pl-4">
                          <p className="font-semibold text-foreground text-xs">
                            {b.categoria || b.termo_busca}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono truncate max-w-xs">
                            {b.termo_busca}
                          </p>
                        </td>

                        <td className="p-3 dado text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3 text-primary" />
                            {b.regiao || "Região Metropolitana"} · {b.raio_km} km
                          </span>
                        </td>

                        <td className="p-3 dado font-bold text-foreground">
                          {b.total_resultados} empresas
                        </td>

                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 rounded bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/25 dado">
                            {b.total_sem_site} ({percSemSite}%)
                          </span>
                        </td>

                        <td className="p-3 dado text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {new Date(b.criada_em).toLocaleDateString("pt-BR")}
                          </span>
                        </td>

                        <td className="p-3 pr-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => reexecutarBusca(b)}
                              className="h-7 text-xs text-primary hover:bg-primary/10 gap-1 font-semibold"
                            >
                              <span>Escanear</span>
                              <ArrowRight className="size-3" />
                            </Button>

                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setBuscaParaExcluir(b)}
                              className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              title="Excluir histórico de varredura"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {buscas.length === 0 && !carregando && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center space-y-2">
                        <Radar className="size-8 text-muted-foreground/40 mx-auto" />
                        <p className="text-sm font-semibold text-foreground">
                          Nenhuma varredura registrada ainda
                        </p>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                          Inicie uma nova varredura para minerar estabelecimentos e oportunidades sem site próprio.
                        </p>
                        <Button
                          asChild
                          size="sm"
                          className="mt-2 text-xs bg-primary text-primary-foreground font-semibold"
                        >
                          <Link to="/nova-busca">
                            <Plus className="size-3.5 mr-1" /> Iniciar Primeira Varredura
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* DIÁLOGO DE EXCLUSÃO DE BUSCA */}
      <ConfirmDeleteDialog
        open={Boolean(buscaParaExcluir)}
        onOpenChange={(open) => !open && setBuscaParaExcluir(null)}
        titulo="Excluir Histórico de Varredura?"
        descricao="Este registro de prospecção será excluído permanentemente do seu histórico."
        itemNome={buscaParaExcluir ? `${buscaParaExcluir.categoria || buscaParaExcluir.termo_busca} (${buscaParaExcluir.regiao || "Região"} - ${buscaParaExcluir.total_resultados} leads)` : undefined}
        carregando={excluindoBusca}
        onConfirmar={async () => {
          if (!buscaParaExcluir) return;
          setExcluindoBusca(true);
          try {
            await prospectingService.excluirBusca(buscaParaExcluir.id);
            toast.success("Histórico de varredura excluído!");
            await carregarDados();
            setBuscaParaExcluir(null);
          } finally {
            setExcluindoBusca(false);
          }
        }}
      />
    </AppShell>
  );
}
