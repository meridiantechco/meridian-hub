import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Zap, ArrowDown, Play } from "lucide-react";
import { toast } from "sonner";
import type { WorkflowRegra, TriggerTipo, ActionTipo } from "../types";

interface WorkflowModalProps {
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  onSalvar: (dados: Omit<WorkflowRegra, "id" | "criado_em" | "execucoesTotal">) => Promise<void>;
}

export function WorkflowModal({ aberto, onOpenChange, onSalvar }: WorkflowModalProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [trigger, setTrigger] = useState<TriggerTipo>("status_alterado_proposta");
  const [condicaoTexto, setCondicaoTexto] = useState("Esperar 3 dias sem nova interação");
  const [action, setAction] = useState<ActionTipo>("criar_tarefa_followup");
  const [salvando, setSalvando] = useState(false);

  const triggersMap: Record<TriggerTipo, string> = {
    status_alterado_proposta: "Lead avança para estágio de Proposta",
    lead_criado: "Novo lead minerado na base",
    score_maior_80: "Lead com Score > 80 detectado",
    sem_contato_3_dias: "3 dias sem contato com a conta",
    reuniao_concluida: "Reunião concluída na agenda",
  };

  const actionsMap: Record<ActionTipo, string> = {
    criar_tarefa_followup: "Criar Tarefa de Follow-up para a Equipe",
    marcar_alta_prioridade: "Elevar prioridade no Opportunity Center",
    notificar_equipe: "Enviar notificação de alerta prioritário",
    enviar_whatsapp_padrao: "Preparar template WhatsApp para disparo",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      toast.error("Informe o nome do workflow.");
      return;
    }

    setSalvando(true);
    try {
      await onSalvar({
        titulo: titulo.trim(),
        descricao: descricao.trim() || "Regra comercial automatizada",
        trigger,
        triggerTexto: triggersMap[trigger],
        condicaoTexto: condicaoTexto.trim(),
        action,
        actionTexto: actionsMap[action],
        ativo: true,
      });
      onOpenChange(false);
      setTitulo("");
      setDescricao("");
      toast.success("Novo workflow ativado com sucesso!");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Zap className="size-4 text-primary" />
            Criar Automação Comercial (Workflow)
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure gatilhos, condições e ações automáticas no CRM
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
          <div className="space-y-1">
            <Label htmlFor="wf-nome" className="text-xs font-semibold text-foreground">
              Nome da Automação *
            </Label>
            <Input
              id="wf-nome"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Alerta de Follow-up de Proposta"
              className="text-xs h-8.5 bg-surface/50"
              required
            />
          </div>

          {/* VISUAL BUILDER: QUANDO -> SE -> ENTÃO */}
          <div className="p-3.5 rounded-xl bg-surface/50 border border-border/70 space-y-3">
            {/* 1. GATILHO (QUANDO) */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-primary uppercase rotulo">
                1. Gatilho (Quando)
              </span>
              <Select value={trigger} onValueChange={(val) => setTrigger(val as TriggerTipo)}>
                <SelectTrigger className="text-xs h-8 bg-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="status_alterado_proposta">
                    Lead avança para Proposta
                  </SelectItem>
                  <SelectItem value="score_maior_80">Lead com Score &gt; 80 detectado</SelectItem>
                  <SelectItem value="reuniao_concluida">Reunião concluída na agenda</SelectItem>
                  <SelectItem value="lead_criado">Novo lead minerado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center text-muted-foreground">
              <ArrowDown className="size-3.5" />
            </div>

            {/* 2. CONDIÇÃO (SE) */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase rotulo">
                2. Condição (Se)
              </span>
              <Input
                value={condicaoTexto}
                onChange={(e) => setCondicaoTexto(e.target.value)}
                placeholder="Ex: Esperar 3 dias sem nova interação"
                className="text-xs h-8 bg-card border-border"
                required
              />
            </div>

            <div className="flex justify-center text-muted-foreground">
              <ArrowDown className="size-3.5" />
            </div>

            {/* 3. AÇÃO (ENTÃO) */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase rotulo">
                3. Ação Comercial (Então)
              </span>
              <Select value={action} onValueChange={(val) => setAction(val as ActionTipo)}>
                <SelectTrigger className="text-xs h-8 bg-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="criar_tarefa_followup">
                    Criar Tarefa de Follow-up
                  </SelectItem>
                  <SelectItem value="marcar_alta_prioridade">
                    Elevar Prioridade no Opportunity Center
                  </SelectItem>
                  <SelectItem value="notificar_equipe">
                    Enviar Notificação de Alerta
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-border flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={salvando}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 px-4"
            >
              {salvando ? "Criando..." : "Ativar Automação"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
