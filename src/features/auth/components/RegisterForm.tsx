import { Loader2, Mail, Lock, User } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RegisterFormProps {
  nome: string;
  setNome: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  senha: string;
  setSenha: (val: string) => void;
  carregando: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function RegisterForm({
  nome,
  setNome,
  email,
  setEmail,
  senha,
  setSenha,
  carregando,
  onSubmit,
}: RegisterFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label htmlFor="nome-novo">Nome completo</Label>
        <div className="relative">
          <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="nome-novo"
            type="text"
            placeholder="Ex: Amanda Silva"
            className="pl-9"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            autoComplete="name"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email-novo">E-mail corporativo</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="email-novo"
            type="email"
            placeholder="seu.email@empresa.com"
            className="pl-9"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="senha-nova">Criar senha</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="senha-nova"
            type="password"
            placeholder="Mínimo 6 caracteres"
            className="pl-9"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={carregando}>
        {carregando ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Criando conta...
          </>
        ) : (
          "Criar Conta no Meridian Hub"
        )}
      </Button>
    </form>
  );
}
