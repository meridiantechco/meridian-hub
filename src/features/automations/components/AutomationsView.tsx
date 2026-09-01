import { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Zap,
  Plus,
  ArrowRight,
  CheckCircle2,
  Trash2,
  Sparkles,
  Layers,
  Clock,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import { automationsService } from "../services/automationsService";
import { WorkflowModal } from "./WorkflowModal";
import type { WorkflowRegra } from "../types";
import { cn } from "@/lib/utils";

export function AutomationsView() {
  const [workflows, setWorkflows] = useState<WorkflowRegra[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const lista = await automationsService.listarWorkflows();
      setWorkflows(lista);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    void carregarDados();
  }, []);

  const totalAtivos = useMemo(
    () => workflows.filter((w) => w.ativo).length,
    [workflows],
  );

  const totalExecucoes = useMemo(
    () => workflows.reduce((acc, w) => acc + w.execucoesTotal, 0),
    [workflows],
  );

  const handleAlternarAtivo = async (id: string) => {
    await automationsService.alternarAtivo(id);
    await carregarDados();
    toast.success("Status do workflow atualizado!");
  };

  const handleExcluir = async (id: string) => {
    if (window.confirm("Deseja excluir esta regra de automação?")) {
      await automationsService.excluirWorkflow(id);
      await carregarDados();
      toast.success("Workflow removido.");
    }
  };

  const handleSalvar = async (dados: Omit<WorkflowRegra, "id" | "criado_em" | "execucoesTotal">) => {
    await automationsService.salvarWorkflow(dados);
    await carregarDados();
  };

  return (
    <AppShell
      titulo="Automações & Workflows Comerciais"
      descricao="Regras de execução autônoma para follow-ups, gatilhos de pontuação e transição de funil"
      acoes={
        <Button
          onClick={() => setModalAberto(true)}
          size="sm"
          className="h-8.5 px-3.5 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
        >
          <Plus className="size-3.5" />
          <span>Criar Automação</span>
        </Button>
      }
    >
      <div className="space-y-6 max-w-5xl">
        {/* CARDS RESUMO */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-card border-primary/30 shadow-elev p-4 space-y-1 ring-1 ring-primary/20">
            <div className="flex items-center justify-between">
              <span className="rotulo text-[10px] text-primary font-bold">Workflows Ativos</span>
              <Zap className="size-4 text-primary fill-current" />
            </div>
            <p className="text-2xl font-bold font-display dado text-primary">
              {totalAtivos} de {workflows.length}
            </p>
            <p className="text-[11px] text-muted-foreground">Executando em segundo plano</p>
          </Card>

          <Card className="bg-card border-emerald-500/30 shadow-elev p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="rotulo text-[10px] text-emerald-400 font-bold">Ações Disparadas</span>
              <CheckCircle2 className="size-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold font-display dado text-emerald-400">
              {totalExecucoes} vezes
            </p>
            <p className="text-[11px] text-muted-foreground">Follow-ups e tarefas geradas</p>
          </Card>

          <Card className="bg-card border-border/80 shadow-elev p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="rotulo text-[10px] text-muted-foreground">Tempo Economizado</span>
              <Clock className="size-4 text-primary" />
            </div>
            <p className="text-2xl font-bold font-display dado text-foreground">
              ~{Math.round((totalExecucoes * 8) / 60)}h / mês
            </p>
            <p className="text-[11px] text-muted-foreground">Em tarefas manuais repetitivas</p>
          </Card>
        </div>

        {/* LISTA DE WORKFLOWS EM CARDS VISUAIS */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider rotulo">
            Regras Comerciais em Execução
          </h3>

          <div className="space-y-3.5">
            {workflows.map((wf) => (
              <Card
                key={wf.id}
                className={cn(
                  "bg-card border-border/80 p-4 space-y-3.5 shadow-elev transition-all hover:border-primary/40",
                  !wf.ativo && "opacity-60 bg-surface/20",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-lg bg-primary/20 text-primary">
                        <Zap className="size-3.5" />
                      </span>
                      <h4 className="font-bold text-sm text-foreground">{wf.titulo}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-8">
                      {wf.descricao}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">
                        {wf.ativo ? "Ativo" : "Pausado"}
                      </span>
                      <Switch
                        checked={wf.ativo}
                        onCheckedChange={() => handleAlternarAtivo(wf.id)}
                      />
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleExcluir(wf.id)}
                      className="size-7 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* DIAGRAMA VISUAL DO WORKFLOW (QUANDO -> SE -> ENTÃO) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 p-3 rounded-xl bg-surface/50 border border-border/60 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[9.5px] font-bold text-primary block rotulo">
                      1. QUANDO (Trigger)
                    </span>
                    <p className="font-semibold text-foreground text-[11px]">{wf.triggerTexto}</p>
                  </div>

                  <div className="space-y-0.5 border-t md:border-t-0 md:border-l border-border/50 pt-2 md:pt-0 md:pl-2.5">
                    <span className="text-[9.5px] font-bold text-amber-400 block rotulo">
                      2. SE (Condition)
                    </span>
                    <p className="font-semibold text-foreground text-[11px]">{wf.condicaoTexto}</p>
                  </div>

                  <div className="space-y-0.5 border-t md:border-t-0 md:border-l border-border/50 pt-2 md:pt-0 md:pl-2.5">
                    <span className="text-[9.5px] font-bold text-emerald-400 block rotulo">
                      3. ENTÃO (Action)
                    </span>
                    <p className="font-semibold text-foreground text-[11px]">{wf.actionTexto}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
                  <span>
                    Disparado automaticamente <strong className="text-foreground">{wf.execucoesTotal} vezes</strong>
                  </span>
                  <span className="dado font-mono">
                    Criado em: {new Date(wf.criado_em).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL WORKFLOW BUILDER */}
      <WorkflowModal
        aberto={modalAberto}
        onOpenChange={setModalAberto}
        onSalvar={handleSalvar}
      />
    </AppShell>
  );
}
