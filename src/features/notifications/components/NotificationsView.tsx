import { Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bell,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Zap,
  Calendar,
  Clock,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { notificationsService } from "../services/notificationsService";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { TimelineSkeleton } from "@/components/ui/skeletons";
import type { NotificacaoItem, TipoNotificacao } from "../types";
import { cn } from "@/lib/utils";

export function NotificationsView() {
  const [notificacoes, setNotificacoes] = useState<NotificacaoItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroAba, setFiltroAba] = useState<string>("todas");
  const [notificacaoParaExcluir, setNotificacaoParaExcluir] = useState<NotificacaoItem | null>(null);
  const [excluindoNotif, setExcluindoNotif] = useState(false);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const lista = await notificationsService.listarNotificacoes();
      setNotificacoes(lista);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    void carregarDados();
  }, []);

  const totalNaoLidas = useMemo(
    () => notificacoes.filter((n) => !n.lida).length,
    [notificacoes],
  );

  const notificacoesFiltradas = useMemo(() => {
    return notificacoes.filter((n) => {
      if (filtroAba === "nao_lidas" && n.lida) return false;
      if (filtroAba === "oportunidades" && n.tipo !== "nova_oportunidade") return false;
      if (filtroAba === "riscos" && n.tipo !== "lead_em_risco" && n.tipo !== "tarefa_atrasada")
        return false;
      if (filtroAba === "workflows" && n.tipo !== "workflow_executado") return false;
      return true;
    });
  }, [notificacoes, filtroAba]);

  const handleMarcarLida = async (id: string) => {
    await notificationsService.marcarComoLida(id);
    await carregarDados();
  };

  const handleMarcarTodasLidas = async () => {
    await notificationsService.marcarTodasComoLidas();
    await carregarDados();
    toast.success("Todas as notificações foram marcadas como lidas!");
  };

  const handleExcluir = async (id: string) => {
    await notificationsService.excluirNotificacao(id);
    await carregarDados();
  };

  const iconeNotif = (tipo: TipoNotificacao) => {
    switch (tipo) {
      case "nova_oportunidade":
        return <Sparkles className="size-4 text-primary" />;
      case "lead_em_risco":
      case "tarefa_atrasada":
        return <AlertTriangle className="size-4 text-amber-400" />;
      case "workflow_executado":
        return <Zap className="size-4 text-emerald-400" />;
      case "reuniao_proxima":
        return <Calendar className="size-4 text-primary" />;
      default:
        return <Bell className="size-4 text-muted-foreground" />;
    }
  };

  return (
    <AppShell
      titulo="Central de Notificações & Alertas"
      descricao="Avisos em tempo real sobre leads em risco, oportunidades quentes, reuniões e automações"
      acoes={
        totalNaoLidas > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleMarcarTodasLidas}
            className="h-8 text-xs gap-1.5 border-border/80"
          >
            <CheckCircle2 className="size-3.5 text-emerald-400" />
            <span>Marcar todas como lidas</span>
          </Button>
        )
      }
    >
      {carregando && notificacoes.length === 0 ? (
        <TimelineSkeleton itens={5} />
      ) : (
        <div className="space-y-4 max-w-4xl animate-fade-in">
          {/* ABAS DE FILTRO */}
          <Card className="bg-card border-border/80 shadow-elev">
          <CardContent className="p-3.5 flex items-center justify-between gap-3 overflow-x-auto">
            <div className="flex items-center gap-1">
              {[
                { id: "todas", rotulo: `Todas (${notificacoes.length})` },
                { id: "nao_lidas", rotulo: `Não Lidas (${totalNaoLidas})` },
                { id: "oportunidades", rotulo: "Oportunidades" },
                { id: "riscos", rotulo: "Riscos & Alertas" },
                { id: "workflows", rotulo: "Automações" },
              ].map((aba) => (
                <button
                  key={aba.id}
                  type="button"
                  onClick={() => setFiltroAba(aba.id)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all whitespace-nowrap",
                    filtroAba === aba.id
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {aba.rotulo}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* LISTA DE NOTIFICAÇÕES */}
        <div className="space-y-2.5">
          {notificacoesFiltradas.map((n) => (
            <Card
              key={n.id}
              className={cn(
                "bg-card border-border/80 p-4 transition-all hover:border-primary/40 flex items-start justify-between gap-4 shadow-elev",
                !n.lida && "bg-primary/5 border-primary/30 ring-1 ring-primary/20",
              )}
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <div className="size-9 rounded-xl bg-surface border border-border/70 flex items-center justify-center shrink-0 mt-0.5">
                  {iconeNotif(n.tipo)}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs sm:text-sm text-foreground">{n.titulo}</h4>
                    {!n.lida && (
                      <span className="size-2 rounded-full bg-primary animate-pulse shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{n.mensagem}</p>

                  <span className="text-[10px] text-muted-foreground/80 dado font-mono flex items-center gap-1 pt-1">
                    <Clock className="size-2.5" />
                    {new Date(n.criado_em).toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {n.link && (
                  <Button
                    size="sm"
                    asChild
                    onClick={() => handleMarcarLida(n.id)}
                    className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-2.5 gap-1"
                  >
                    <Link to={n.link as any}>
                      <span>Acessar</span>
                      <ArrowRight className="size-3" />
                    </Link>
                  </Button>
                )}

                {!n.lida && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleMarcarLida(n.id)}
                    className="size-7 text-muted-foreground hover:text-foreground"
                    title="Marcar como lida"
                  >
                    <CheckCircle2 className="size-3.5" />
                  </Button>
                )}

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setNotificacaoParaExcluir(n)}
                  className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Excluir notificação"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </Card>
          ))}

          {notificacoesFiltradas.length === 0 && !carregando && (
            <div className="py-16 text-center space-y-2 bg-card/40 rounded-2xl border border-dashed border-border/70 p-8">
              <Bell className="size-8 text-muted-foreground/40 mx-auto" />
              <p className="text-sm font-semibold text-foreground">Nenhuma notificação</p>
              <p className="text-xs text-muted-foreground">Você está com tudo em dia.</p>
            </div>
          )}
        </div>
      </div>
      )}

      {/* DIÁLOGO DE EXCLUSÃO DE NOTIFICAÇÃO */}
      <ConfirmDeleteDialog
        open={Boolean(notificacaoParaExcluir)}
        onOpenChange={(open) => !open && setNotificacaoParaExcluir(null)}
        titulo="Excluir Notificação?"
        descricao="Este alerta será removido permanentemente da sua central de notificações."
        itemNome={notificacaoParaExcluir ? `${notificacaoParaExcluir.titulo}` : undefined}
        carregando={excluindoNotif}
        onConfirmar={async () => {
          if (!notificacaoParaExcluir) return;
          setExcluindoNotif(true);
          try {
            await notificationsService.excluirNotificacao(notificacaoParaExcluir.id);
            toast.success("Notificação removida!");
            await carregarDados();
            setNotificacaoParaExcluir(null);
          } finally {
            setExcluindoNotif(false);
          }
        }}
      />
    </AppShell>
  );
}
