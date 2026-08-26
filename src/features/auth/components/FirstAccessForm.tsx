import { Loader2, Mail, KeyRound, Lock, ShieldCheck } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FirstAccessFormProps {
  email: string;
  setEmail: (val: string) => void;
  senhaProvisoria: string;
  setSenhaProvisoria: (val: string) => void;
  senhaDefinitiva: string;
  setSenhaDefinitiva: (val: string) => void;
  confirmarSenhaDefinitiva: string;
  setConfirmarSenhaDefinitiva: (val: string) => void;
  carregando: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function FirstAccessForm({
  email,
  setEmail,
  senhaProvisoria,
  setSenhaProvisoria,
  senhaDefinitiva,
  setSenhaDefinitiva,
  confirmarSenhaDefinitiva,
  setConfirmarSenhaDefinitiva,
  carregando,
  onSubmit,
}: FirstAccessFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 pt-2">
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-primary">
        <p className="font-semibold mb-0.5 flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4" />
          Ativação de Convite
        </p>
        <p>
          Utilize a <strong>senha provisória</strong> enviada pelo administrador para definir sua senha permanente de acesso.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email-primeiro-acesso">Seu e-mail cadastrado</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="email-primeiro-acesso"
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
        <Label htmlFor="senha-provisoria">Senha provisória recebida</Label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="senha-provisoria"
            type="password"
            placeholder="••••••••"
            className="pl-9 font-mono"
            value={senhaProvisoria}
            onChange={(e) => setSenhaProvisoria(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="senha-definitiva">Nova senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="senha-definitiva"
              type="password"
              placeholder="Mínimo 6 caracteres"
              className="pl-9 text-xs"
              value={senhaDefinitiva}
              onChange={(e) => setSenhaDefinitiva(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmar-senha-definitiva">Confirmar nova senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmar-senha-definitiva"
              type="password"
              placeholder="Repita a nova senha"
              className="pl-9 text-xs"
              value={confirmarSenhaDefinitiva}
              onChange={(e) => setConfirmarSenhaDefinitiva(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={carregando}>
        {carregando ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Atualizando credenciais...
          </>
        ) : (
          "Definir Senha e Entrar"
        )}
      </Button>
    </form>
  );
}
