import { Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckSquare,
  Search,
  Plus,
  Calendar,
  Clock,
  Building2,
  Trash2,
  Pencil,
  AlertTriangle,
  Kanban,
  Table as TableIcon,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { tasksService } from "../services/tasksService";
import { TaskModal } from "./TaskModal";
import type { TarefaItem, StatusTarefa, PrioridadeTarefa } from "../types";
import { cn } from "@/lib/utils";

export function TasksView() {
  const [tarefas, setTarefas] = useState<TarefaItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [abaFiltro, setAbaFiltro] = useState<"todas" | "hoje" | "atrasadas" | "concluidas">("todas");
  const [modoExibicao, setModoExibicao] = useState<"lista" | "kanban">("lista");

  // Modais
  const [modalAberto, setModalAberto] = useState(false);
  const [tarefaEditando, setTarefaEditando] = useState<TarefaItem | null>(null);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const lista = await tasksService.listarTarefas();
      setTarefas(lista);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    void carregarDados();
  }, []);

  const hoje = new Date().toISOString().slice(0, 10);

  const totalPendentes = useMemo(
    () => tarefas.filter((t) => t.status !== "concluida").length,
    [tarefas],
  );

  const totalHoje = useMemo(
    () => tarefas.filter((t) => t.prazo === hoje && t.status !== "concluida").length,
    [tarefas, hoje],
  );

  const totalAtrasadas = useMemo(
    () => tarefas.filter((t) => t.prazo < hoje && t.status !== "concluida").length,
    [tarefas, hoje],
  );

  const totalConcluidas = useMemo(
    () => tarefas.filter((t) => t.status === "concluida").length,
    [tarefas],
  );

  const tarefasFiltradas = useMemo(() => {
    return tarefas.filter((t) => {
      if (abaFiltro === "hoje" && (t.prazo !== hoje || t.status === "concluida")) {
        return false;
      }
      if (abaFiltro === "atrasadas" && (t.prazo >= hoje || t.status === "concluida")) {
        return false;
      }
      if (abaFiltro === "concluidas" && t.status !== "concluida") {
        return false;
      }
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const tit = t.titulo.toLowerCase();
        const emp = (t.empresa_nome || "").toLowerCase();
        if (!tit.includes(termo) && !emp.includes(termo)) {
          return false;
        }
      }
      return true;
    });
  }, [tarefas, abaFiltro, busca, hoje]);

  const handleAlternarStatus = async (tarefa: TarefaItem) => {
    const novoStatus: StatusTarefa = tarefa.status === "concluida" ? "pendente" : "concluida";
    await tasksService.alternarStatus(tarefa.id, novoStatus);
    await carregarDados();
    toast.success(novoStatus === "concluida" ? "Tarefa concluída! 🎉" : "Tarefa reaberta.");
  };

  const handleSalvar = async (dados: Omit<TarefaItem, "id" | "criado_em">) => {
    if (tarefaEditando) {
      await tasksService.atualizarTarefa(tarefaEditando.id, dados);
    } else {
      await tasksService.salvarTarefa(dados);
    }
    await carregarDados();
  };

  const handleExcluir = async (id: string) => {
    if (window.confirm("Deseja excluir esta tarefa?")) {
      await tasksService.excluirTarefa(id);
      await carregarDados();
      toast.success("Tarefa excluída.");
    }
  };

  const badgePrioridade = (prio: PrioridadeTarefa) => {
    switch (prio) {
      case "urgente":
        return "bg-rose-500/15 text-rose-300 border-rose-500/30";
      case "alta":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "media":
        return "bg-primary/15 text-primary border-primary/30";
      default:
        return "bg-secondary text-muted-foreground border-border";
    }
  };

  return (
    <AppShell
      titulo="Tarefas Operacionais"
      descricao="Gestão de pendências comerciais, follow-ups e rotina diária da equipe"
      acoes={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-secondary/80 p-0.5 rounded-lg border border-border/80">
            <button
              type="button"
              onClick={() => setModoExibicao("lista")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all",
                modoExibicao === "lista"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <TableIcon className="size-3.5" />
              <span>Lista</span>
            </button>
            <button
              type="button"
              onClick={() => setModoExibicao("kanban")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all",
                modoExibicao === "kanban"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Kanban className="size-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          <Button
            onClick={() => {
              setTarefaEditando(null);
              setModalAberto(true);
            }}
            size="sm"
            className="h-8.5 px-3.5 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>Nova Tarefa</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-4 max-w-6xl">
        {/* CARDS RESUMO */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-card border border-border/70 shadow-xs flex items-center justify-between">
            <div>
              <p className="rotulo text-[10px]">Pendentes Total</p>
              <p className="text-2xl font-bold font-display dado mt-0.5 text-foreground">
                {totalPendentes}
              </p>
            </div>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <CheckSquare className="size-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border/70 shadow-xs flex items-center justify-between ring-1 ring-primary/20">
            <div>
              <p className="rotulo text-[10px] text-primary">Para Hoje</p>
              <p className="text-2xl font-bold font-display text-primary dado mt-0.5">
                {totalHoje}
              </p>
            </div>
            <div className="size-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
              <Calendar className="size-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border/70 shadow-xs flex items-center justify-between">
            <div>
              <p className="rotulo text-[10px] text-rose-400">Atrasadas</p>
              <p className="text-2xl font-bold font-display text-rose-400 dado mt-0.5">
                {totalAtrasadas}
              </p>
            </div>
            <div className="size-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="size-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border/70 shadow-xs flex items-center justify-between">
            <div>
              <p className="rotulo text-[10px] text-emerald-400">Concluídas</p>
              <p className="text-2xl font-bold font-display text-emerald-400 dado mt-0.5">
                {totalConcluidas}
              </p>
            </div>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
        </div>

        {/* BARRA DE ABAS & BUSCA */}
        <Card className="bg-card border-border/80 shadow-elev">
          <CardContent className="p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-surface/80 p-1 rounded-xl border border-border/70 overflow-x-auto">
              <button
                type="button"
                onClick={() => setAbaFiltro("todas")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all",
                  abaFiltro === "todas"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Todas ({tarefas.length})
              </button>

              <button
                type="button"
                onClick={() => setAbaFiltro("hoje")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all",
                  abaFiltro === "hoje"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-primary",
                )}
              >
                Hoje ({totalHoje})
              </button>

              <button
                type="button"
                onClick={() => setAbaFiltro("atrasadas")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all",
                  abaFiltro === "atrasadas"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : "text-muted-foreground hover:text-rose-400",
                )}
              >
                Atrasadas ({totalAtrasadas})
              </button>

              <button
                type="button"
                onClick={() => setAbaFiltro("concluidas")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all",
                  abaFiltro === "concluidas"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "text-muted-foreground hover:text-emerald-400",
                )}
              >
                Concluídas ({totalConcluidas})
              </button>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar tarefa..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-8 text-xs h-8.5 bg-surface/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* VISUALIZAÇÃO EM LISTA */}
        {modoExibicao === "lista" ? (
          <Card className="bg-card border-border/80 shadow-elev overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-border/60">
                {tarefasFiltradas.map((t) => {
                  const estaAtrasada = t.prazo < hoje && t.status !== "concluida";

                  return (
                    <div
                      key={t.id}
                      className={cn(
                        "p-3.5 flex items-start sm:items-center justify-between gap-3 hover:bg-secondary/20 transition-colors",
                        t.status === "concluida" && "opacity-60 bg-surface/20",
                      )}
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                        <Checkbox
                          checked={t.status === "concluida"}
                          onCheckedChange={() => handleAlternarStatus(t)}
                          aria-label={`Concluir ${t.titulo}`}
                          className="mt-1 sm:mt-0"
                        />

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={cn(
                                "text-xs font-semibold text-foreground line-clamp-1",
                                t.status === "concluida" && "line-through text-muted-foreground",
                              )}
                            >
                              {t.titulo}
                            </span>

                            <span
                              className={cn(
                                "text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded border",
                                badgePrioridade(t.prioridade),
                              )}
                            >
                              {t.prioridade}
                            </span>

                            {estaAtrasada && (
                              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <AlertTriangle className="size-2.5" /> Atrasada
                              </span>
                            )}
                          </div>

                          {t.descricao && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                              {t.descricao}
                            </p>
                          )}

                          {t.empresa_nome && (
                            <p className="text-[10.5px] text-primary flex items-center gap-1">
                              <Building2 className="size-3" />
                              <span>{t.empresa_nome}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right text-xs dado text-muted-foreground hidden sm:block">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3 text-muted-foreground" />
                            {new Date(t.prazo + "T12:00:00").toLocaleDateString("pt-BR")}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setTarefaEditando(t);
                              setModalAberto(true);
                            }}
                            className="size-7 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="size-3.5" />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleExcluir(t.id)}
                            className="size-7 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {tarefasFiltradas.length === 0 && !carregando && (
                  <div className="py-12 text-center space-y-2">
                    <CheckSquare className="size-8 text-muted-foreground/40 mx-auto" />
                    <p className="text-sm font-semibold text-foreground">
                      Nenhuma tarefa encontrada
                    </p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Tudo em dia ou nenhum resultado corresponde à busca.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* VISUALIZAÇÃO EM KANBAN */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["pendente", "em_andamento", "concluida"] as StatusTarefa[]).map((st) => {
              const rotulos: Record<StatusTarefa, string> = {
                pendente: "A Fazer / Pendente",
                em_andamento: "Em Andamento",
                concluida: "Concluídas",
              };
              const tarefasColuna = tarefasFiltradas.filter((t) => t.status === st);

              return (
                <div
                  key={st}
                  className="rounded-2xl border border-border/80 bg-surface/30 p-3 flex flex-col space-y-3 min-h-[450px]"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider rotulo">
                      {rotulos[st]}
                    </h3>
                    <span className="text-xs font-bold dado px-2 py-0.5 rounded-full bg-secondary text-foreground">
                      {tarefasColuna.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
                    {tarefasColuna.map((t) => (
                      <Card
                        key={t.id}
                        className="bg-card border-border/80 p-3 space-y-2 shadow-xs hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <span
                            className={cn(
                              "text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded border",
                              badgePrioridade(t.prioridade),
                            )}
                          >
                            {t.prioridade}
                          </span>
                          <span className="text-[10px] text-muted-foreground dado flex items-center gap-1">
                            <Clock className="size-2.5" />
                            {new Date(t.prazo + "T12:00:00").toLocaleDateString("pt-BR")}
                          </span>
                        </div>

                        <p className="font-semibold text-xs text-foreground line-clamp-2">
                          {t.titulo}
                        </p>

                        {t.empresa_nome && (
                          <p className="text-[10.5px] text-primary flex items-center gap-1 truncate">
                            <Building2 className="size-3" />
                            <span>{t.empresa_nome}</span>
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-border/50">
                          <button
                            type="button"
                            onClick={() => handleAlternarStatus(t)}
                            className="text-[10px] text-primary hover:underline font-semibold cursor-pointer"
                          >
                            {t.status === "concluida" ? "Reabrir" : "Marcar Concluída"}
                          </button>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setTarefaEditando(t);
                              setModalAberto(true);
                            }}
                            className="size-6 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="size-3" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL CRIAR / EDITAR TAREFA */}
      <TaskModal
        aberto={modalAberto}
        onOpenChange={setModalAberto}
        tarefaParaEditar={tarefaEditando}
        onSalvar={handleSalvar}
      />
    </AppShell>
  );
}
