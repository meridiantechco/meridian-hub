import { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Building2,
  User,
  Plus,
  CheckCircle2,
  ExternalLink,
  Trash2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { calendarService } from "../services/calendarService";
import { MeetingModal } from "./MeetingModal";
import type { ReuniaoItem } from "../types";
import { cn } from "@/lib/utils";

export function CalendarView() {
  const [reunioes, setReunioes] = useState<ReuniaoItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const lista = await calendarService.listarReunioes();
      setReunioes(lista);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    void carregarDados();
  }, []);

  const hoje = new Date().toISOString().slice(0, 10);

  const totalAgendadas = useMemo(
    () => reunioes.filter((r) => r.status === "agendada").length,
    [reunioes],
  );

  const totalHoje = useMemo(
    () => reunioes.filter((r) => r.data === hoje && r.status === "agendada").length,
    [reunioes, hoje],
  );

  const totalRealizadas = useMemo(
    () => reunioes.filter((r) => r.status === "realizada").length,
    [reunioes],
  );

  const handleSalvar = async (dados: Omit<ReuniaoItem, "id" | "criado_em">) => {
    await calendarService.salvarReuniao(dados);
    await carregarDados();
  };

  const handleMarcarRealizada = async (r: ReuniaoItem) => {
    await calendarService.atualizarStatus(r.id, "realizada", true);
    await carregarDados();
    toast.success("Reunião marcada como realizada! Tarefa de follow-up criada automaticamente no módulo de Tarefas. 🚀");
  };

  const handleExcluir = async (id: string) => {
    if (window.confirm("Deseja cancelar e remover esta reunião?")) {
      await calendarService.excluirReuniao(id);
      await carregarDados();
      toast.success("Reunião removida da agenda.");
    }
  };

  return (
    <AppShell
      titulo="Agenda Comercial & Reuniões"
      descricao="Demonstrações agendadas, reuniões de fechamento e automação de follow-up pós-atendimento"
      acoes={
        <Button
          onClick={() => setModalAberto(true)}
          size="sm"
          className="h-8.5 px-3.5 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
        >
          <Plus className="size-3.5" />
          <span>Agendar Reunião</span>
        </Button>
      }
    >
      <div className="space-y-6 max-w-6xl">
        {/* CARDS RESUMO */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-card border-border/80 shadow-elev p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="rotulo text-[10px] text-muted-foreground">Reuniões Agendadas</span>
              <CalendarIcon className="size-4 text-primary" />
            </div>
            <p className="text-2xl font-bold font-display dado text-foreground">
              {totalAgendadas}
            </p>
            <p className="text-[11px] text-muted-foreground">Demonstrações e alinhamentos</p>
          </Card>

          <Card className="bg-card border-primary/30 shadow-elev p-4 space-y-1 ring-1 ring-primary/20">
            <div className="flex items-center justify-between">
              <span className="rotulo text-[10px] text-primary font-bold">Hoje na Agenda</span>
              <Clock className="size-4 text-primary" />
            </div>
            <p className="text-2xl font-bold font-display dado text-primary">
              {totalHoje}
            </p>
            <p className="text-[11px] text-muted-foreground">Compromissos para o dia</p>
          </Card>

          <Card className="bg-card border-emerald-500/30 shadow-elev p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="rotulo text-[10px] text-emerald-400 font-bold">Realizadas & Follow-up</span>
              <CheckCircle2 className="size-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold font-display dado text-emerald-400">
              {totalRealizadas}
            </p>
            <p className="text-[11px] text-muted-foreground">Reuniões concluídas com sucesso</p>
          </Card>
        </div>

        {/* LISTA DA AGENDA */}
        <Card className="bg-card border-border/80 shadow-elev overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/60 bg-surface/30">
            <CardTitle className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
              <CalendarIcon className="size-4 text-primary" />
              Cronograma de Reuniões & Demonstrações
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Apresentações comerciais com clientes potenciais e alinhamentos de contrato
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 space-y-3.5">
            <div className="space-y-3">
              {reunioes.map((r) => (
                <div
                  key={r.id}
                  className={cn(
                    "p-4 rounded-xl border border-border/70 bg-surface/40 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/40 transition-colors",
                    r.status === "realizada" && "opacity-70 bg-surface/20",
                  )}
                >
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-foreground">{r.titulo}</span>
                      <span
                        className={cn(
                          "text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border",
                          r.status === "agendada"
                            ? "bg-primary/15 text-primary border-primary/30"
                            : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
                        )}
                      >
                        {r.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1 text-foreground font-semibold">
                        <Building2 className="size-3.5 text-primary" />
                        {r.empresa_nome}
                      </span>

                      {r.contato_nome && (
                        <span className="flex items-center gap-1">
                          <User className="size-3.5 text-muted-foreground" />
                          {r.contato_nome}
                        </span>
                      )}

                      <span className="flex items-center gap-1 dado font-mono text-foreground">
                        <Clock className="size-3.5 text-primary" />
                        {new Date(r.data + "T12:00:00").toLocaleDateString("pt-BR")} às {r.horario} ({r.duracao_minutos} min)
                      </span>
                    </div>

                    {r.pauta && (
                      <p className="text-xs text-muted-foreground leading-relaxed bg-surface/60 p-2.5 rounded-lg border border-border/50">
                        <strong>Pauta:</strong> {r.pauta}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 justify-end border-t md:border-t-0 pt-2 md:pt-0 border-border/50">
                    {r.link_reuniao && (
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="h-8 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                      >
                        <a href={r.link_reuniao} target="_blank" rel="noreferrer">
                          <Video className="size-3.5" />
                          <span>Entrar no Meet</span>
                          <ExternalLink className="size-3 opacity-70" />
                        </a>
                      </Button>
                    )}

                    {r.status === "agendada" && (
                      <Button
                        size="sm"
                        onClick={() => handleMarcarRealizada(r)}
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="size-3.5" />
                        <span>Concluir Reunião</span>
                      </Button>
                    )}

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleExcluir(r.id)}
                      className="size-8 text-muted-foreground hover:text-destructive"
                      title="Excluir reunião"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}

              {reunioes.length === 0 && !carregando && (
                <div className="py-12 text-center space-y-2">
                  <CalendarIcon className="size-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-sm font-semibold text-foreground">
                    Nenhuma reunião agendada
                  </p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Agende reuniões com decisores para avançar o pipeline comercial.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MODAL AGENDAR REUNIÃO */}
      <MeetingModal
        aberto={modalAberto}
        onOpenChange={setModalAberto}
        onSalvar={handleSalvar}
      />
    </AppShell>
  );
}
