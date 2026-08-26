import { Loader2, Lock, UserCheck } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ForcePasswordFormProps {
  usuarioPrimeiroLogin: any;
  senhaDefinitiva: string;
  setSenhaDefinitiva: (val: string) => void;
  confirmarSenhaDefinitiva: string;
  setConfirmarSenhaDefinitiva: (val: string) => void;
  carregando: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onLogout: () => void;
}

export function ForcePasswordForm({
  usuarioPrimeiroLogin,
  senhaDefinitiva,
  setSenhaDefinitiva,
  confirmarSenhaDefinitiva,
  setConfirmarSenhaDefinitiva,
  carregando,
  onSubmit,
  onLogout,
}: ForcePasswordFormProps) {
  return (
    <Card className="w-full max-w-md border-border/60 shadow-xl backdrop-blur-sm bg-card/95">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
          <UserCheck className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl font-bold">Primeiro Acesso — Definir Senha</CardTitle>
        <CardDescription>
          Olá, <strong>{usuarioPrimeiroLogin?.user_metadata?.["nome"] || usuarioPrimeiroLogin?.email}</strong>. Por segurança, você deve definir sua senha definitiva para continuar no Meridian Hub.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nova-senha-obrigatoria">Nova senha definitiva</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="nova-senha-obrigatoria"
                type="password"
                placeholder="Mínimo 6 caracteres"
                className="pl-9"
                value={senhaDefinitiva}
                onChange={(e) => setSenhaDefinitiva(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmar-senha-obrigatoria">Confirmar nova senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmar-senha-obrigatoria"
                type="password"
                placeholder="Repita a nova senha"
                className="pl-9"
                value={confirmarSenhaDefinitiva}
                onChange={(e) => setConfirmarSenhaDefinitiva(e.target.value)}
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
                Salvando e acessando...
              </>
            ) : (
              "Salvar Senha e Acessar Painel"
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-xs text-muted-foreground"
            onClick={onLogout}
          >
            Sair e voltar ao login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
