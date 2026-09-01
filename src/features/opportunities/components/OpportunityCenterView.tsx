import { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Flame,
  AlertTriangle,
  Sparkles,
  Clock,
  Coins,
  Search,
  RefreshCw,
  SlidersHorizontal,
  Target,
} from "lucide-react";
import { leadsService, WhatsAppModal, LeadDrawer, type LeadItem } from "@/features/leads";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { CardGridSkeleton, MetricCardsSkeleton } from "@/components/ui/skeletons";
import { toast } from "sonner";
import { opportunityService } from "../services/opportunityService";
import { OpportunityCard } from "./OpportunityCard";
import { ScoreBreakdownModal } from "./ScoreBreakdownModal";
import type { CategoriaOportunidade, OportunidadeEnriquecida } from "../types";
import { cn } from "@/lib/utils";

export function OpportunityCenterView() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<CategoriaOportunidade>("todas");
  const [busca, setBusca] = useState("");

  // Modais
  const [oportunidadeSelecionadaScore, setOportunidadeSelecionadaScore] =
    useState<OportunidadeEnriquecida | null>(null);
  const [modalScoreAberto, setModalScoreAberto] = useState(false);

  const [leadParaWhatsApp, setLeadParaWhatsApp] = useState<LeadItem | null>(null);
  const [modalWhatsAppAberto, setModalWhatsAppAberto] = useState(false);

  const [leadDrawer, setLeadDrawer] = useState<LeadItem | null>(null);
  const [drawerAberto, setDrawerAberto] = useState(false);

  const [opParaExcluir, setOpParaExcluir] = useState<OportunidadeEnriquecida | null>(null);
  const [excluindoOp, setExcluindoOp] = useState(false);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const lista = await leadsService.listarLeads();
      setLeads(lista);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    void carregarDados();
  }, []);

  const oportunidades = useMemo(() => {
    return opportunityService.enriquecerOportunidades(leads);
  }, [leads]);

  const totalQuentes = useMemo(
    () => oportunidades.filter((o) => o.categoriaOportunidade.includes("quentes")).length,
    [oportunidades],
  );

  const totalEmRisco = useMemo(
    () => oportunidades.filter((o) => o.categoriaOportunidade.includes("em_risco")).length,
    [oportunidades],
  );

  const totalNovas = useMemo(
    () => oportunidades.filter((o) => o.categoriaOportunidade.includes("novas")).length,
    [oportunidades],
  );

  const totalParadas = useMemo(
    () => oportunidades.filter((o) => o.categoriaOportunidade.includes("paradas")).length,
    [oportunidades],
  );

  const totalAltoPotencial = useMemo(
    () => oportunidades.filter((o) => o.categoriaOportunidade.includes("alto_potencial")).length,
    [oportunidades],
  );

  const valorTotalPipeline = useMemo(
    () => oportunidades.reduce((acc, o) => acc + o.valorEstimadoContrato, 0),
    [oportunidades],
  );

  const oportunidadesFiltradas = useMemo(() => {
    return oportunidades.filter((op) => {
      if (abaAtiva !== "todas" && !op.categoriaOportunidade.includes(abaAtiva)) {
        return false;
      }
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const nome = op.lead.nome.toLowerCase();
        const cat = op.lead.categoria.toLowerCase();
        const local = (op.lead.bairro || op.lead.cidade || "").toLowerCase();
        if (!nome.includes(termo) && !cat.includes(termo) && !local.includes(termo)) {
          return false;
        }
      }
      return true;
    });
  }, [oportunidades, abaAtiva, busca]);

  const handleVerExplicacaoScore = (op: OportunidadeEnriquecida) => {
    setOportunidadeSelecionadaScore(op);
    setModalScoreAberto(true);
  };

  const handleAbordarWhatsApp = (op: OportunidadeEnriquecida) => {
    setLeadParaWhatsApp(op.lead);
    setModalWhatsAppAberto(true);
  };

  const handlePreviewDrawer = (op: OportunidadeEnriquecida) => {
    setLeadDrawer(op.lead);
    setDrawerAberto(true);
  };

  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <AppShell
      titulo="Opportunity Center"
      descricao="Central de inteligência comercial para priorização, score preditivo e ações de alta conversão"
      acoes={
        <Button
          variant="outline"
          size="sm"
          onClick={carregarDados}
          disabled={carregando}
          className="h-8.5 px-3 gap-1.5 text-xs border-border/80"
        >
          <RefreshCw className={`size-3.5 ${carregando ? "animate-spin text-primary" : ""}`} />
          <span>Atualizar Oportunidades</span>
        </Button>
      }
    >
      {carregando && leads.length === 0 ? (
        <div className="space-y-6 max-w-6xl animate-fade-in">
          <MetricCardsSkeleton quantidade={4} colunas="grid-cols-2 sm:grid-cols-4" />
          <CardGridSkeleton quantidade={6} mostrarFiltros={true} />
        </div>
      ) : (
        <div className="space-y-6 max-w-6xl animate-fade-in">
          {/* CARDS RESUMO DO OPPORTUNITY CENTER */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <Card className="bg-card border-border/80 p-4 space-y-1 shadow-elev">
              <div className="flex items-center justify-between">
                <span className="rotulo text-[10px] text-muted-foreground">Oportunidades no Radar</span>
                <Target className="size-4 text-primary" />
              </div>
              <p className="text-2xl font-bold font-display dado text-foreground">
                {oportunidades.length}
              </p>
              <p className="text-[11px] text-muted-foreground">Base ativa para trabalho</p>
            </Card>

          <Card className="bg-card border-primary/30 p-4 space-y-1 shadow-elev ring-1 ring-primary/20">
            <div className="flex items-center justify-between">
              <span className="rotulo text-[10px] text-primary font-bold">🔥 Quentes (Score &ge; 75)</span>
              <Flame className="size-4 text-primary fill-current" />
            </div>
            <p className="text-2xl font-bold font-display dado text-primary">{totalQuentes}</p>
            <p className="text-[11px] text-muted-foreground">Prontas para contato imediato</p>
          </Card>

          <Card className="bg-card border-amber-500/30 p-4 space-y-1 shadow-elev">
            <div className="flex items-center justify-between">
              <span className="rotulo text-[10px] text-amber-400 font-bold">⚠ Em Risco / Follow-up</span>
              <AlertTriangle className="size-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold font-display dado text-amber-400">{totalEmRisco}</p>
            <p className="text-[11px] text-muted-foreground">&ge; 3 dias sem resposta</p>
          </Card>

          <Card className="bg-card border-emerald-500/30 p-4 space-y-1 shadow-elev">
            <div className="flex items-center justify-between">
              <span className="rotulo text-[10px] text-emerald-400 font-bold">Pipeline Estimado</span>
              <Coins className="size-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold font-display dado text-emerald-400">
              {formatarMoeda(valorTotalPipeline)}
            </p>
            <p className="text-[11px] text-muted-foreground">Valor potencial acumulado</p>
          </Card>
        </div>

        {/* BARRA DE ABAS & BUSCA */}
        <Card className="bg-card border-border/80 shadow-elev">
          <CardContent className="p-3.5 space-y-3">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              {/* Abas de Categorias de Oportunidade */}
              <div className="flex items-center gap-1 bg-surface/80 p-1 rounded-xl border border-border/70 overflow-x-auto max-w-full">
                <button
                  type="button"
                  onClick={() => setAbaAtiva("todas")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                    abaAtiva === "todas"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Todas ({oportunidades.length})
                </button>

                <button
                  type="button"
                  onClick={() => setAbaAtiva("quentes")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1",
                    abaAtiva === "quentes"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-primary",
                  )}
                >
                  🔥 Quentes ({totalQuentes})
                </button>

                <button
                  type="button"
                  onClick={() => setAbaAtiva("em_risco")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1",
                    abaAtiva === "em_risco"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "text-muted-foreground hover:text-amber-400",
                  )}
                >
                  ⚠ Em Risco ({totalEmRisco})
                </button>

                <button
                  type="button"
                  onClick={() => setAbaAtiva("novas")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                    abaAtiva === "novas"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  ✨ Novas ({totalNovas})
                </button>

                <button
                  type="button"
                  onClick={() => setAbaAtiva("paradas")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                    abaAtiva === "paradas"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : "text-muted-foreground hover:text-rose-400",
                  )}
                >
                  ⏳ Paradas ({totalParadas})
                </button>

                <button
                  type="button"
                  onClick={() => setAbaAtiva("alto_potencial")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                    abaAtiva === "alto_potencial"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "text-muted-foreground hover:text-emerald-400",
                  )}
                >
                  💰 Alto Potencial ({totalAltoPotencial})
                </button>
              </div>

              {/* Input de Busca Rápida */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar oportunidade..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-8 text-xs h-8.5 bg-surface/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GRID DE CARDS DE OPORTUNIDADES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {oportunidadesFiltradas.map((op) => (
            <OpportunityCard
              key={op.lead.id}
              oportunidade={op}
              onVerExplicacaoScore={handleVerExplicacaoScore}
              onAbordarWhatsApp={handleAbordarWhatsApp}
              onPreviewDrawer={handlePreviewDrawer}
              onSolicitarExcluir={(opItem) => setOpParaExcluir(opItem)}
            />
          ))}
        </div>

        {/* EMPTY STATE */}
        {oportunidadesFiltradas.length === 0 && !carregando && (
          <div className="py-16 text-center space-y-2.5 bg-card/50 rounded-2xl border border-dashed border-border/80 p-8">
            <Target className="size-10 text-muted-foreground/40 mx-auto" />
            <h3 className="text-base font-bold text-foreground">
              Nenhuma oportunidade encontrada nesta categoria
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Tente selecionar outra aba ou realizar uma nova varredura de estabelecimentos para alimentar o radar.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAbaAtiva("todas");
                setBusca("");
              }}
              className="mt-2 text-xs"
            >
              Exibir Todas as Oportunidades
            </Button>
          </div>
        )}
      </div>
      )}

      {/* DIÁLOGO DE EXCLUSÃO DE OPORTUNIDADE */}
      <ConfirmDeleteDialog
        open={Boolean(opParaExcluir)}
        onOpenChange={(open) => !open && setOpParaExcluir(null)}
        titulo="Descartar / Excluir Oportunidade?"
        descricao="Esta oportunidade será removida permanentemente do radar e da base comercial."
        itemNome={opParaExcluir ? `${opParaExcluir.lead.nome} (${opParaExcluir.lead.categoria})` : undefined}
        carregando={excluindoOp}
        onConfirmar={async () => {
          if (!opParaExcluir) return;
          setExcluindoOp(true);
          try {
            await leadsService.removerLead(opParaExcluir.lead.id);
            toast.success(`Oportunidade "${opParaExcluir.lead.nome}" removida com sucesso!`);
            await carregarDados();
            setOpParaExcluir(null);
          } finally {
            setExcluindoOp(false);
          }
        }}
      />

      {/* MODAL DE EXPLICAÇÃO DO SCORE */}
      <ScoreBreakdownModal
        oportunidade={oportunidadeSelecionadaScore}
        aberto={modalScoreAberto}
        onOpenChange={setModalScoreAberto}
        onAbordarWhatsApp={() => {
          if (oportunidadeSelecionadaScore) {
            handleAbordarWhatsApp(oportunidadeSelecionadaScore);
          }
        }}
      />

      {/* WHATSAPP MODAL */}
      <WhatsAppModal
        lead={leadParaWhatsApp}
        aberto={modalWhatsAppAberto}
        onOpenChange={setModalWhatsAppAberto}
        onMensagemEnviada={carregarDados}
      />

      {/* LEAD DRAWER */}
      <LeadDrawer
        lead={leadDrawer}
        aberto={drawerAberto}
        onOpenChange={setDrawerAberto}
        onStatusChange={async (leadId, status) => {
          await leadsService.atualizarStatusLead(leadId, status);
          await carregarDados();
        }}
        onAbordarWhatsApp={(l) => {
          setLeadParaWhatsApp(l);
          setModalWhatsAppAberto(true);
        }}
        onLeadAtualizado={carregarDados}
      />
    </AppShell>
  );
}
