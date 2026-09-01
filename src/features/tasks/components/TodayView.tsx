import { Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Sun,
  CheckSquare,
  Calendar,
  Sparkles,
  MessageSquare,
  Clock,
  Building2,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { tasksService } from "../services/tasksService";
import { opportunityService } from "@/features/opportunities";
import { prospectaService, WhatsAppModal, type LeadItem } from "@/features/leads";
import type { TarefaItem } from "../types";

export function TodayView() {
  const { nome, user } = useAuth();
  const primeiroNome = (nome || user?.email || "Operador").split(" ")[0];

  const [tarefas, setTarefas] = useState<TarefaItem[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Modais
  const [leadParaWhatsApp, setLeadParaWhatsApp] = useState<LeadItem | null>(null);
  const [modalWhatsAppAberto, setModalWhatsAppAberto] = useState(false);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const [listaTsk, listaLeads] = await Promise.all([
        tasksService.listarTarefas(),
        prospectaService.listarLeads(),
      ]);
      setTarefas(listaTsk);
      setLeads(listaLeads);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    void carregarDados();
  }, []);

  const hoje = new Date().toISOString().slice(0, 10);

  const tarefasHoje = useMemo(() => {
    return tarefas.filter((t) => t.prazo <= hoje && t.status !== "concluida");
  }, [tarefas, hoje]);

  const oportunidadesCriticas = useMemo(() => {
    const enriched = opportunityService.enriquecerOportunidades(leads);
    return enriched
      .filter((o) => o.categoriaOportunidade.includes("quentes") || o.categoriaOportunidade.includes("em_risco"))
      .slice(0, 4);
  }, [leads]);

  const alternarConclusao = async (tarefa: TarefaItem) => {
    await tasksService.alternarStatus(tarefa.id, tarefa.status === "concluida" ? "pendente" : "concluida");
    await carregarDados();
  };

  const dataAtualTexto = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const dataFormatada = dataAtualTexto.charAt(0).toUpperCase() + dataAtualTexto.slice(1);

  return (
    <AppShell
      titulo="Central do Dia (Hoje)"
      descricao="Cockpit operacional diário com tarefas prioritárias, follow-ups e oportunidades críticas"
    >
      <div className="space-y-6 max-w-6xl">
        {/* BANNER DE BOM DIA */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/20 via-card to-card border border-primary/30 shadow-elev flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30">
                <Sun className="size-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                Bom dia, {primeiroNome}!
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-11">
              Hoje é <strong className="text-foreground">{dataFormatada}</strong>. Você possui{" "}
              <strong className="text-primary">{tarefasHoje.length} tarefas</strong> e{" "}
              <strong className="text-emerald-400">{oportunidadesCriticas.length} follow-ups prioritários</strong> para atender.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-border/40">
            <Button
              asChild
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8.5 px-4 shadow-sm"
            >
              <Link to="/opportunities">
                <span>Ver Opportunity Center</span>
                <ArrowRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>

        {/* 4 CARDS DE FOCO DO DIA */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-xl bg-card border border-border/80 shadow-elev space-y-1">
            <div className="flex items-center justify-between">
              <span className="rotulo text-[10px] text-muted-foreground">Tarefas do Dia</span>
              <CheckSquare className="size-4 text-primary" />
            </div>
            <p className="text-2xl font-bold font-display dado text-foreground">
              {tarefasHoje.length}
            </p>
            <p className="text-[11px] text-muted-foreground">Pendentes para concluir hoje</p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border/80 shadow-elev space-y-1">
            <div className="flex items-center justify-between">
              <span className="rotulo text-[10px] text-muted-foreground">Reuniões Marcadas</span>
              <Calendar className="size-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold font-display dado text-emerald-400">
              2 reuniões
            </p>
            <p className="text-[11px] text-muted-foreground">Demonstrações na agenda</p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-amber-500/30 shadow-elev space-y-1">
            <div className="flex items-center justify-between">
              <span className="rotulo text-[10px] text-amber-400">Follow-ups Críticos</span>
              <AlertTriangle className="size-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold font-display dado text-amber-400">
              {oportunidadesCriticas.length}
            </p>
            <p className="text-[11px] text-muted-foreground">Oportunidades quentes / em risco</p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border/80 shadow-elev space-y-1">
            <div className="flex items-center justify-between">
              <span className="rotulo text-[10px] text-muted-foreground">Ritmo Comercial</span>
              <TrendingUp className="size-4 text-primary" />
            </div>
            <p className="text-2xl font-bold font-display dado text-primary">
              Alta Atividade
            </p>
            <p className="text-[11px] text-muted-foreground">Operação em andamento</p>
          </div>
        </div>

        {/* BENTO GRID: TAREFAS DE HOJE & OPORTUNIDADES CRÍTICAS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* COLUNA ESQUERDA: TAREFAS DE HOJE */}
          <Card className="bg-card border-border/80 shadow-elev flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
                  <CheckSquare className="size-4 text-primary" />
                  Tarefas Prioritárias de Hoje
                </CardTitle>
                <CardDescription className="text-xs">
                  Marque como concluída conforme for executando
                </CardDescription>
              </div>

              <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-primary gap-1">
                <Link to="/tasks">
                  <span>Ver todas</span>
                  <ArrowRight className="size-3" />
                </Link>
              </Button>
            </CardHeader>

            <CardContent className="p-4 space-y-3 flex-1">
              <div className="divide-y divide-border/60">
                {tarefasHoje.map((t) => (
                  <div
                    key={t.id}
                    className="py-3 first:pt-0 last:pb-0 flex items-start gap-3 hover:bg-secondary/15 transition-colors"
                  >
                    <Checkbox
                      checked={t.status === "concluida"}
                      onCheckedChange={() => alternarConclusao(t)}
                      className="mt-0.5"
                    />

                    <div className="space-y-0.5 flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground line-clamp-1">{t.titulo}</p>
                      {t.descricao && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{t.descricao}</p>
                      )}
                      {t.empresa_nome && (
                        <p className="text-[10.5px] text-primary flex items-center gap-1">
                          <Building2 className="size-3" />
                          <span>{t.empresa_nome}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {tarefasHoje.length === 0 && (
                  <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
                    <p className="font-semibold text-foreground">Tudo em dia para hoje! 🚀</p>
                    <p>Nenhuma tarefa pendente com prazo para hoje.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* COLUNA DIREITA: FOLLOW-UPS & OPORTUNIDADES CRÍTICAS */}
          <Card className="bg-card border-border/80 shadow-elev flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  Follow-ups & Abordagens Recomendadas
                </CardTitle>
                <CardDescription className="text-xs">
                  Ações de alto impacto sugeridas pelo motor preditivo
                </CardDescription>
              </div>

              <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-primary gap-1">
                <Link to="/opportunities">
                  <span>Ver todas</span>
                  <ArrowRight className="size-3" />
                </Link>
              </Button>
            </CardHeader>

            <CardContent className="p-4 space-y-3 flex-1">
              <div className="space-y-3">
                {oportunidadesCriticas.map((op) => (
                  <div
                    key={op.lead.id}
                    className="p-3 rounded-xl bg-surface/50 border border-border/70 space-y-2 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <span className="text-[9.5px] uppercase font-bold text-muted-foreground rotulo">
                          {op.lead.categoria}
                        </span>
                        <h4 className="font-bold text-xs text-foreground truncate">{op.lead.nome}</h4>
                      </div>

                      <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Score {op.score}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between text-xs gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-primary font-bold block">
                          {op.proximaAcao.titulo}
                        </span>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => {
                          setLeadParaWhatsApp(op.lead);
                          setModalWhatsAppAberto(true);
                        }}
                        className="h-6.5 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] gap-1 font-semibold shadow-xs shrink-0"
                      >
                        <MessageSquare className="size-3" />
                        Disparar
                      </Button>
                    </div>
                  </div>
                ))}

                {oportunidadesCriticas.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground py-8">
                    Nenhum follow-up crítico pendente neste momento.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODAL WHATSAPP */}
      <WhatsAppModal
        lead={leadParaWhatsApp}
        aberto={modalWhatsAppAberto}
        onOpenChange={setModalWhatsAppAberto}
        onMensagemEnviada={carregarDados}
      />
    </AppShell>
  );
}
