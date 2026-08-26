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
  const [papel, setPapel] = useState<"admin" | "vendedor">("vendedor");
  const [senhaProvisoria, setSenhaProvisoria] = useState(
    () => `Meridian@${Math.floor(1000 + Math.random() * 9000)}`,
  );
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setSalvando(true);
    try {
      await onCriar({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        papel,
        senhaProvisoria,
      });
      setNome("");
      setEmail("");
      setPapel("vendedor");
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
            O novo membro receberá uma senha provisória e definirá a senha definitiva no primeiro acesso.
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="usr-papel" className="text-xs font-semibold text-foreground">
                Nível de Acesso *
              </Label>
              <Select value={papel} onValueChange={(val) => setPapel(val as "admin" | "vendedor")}>
                <SelectTrigger id="usr-papel" className="text-xs h-9 bg-surface/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendedor">
                    <span className="flex items-center gap-1.5">
                      <User className="size-3 text-muted-foreground" /> Vendedor / SDR
                    </span>
                  </SelectItem>
                  <SelectItem value="admin">
                    <span className="flex items-center gap-1.5">
                      <Shield className="size-3 text-primary" /> Administrador
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
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
