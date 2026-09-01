import { Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  History,
  Building2,
  Calendar,
  CheckCircle2,
  Send,
  MessageSquare,
  Sparkles,
  Clock,
  Filter,
} from "lucide-react";
import { activitiesService } from "../services/activitiesService";
import type { AtividadeGlobal, TipoAtividade } from "../types";
import { cn } from "@/lib/utils";

export function ActivitiesView() {
  const [atividades, setAtividades] = useState<AtividadeGlobal[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>("todas");

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const lista = await activitiesService.listarAtividades();
      setAtividades(lista);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    void carregarDados();
  }, []);

  const atividadesFiltradas = useMemo(() => {
    return atividades.filter((act) => {
      if (filtroTipo === "leads" && act.tipo !== "lead_criado") return false;
      if (filtroTipo === "reunioes" && !act.tipo.includes("reuniao")) return false;
      if (filtroTipo === "status" && act.tipo !== "status_alterado" && act.tipo !== "proposta_enviada")
        return false;
      if (filtroTipo === "tarefas" && act.tipo !== "tarefa_concluida") return false;
      return true;
    });
  }, [atividades, filtroTipo]);

  const iconeTipo = (tipo: TipoAtividade) => {
    switch (tipo) {
      case "lead_criado":
        return <Building2 className="size-3.5 text-primary" />;
      case "reuniao_agendada":
      case "reuniao_concluida":
        return <Calendar className="size-3.5 text-emerald-400" />;
      case "tarefa_concluida":
        return <CheckCircle2 className="size-3.5 text-emerald-400" />;
      case "proposta_enviada":
        return <Send className="size-3.5 text-amber-400" />;
      default:
        return <Sparkles className="size-3.5 text-primary" />;
    }
  };

  return (
    <AppShell
      titulo="Histórico de Atividades & Timeline"
      descricao="Feed auditável de eventos operacionais, movimentações de funil, reuniões e contatos"
    >
      <div className="space-y-6 max-w-4xl">
        {/* BARRA DE FILTROS */}
        <Card className="bg-card border-border/80 shadow-elev">
          <CardContent className="p-3.5 flex items-center justify-between gap-3 overflow-x-auto">
            <div className="flex items-center gap-1">
              {[
                { id: "todas", rotulo: "Todas as Atividades" },
                { id: "leads", rotulo: "Prospecções & Leads" },
                { id: "reunioes", rotulo: "Reuniões & Agenda" },
                { id: "status", rotulo: "Mudanças de Funil" },
                { id: "tarefas", rotulo: "Tarefas Concluídas" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFiltroTipo(f.id)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all whitespace-nowrap",
                    filtroTipo === f.id
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f.rotulo}
                </button>
              ))}
            </div>

            <span className="text-xs text-muted-foreground dado font-mono shrink-0">
              {atividadesFiltradas.length} eventos
            </span>
          </CardContent>
        </Card>

        {/* TIMELINE FEED */}
        <Card className="bg-card border-border/80 shadow-elev p-5">
          <div className="relative border-l border-border/70 ml-3.5 space-y-6 pl-6 py-2">
            {atividadesFiltradas.map((act) => (
              <div key={act.id} className="relative group">
                {/* PONTO DA TIMELINE */}
                <div className="absolute -left-[31px] top-0.5 size-6 rounded-full bg-surface border border-border flex items-center justify-center group-hover:border-primary/60 group-hover:scale-110 transition-all">
                  {iconeTipo(act.tipo)}
                </div>

                <div className="p-3.5 rounded-xl bg-surface/40 border border-border/60 space-y-1.5 hover:border-primary/40 transition-colors">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <h4 className="font-semibold text-foreground text-xs">{act.titulo}</h4>
                    <span className="text-[10.5px] text-muted-foreground dado font-mono flex items-center gap-1 shrink-0">
                      <Clock className="size-2.5" />
                      {new Date(act.data_hora).toLocaleString("pt-BR")}
                    </span>
                  </div>

                  {act.descricao && (
                    <p className="text-xs text-muted-foreground leading-relaxed">{act.descricao}</p>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
                    <span className="text-muted-foreground">Por: {act.usuario_nome}</span>

                    {act.empresa_id && (
                      <Link
                        to="/companies/$id"
                        params={{ id: act.empresa_id }}
                        className="text-primary hover:underline font-semibold inline-flex items-center gap-1"
                      >
                        <Building2 className="size-3" />
                        <span>Ver Conta</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {atividadesFiltradas.length === 0 && !carregando && (
              <div className="py-12 text-center space-y-2">
                <History className="size-8 text-muted-foreground/40 mx-auto" />
                <p className="text-sm font-semibold text-foreground">
                  Nenhuma atividade encontrada neste filtro
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
