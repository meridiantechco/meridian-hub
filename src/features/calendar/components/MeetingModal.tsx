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
import { Calendar, Video, Clock } from "lucide-react";
import { toast } from "sonner";
import type { ReuniaoItem } from "../types";

interface MeetingModalProps {
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  onSalvar: (dados: Omit<ReuniaoItem, "id" | "criado_em">) => Promise<void>;
}

export function MeetingModal({ aberto, onOpenChange, onSalvar }: MeetingModalProps) {
  const [titulo, setTitulo] = useState("");
  const [empresaNome, setEmpresaNome] = useState("");
  const [contatoNome, setContatoNome] = useState("");
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [horario, setHorario] = useState("14:00");
  const [duracaoMinutos, setDuracaoMinutos] = useState(30);
  const [local, setLocal] = useState("Google Meet");
  const [linkReuniao, setLinkReuniao] = useState("");
  const [pauta, setPauta] = useState("");
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !empresaNome.trim()) {
      toast.error("Preencha o título e o nome da empresa.");
      return;
    }

    setSalvando(true);
    try {
      await onSalvar({
        titulo: titulo.trim(),
        empresa_nome: empresaNome.trim(),
        contato_nome: contatoNome.trim() || null,
        data,
        horario,
        duracao_minutos: duracaoMinutos,
        local: local.trim() || "Online",
        link_reuniao: linkReuniao.trim() || null,
        pauta: pauta.trim() || null,
        notas: null,
        status: "agendada",
      });
      onOpenChange(false);
      setTitulo("");
      setEmpresaNome("");
      setLinkReuniao("");
      setPauta("");
      toast.success("Reunião agendada com sucesso!");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Calendar className="size-4 text-primary" />
            Agendar Reunião / Demonstração
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Marque reuniões comerciais, apresentações de proposta e alinhamentos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
          <div className="space-y-1">
            <Label htmlFor="mt-titulo" className="text-xs font-semibold text-foreground">
              Título da Reunião *
            </Label>
            <Input
              id="mt-titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Demonstração de Proposta de Site"
              className="text-xs h-8.5 bg-surface/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="mt-empresa" className="text-xs font-semibold text-foreground">
                Empresa *
              </Label>
              <Input
                id="mt-empresa"
                value={empresaNome}
                onChange={(e) => setEmpresaNome(e.target.value)}
                placeholder="Ex: Restaurante Porto"
                className="text-xs h-8.5 bg-surface/50"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="mt-contato" className="text-xs font-semibold text-foreground">
                Participante / Decisor
              </Label>
              <Input
                id="mt-contato"
                value={contatoNome}
                onChange={(e) => setContatoNome(e.target.value)}
                placeholder="Ex: Carlos (Sócio)"
                className="text-xs h-8.5 bg-surface/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="space-y-1">
              <Label htmlFor="mt-data" className="text-xs font-semibold text-foreground">
                Data
              </Label>
              <Input
                id="mt-data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="text-xs h-8.5 bg-surface/50"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="mt-hora" className="text-xs font-semibold text-foreground">
                Horário
              </Label>
              <Input
                id="mt-hora"
                type="time"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                className="text-xs h-8.5 bg-surface/50"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="mt-dur" className="text-xs font-semibold text-foreground">
                Duração (min)
              </Label>
              <Input
                id="mt-dur"
                type="number"
                value={duracaoMinutos}
                onChange={(e) => setDuracaoMinutos(Number(e.target.value))}
                className="text-xs h-8.5 bg-surface/50 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="mt-local" className="text-xs font-semibold text-foreground">
                Formato / Local
              </Label>
              <Input
                id="mt-local"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                placeholder="Google Meet, Presencial..."
                className="text-xs h-8.5 bg-surface/50"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="mt-link" className="text-xs font-semibold text-foreground">
                Link da Videochamada
              </Label>
              <Input
                id="mt-link"
                value={linkReuniao}
                onChange={(e) => setLinkReuniao(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="text-xs h-8.5 bg-surface/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="mt-pauta" className="text-xs font-semibold text-foreground">
              Pauta / Tópicos da Apresentação
            </Label>
            <Textarea
              id="mt-pauta"
              value={pauta}
              onChange={(e) => setPauta(e.target.value)}
              placeholder="Demonstrar cases do nicho, proposta de valor, investimento..."
              className="text-xs min-h-[50px] bg-surface/50 resize-none"
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
              {salvando ? "Agendando..." : "Confirmar Reunião"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
