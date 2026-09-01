import { useState, useEffect } from "react";
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
import { CheckSquare, Calendar, Building2 } from "lucide-react";
import { toast } from "sonner";
import type { TarefaItem, PrioridadeTarefa, StatusTarefa } from "../types";

interface TaskModalProps {
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  tarefaParaEditar?: TarefaItem | null;
  empresaPreSelecionada?: { id: string; nome: string } | null;
  onSalvar: (dados: Omit<TarefaItem, "id" | "criado_em">) => Promise<void>;
}

export function TaskModal({
  aberto,
  onOpenChange,
  tarefaParaEditar,
  empresaPreSelecionada,
  onSalvar,
}: TaskModalProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prioridade, setPrioridade] = useState<PrioridadeTarefa>("media");
  const [status, setStatus] = useState<StatusTarefa>("pendente");
  const [prazo, setPrazo] = useState(new Date().toISOString().slice(0, 10));
  const [empresaNome, setEmpresaNome] = useState("");
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (tarefaParaEditar) {
      setTitulo(tarefaParaEditar.titulo);
      setDescricao(tarefaParaEditar.descricao || "");
      setPrioridade(tarefaParaEditar.prioridade);
      setStatus(tarefaParaEditar.status);
      setPrazo(tarefaParaEditar.prazo);
      setEmpresaNome(tarefaParaEditar.empresa_nome || "");
      setEmpresaId(tarefaParaEditar.empresa_id || null);
    } else if (empresaPreSelecionada) {
      setTitulo(`Ação comercial — ${empresaPreSelecionada.nome}`);
      setDescricao("");
      setPrioridade("alta");
      setStatus("pendente");
      setPrazo(new Date().toISOString().slice(0, 10));
      setEmpresaNome(empresaPreSelecionada.nome);
      setEmpresaId(empresaPreSelecionada.id);
    } else {
      setTitulo("");
      setDescricao("");
      setPrioridade("media");
      setStatus("pendente");
      setPrazo(new Date().toISOString().slice(0, 10));
      setEmpresaNome("");
      setEmpresaId(null);
    }
  }, [tarefaParaEditar, empresaPreSelecionada, aberto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      toast.error("Informe o título da tarefa.");
      return;
    }

    setSalvando(true);
    try {
      await onSalvar({
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        prioridade,
        status,
        prazo,
        empresa_id: empresaId,
        empresa_nome: empresaNome.trim() || null,
        responsavel: "Equipe Comercial",
      });
      onOpenChange(false);
      toast.success(tarefaParaEditar ? "Tarefa atualizada!" : "Nova tarefa criada!");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <CheckSquare className="size-4 text-primary" />
            {tarefaParaEditar ? "Editar Tarefa" : "Criar Nova Tarefa Operacional"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Defina prazos, prioridades e vincule à empresa correspondente
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
          <div className="space-y-1">
            <Label htmlFor="tsk-titulo" className="text-xs font-semibold text-foreground">
              Título da Tarefa *
            </Label>
            <Input
              id="tsk-titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Fazer follow-up com decisor..."
              className="text-xs h-8.5 bg-surface/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="tsk-prio" className="text-xs font-semibold text-foreground">
                Prioridade
              </Label>
              <Select
                value={prioridade}
                onValueChange={(val) => setPrioridade(val as PrioridadeTarefa)}
              >
                <SelectTrigger id="tsk-prio" className="text-xs h-8.5 bg-surface/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">⚪ Baixa</SelectItem>
                  <SelectItem value="media">🟡 Média</SelectItem>
                  <SelectItem value="alta">🟠 Alta</SelectItem>
                  <SelectItem value="urgente">🔴 Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="tsk-prazo" className="text-xs font-semibold text-foreground">
                Prazo Limite
              </Label>
              <Input
                id="tsk-prazo"
                type="date"
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
                className="text-xs h-8.5 bg-surface/50"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="tsk-empresa" className="text-xs font-semibold text-foreground">
              Empresa Relacionada (Opcional)
            </Label>
            <Input
              id="tsk-empresa"
              value={empresaNome}
              onChange={(e) => setEmpresaNome(e.target.value)}
              placeholder="Ex: Restaurante Porto"
              className="text-xs h-8.5 bg-surface/50"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="tsk-desc" className="text-xs font-semibold text-foreground">
              Descrição / Checklist
            </Label>
            <Textarea
              id="tsk-desc"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Instruções para a equipe, tópicos a alinhar..."
              className="text-xs min-h-[60px] bg-surface/50 resize-none"
            />
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
              {salvando ? "Salvando..." : "Salvar Tarefa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
