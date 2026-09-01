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
import { UserPlus, Building2 } from "lucide-react";
import { toast } from "sonner";
import type { ContatoItem } from "../types";

interface ContactModalProps {
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  contatoParaEditar?: ContatoItem | null;
  onSalvar: (dados: Omit<ContatoItem, "id" | "criado_em">) => Promise<void>;
}

export function ContactModal({
  aberto,
  onOpenChange,
  contatoParaEditar,
  onSalvar,
}: ContactModalProps) {
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [empresaNome, setEmpresaNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (contatoParaEditar) {
      setNome(contatoParaEditar.nome);
      setCargo(contatoParaEditar.cargo);
      setEmpresaNome(contatoParaEditar.empresa_nome);
      setTelefone(contatoParaEditar.telefone || "");
      setEmail(contatoParaEditar.email || "");
      setLinkedin(contatoParaEditar.linkedin || "");
      setObservacoes(contatoParaEditar.observacoes || "");
    } else {
      setNome("");
      setCargo("Proprietário / Decisor");
      setEmpresaNome("");
      setTelefone("");
      setEmail("");
      setLinkedin("");
      setObservacoes("");
    }
  }, [contatoParaEditar, aberto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !empresaNome.trim()) {
      toast.error("Preencha o nome do contato e o nome da empresa.");
      return;
    }

    setSalvando(true);
    try {
      await onSalvar({
        nome: nome.trim(),
        cargo: cargo.trim() || "Decisor",
        empresa_nome: empresaNome.trim(),
        empresa_id: contatoParaEditar?.empresa_id || null,
        telefone: telefone.trim() || null,
        whatsapp: telefone.trim() || null,
        email: email.trim() || null,
        linkedin: linkedin.trim() || null,
        observacoes: observacoes.trim() || null,
      });
      onOpenChange(false);
      toast.success(contatoParaEditar ? "Contato atualizado!" : "Novo contato cadastrado!");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <UserPlus className="size-4 text-primary" />
            {contatoParaEditar ? "Editar Contato" : "Novo Contato Comercial"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Cadastre tomadores de decisão, sócios e contatos operacionais
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
          <div className="space-y-1">
            <Label htmlFor="ct-nome" className="text-xs font-semibold text-foreground">
              Nome do Contato *
            </Label>
            <Input
              id="ct-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Roberto Almeida"
              className="text-xs h-8.5 bg-surface/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="ct-cargo" className="text-xs font-semibold text-foreground">
                Cargo / Função
              </Label>
              <Input
                id="ct-cargo"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Ex: Diretor Geral"
                className="text-xs h-8.5 bg-surface/50"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="ct-empresa" className="text-xs font-semibold text-foreground">
                Empresa *
              </Label>
              <Input
                id="ct-empresa"
                value={empresaNome}
                onChange={(e) => setEmpresaNome(e.target.value)}
                placeholder="Ex: Restaurante Porto"
                className="text-xs h-8.5 bg-surface/50"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="ct-tel" className="text-xs font-semibold text-foreground">
                Telefone / WhatsApp
              </Label>
              <Input
                id="ct-tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(71) 99999-0000"
                className="text-xs h-8.5 bg-surface/50 font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="ct-email" className="text-xs font-semibold text-foreground">
                E-mail Corporativo
              </Label>
              <Input
                id="ct-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@empresa.com"
                className="text-xs h-8.5 bg-surface/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="ct-obs" className="text-xs font-semibold text-foreground">
              Anotações de Relacionamento
            </Label>
            <Textarea
              id="ct-obs"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Preferência de horário, canal preferido, poder de decisão..."
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
              {salvando ? "Salvando..." : "Salvar Contato"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
