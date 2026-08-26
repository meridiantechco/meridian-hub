import { Loader2, Mail, Lock, CheckCircle2 } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginFormProps {
  email: string;
  setEmail: (val: string) => void;
  senha: string;
  setSenha: (val: string) => void;
  carregando: boolean;
  onSubmit: (e: React.FormEvent) => void;
  emailConfirmacaoPendente: string | null;
  onReenviarConfirmacao: (email: string) => void;
}

export function LoginForm({
  email,
  setEmail,
  senha,
  setSenha,
  carregando,
  onSubmit,
  emailConfirmacaoPendente,
  onReenviarConfirmacao,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 pt-2">
      {emailConfirmacaoPendente && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
          <p className="font-semibold mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" />
            Confirmação pendente
          </p>
          <p className="mb-2">
            Enviamos um link de confirmação para <strong>{emailConfirmacaoPendente}</strong>.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full text-xs h-8 border-amber-500/40 hover:bg-amber-500/20"
            disabled={carregando}
            onClick={() => onReenviarConfirmacao(emailConfirmacaoPendente)}
          >
            Reenviar e-mail de confirmação
          </Button>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email-login">E-mail corporativo</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="email-login"
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
        <Label htmlFor="senha-login">Senha</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="senha-login"
            type="password"
            placeholder="••••••••"
            className="pl-9"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={carregando}>
        {carregando ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Autenticando...
          </>
        ) : (
          "Acessar Meridian Hub"
        )}
      </Button>
    </form>
  );
}
