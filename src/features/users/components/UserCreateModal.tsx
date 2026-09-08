import { useState } from "react";
import { UserPlus, Shield, User, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface UserCreateModalProps {
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  onCriar: (dados: {
    nome: string;
    email: string;
    papel: "admin" | "vendedor";
    senhaProvisoria?: string;
  }) => Promise<void>;
}

export function UserCreateModal({ aberto, onOpenChange, onCriar }: UserCreateModalProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senhaProvisoria, setSenhaProvisoria] = useState(
    () => `Meridian@${Math.floor(1000 + Math.random() * 9000)}`,
  );
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim().toLowerCase();
    const senhaLimpa = senhaProvisoria.trim();

    if (!nomeLimpo || !emailLimpo) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    if (nomeLimpo.length < 2) {
      toast.error("Nome inválido", {
        description: "O nome deve conter pelo menos 2 caracteres.",
      });
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailLimpo)) {
      toast.error("E-mail corporativo inválido", {
        description: "Por favor, insira um endereço de e-mail válido (ex: nome@empresa.com).",
      });
      return;
    }

    if (senhaLimpa.length < 8) {
      toast.error("Senha provisória insegura", {
        description:
          "A senha provisória deve conter no mínimo 8 caracteres para proteção da conta.",
      });
      return;
    }

    setSalvando(true);
    try {
      await onCriar({
        nome: nomeLimpo,
        email: emailLimpo,
        papel: "admin",
        senhaProvisoria: senhaLimpa,
      });
      setNome("");
      setEmail("");
      setSenhaProvisoria(`Meridian@${Math.floor(1000 + Math.random() * 9000)}`);
      onOpenChange(false);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base flex items-center gap-2">
            <UserPlus className="size-4 text-primary" />
            Cadastrar Novo Membro na Equipe
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            O novo membro receberá uma senha provisória e definirá a senha definitiva no primeiro
            acesso.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="usr-nome" className="text-xs font-semibold text-foreground">
              Nome Completo *
            </Label>
            <Input
              id="usr-nome"
              placeholder="Ex: Carlos Oliveira"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="text-xs h-9 bg-surface/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="usr-email" className="text-xs font-semibold text-foreground">
              E-mail Corporativo *
            </Label>
            <Input
              id="usr-email"
              type="email"
              placeholder="carlos@meridiantech.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-xs h-9 bg-surface/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="usr-senha" className="text-xs font-semibold text-foreground">
              Senha Provisória
            </Label>
            <Input
              id="usr-senha"
              value={senhaProvisoria}
              onChange={(e) => setSenhaProvisoria(e.target.value)}
              className="text-xs h-9 bg-surface/50 font-mono"
            />
            <p className="text-[10px] text-muted-foreground">
              O operador cadastrado terá acesso administrativo pleno ao seu próprio workspace
              privativo.
            </p>
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 gap-1.5 font-semibold"
            >
              {salvando ? "Cadastrando..." : "Cadastrar Membro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
