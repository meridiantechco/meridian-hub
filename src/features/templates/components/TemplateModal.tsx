import { useState, useEffect, useRef } from "react";
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
import { MessageSquare, Sparkles, Tag } from "lucide-react";
import { toast } from "sonner";
import type { TemplateMensagem, CategoriaTemplate } from "../types";

interface TemplateModalProps {
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  templateParaEditar?: TemplateMensagem | null;
  onSalvar: (dados: Omit<TemplateMensagem, "id" | "variaveisSuportadas">) => Promise<void>;
}

export function TemplateModal({
  aberto,
  onOpenChange,
  templateParaEditar,
  onSalvar,
}: TemplateModalProps) {
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState<CategoriaTemplate>("primeiro_contato");
  const [canal, setCanal] = useState<"whatsapp" | "email">("whatsapp");
  const [texto, setTexto] = useState("");
  const [salvando, setSalvando] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (templateParaEditar) {
      setTitulo(templateParaEditar.titulo);
      setCategoria(templateParaEditar.categoria);
      setCanal(templateParaEditar.canal);
      setTexto(templateParaEditar.texto);
    } else {
      setTitulo("");
      setCategoria("primeiro_contato");
      setCanal("whatsapp");
      setTexto("");
    }
  }, [templateParaEditar, aberto]);

  const inserirVariavel = (tag: string) => {
    const el = textareaRef.current;
    if (!el) {
      setTexto((prev) => prev + " " + tag);
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const novoTexto = texto.substring(0, start) + tag + texto.substring(end);
    setTexto(novoTexto);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + tag.length, start + tag.length);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !texto.trim()) {
      toast.error("Preencha o título e o texto do script.");
      return;
    }

    setSalvando(true);
    try {
      await onSalvar({
        titulo: titulo.trim(),
        categoria,
        canal,
        texto: texto.trim(),
      });
      onOpenChange(false);
      toast.success(templateParaEditar ? "Script atualizado!" : "Novo script cadastrado!");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="size-4 text-primary" />
            {templateParaEditar ? "Editar Script Comercial" : "Novo Script de Mensagem"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure o texto padrão e utilize variáveis dinâmicas para automação
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
          <div className="space-y-1">
            <Label htmlFor="tpl-titulo" className="text-xs font-semibold text-foreground">
              Título do Script *
            </Label>
            <Input
              id="tpl-titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Abordagem Inicial — Restaurantes"
              className="text-xs h-8.5 bg-surface/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="tpl-cat" className="text-xs font-semibold text-foreground">
                Categoria / Etapa
              </Label>
              <Select
                value={categoria}
                onValueChange={(val) => setCategoria(val as CategoriaTemplate)}
              >
                <SelectTrigger id="tpl-cat" className="text-xs h-8.5 bg-surface/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primeiro_contato">Primeiro Contato</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="proposta">Proposta Comercial</SelectItem>
                  <SelectItem value="pos_reuniao">Pós-Reunião</SelectItem>
                  <SelectItem value="reativacao">Reativação de Conta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="tpl-canal" className="text-xs font-semibold text-foreground">
                Canal de Disparo
              </Label>
              <Select
                value={canal}
                onValueChange={(val) => setCanal(val as "whatsapp" | "email")}
              >
                <SelectTrigger id="tpl-canal" className="text-xs h-8.5 bg-surface/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* CHIPS DE VARIÁVEIS DINÂMICAS */}
          <div className="space-y-1.5 p-2.5 rounded-xl bg-surface/50 border border-border/70">
            <span className="text-[10px] font-bold text-muted-foreground uppercase rotulo flex items-center gap-1">
              <Tag className="size-3 text-primary" />
              Clique para inserir variável no texto:
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { tag: "{nome}", desc: "Nome do Decisor" },
                { tag: "{empresa}", desc: "Nome da Conta" },
                { tag: "{segmento}", desc: "Nicho Comercial" },
                { tag: "{responsavel}", desc: "Seu Nome" },
              ].map((item) => (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => inserirVariavel(item.tag)}
                  className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-card border border-border hover:border-primary/50 text-foreground hover:text-primary transition-colors cursor-pointer"
                  title={item.desc}
                >
                  {item.tag}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="tpl-texto" className="text-xs font-semibold text-foreground">
              Texto da Mensagem *
            </Label>
            <Textarea
              id="tpl-texto"
              ref={textareaRef}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Digite o modelo de mensagem. Use as tags acima para personalizar automaticamente..."
              className="text-xs min-h-[120px] bg-surface/50 leading-relaxed resize-none"
              required
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
              {salvando ? "Salvando..." : templateParaEditar ? "Salvar Alterações" : "Criar Script"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
