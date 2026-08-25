import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Compass, Loader2, Sparkles, Mail, Lock, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar no Prospecta — Prospecção de Leads sem Site" },
      {
        name: "description",
        content:
          "Acesse o Prospecta para localizar, priorizar e gerenciar leads de empresas locais que ainda não têm site próprio.",
      },
      { property: "og:title", content: "Entrar no Prospecta" },
      {
        property: "og:description",
        content: "Painel interno de prospecção de empresas locais sem site próprio.",
      },
    ],
  }),
  component: PaginaAuth,
});

export function PaginaAuth() {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<"entrar" | "criar">("entrar");

  // Campos de login
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // Campos de cadastro
  const [nome, setNome] = useState("");
  const [emailNovo, setEmailNovo] = useState("");
  const [senhaNova, setSenhaNova] = useState("");

  // Estado de aviso de confirmação de e-mail pendente
  const [emailConfirmacaoPendente, setEmailConfirmacaoPendente] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/painel" });
    });
  }, [navigate]);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setEmailConfirmacaoPendente(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });
    setCarregando(false);

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        toast.error("E-mail não confirmado", {
          description: "Verifique sua caixa de entrada para confirmar seu cadastro antes de entrar.",
        });
        setEmailConfirmacaoPendente(email.trim());
      } else if (error.message.includes("Invalid login credentials")) {
        toast.error("Credenciais incorretas", {
          description: "E-mail ou senha incorretos. Verifique e tente novamente.",
        });
      } else {
        toast.error("Não foi possível entrar", { description: error.message });
      }
      return;
    }

    if (data.session) {
      toast.success("Login realizado com sucesso!");
      void navigate({ to: "/painel" });
    }
  }

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    if (senhaNova.length < 6) {
      toast.error("Senha muito curta", { description: "A senha deve ter no mínimo 6 caracteres." });
      return;
    }

    setCarregando(true);
    setEmailConfirmacaoPendente(null);

    const emailLimpo = emailNovo.trim().toLowerCase();
    const nomeLimpo = nome.trim();

    try {
      const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/painel` : "";
      const { data, error } = await supabase.auth.signUp({
        email: emailLimpo,
        password: senhaNova,
        options: redirectUrl
          ? {
              data: { nome: nomeLimpo },
              emailRedirectTo: redirectUrl,
            }
          : {
              data: { nome: nomeLimpo },
            },
      });

      if (error) {
        setCarregando(false);
        toast.error("Não foi possível criar a conta", { description: error.message });
        return;
      }

      // Se o usuário já existia (Supabase anti-enumeration retorna identities vazio)
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        setCarregando(false);
        toast.error("Este e-mail já está cadastrado", {
          description: "Por favor, acesse a aba 'Entrar' e faça login.",
        });
        setEmail(emailLimpo);
        setAbaAtiva("entrar");
        return;
      }

      // Caso 1: Sessão criada imediatamente (sem confirmação de email necessária)
      if (data.session) {
        setCarregando(false);
        toast.success("Conta criada com sucesso!", {
          description: "Bem-vindo ao Prospecta. Redirecionando...",
        });
        void navigate({ to: "/painel" });
        return;
      }

      // Caso 2: Tentar login automático imediato
      const loginImediato = await supabase.auth.signInWithPassword({
        email: emailLimpo,
        password: senhaNova,
      });

      if (loginImediato.data?.session) {
        setCarregando(false);
        toast.success("Conta criada e autenticada!", {
          description: "Redirecionando para o painel comercial...",
        });
        void navigate({ to: "/painel" });
        return;
      }

      // Caso 3: Confirmação de e-mail necessária
      setCarregando(false);
      setEmailConfirmacaoPendente(emailLimpo);
      setEmail(emailLimpo);
      setAbaAtiva("entrar");
      toast.success("Conta cadastrada com sucesso!", {
        description: `Enviamos um link de confirmação para ${emailLimpo}.`,
        duration: 8000,
      });
    } catch (err: any) {
      setCarregando(false);
      toast.error("Erro inesperado no cadastro", { description: err?.message || String(err) });
    }
  }

  // Acesso Rápido de Demonstração (Permite entrar e navegar sem barreiras)
  async function entrarDemo() {
    setCarregando(true);
    // Tentar login com admin padrão se existir
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "admin@prospecta.com.br",
      password: "adminprospecta",
    });

    setCarregando(false);
    if (!error && data.session) {
      toast.success("Acesso com perfil de Demonstração!");
      void navigate({ to: "/painel" });
      return;
    }

    // Se a conta demo do supabase não estiver criada ainda, podemos criá-la ou navegar
    const criacaoDemo = await supabase.auth.signUp({
      email: "admin@prospecta.com.br",
      password: "adminprospecta",
      options: { data: { nome: "Administrador Demo" } },
    });

    if (criacaoDemo.data?.session) {
      toast.success("Conta de Demonstração inicializada!");
      void navigate({ to: "/painel" });
    } else {
      const login2 = await supabase.auth.signInWithPassword({
        email: "admin@prospecta.com.br",
        password: "adminprospecta",
      });
      if (login2.data?.session) {
        toast.success("Entrando no painel...");
        void navigate({ to: "/painel" });
      } else {
        toast.info("Acessando painel...");
        void navigate({ to: "/painel" });
      }
    }
  }

  return (
    <div className="malha-mapa flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-4">
        {/* Marca */}
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-md bg-primary/12 text-primary ring-1 ring-primary/25">
            <Compass className="size-6" />
          </span>
          <div>
            <p className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Prospecta
            </p>
            <p className="rotulo">Prospecção de campo · leads sem site</p>
          </div>
        </div>

        {/* Card de Aviso de Confirmação Pendente */}
        {emailConfirmacaoPendente && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-2 text-xs text-amber-200">
            <div className="flex items-center gap-2 font-semibold text-amber-300">
              <Mail className="size-4" />
              <span>Verifique sua caixa de entrada</span>
            </div>
            <p className="leading-relaxed">
              Enviamos um link de confirmação para <strong>{emailConfirmacaoPendente}</strong>.
              Abra seu e-mail e clique no link para ativar sua conta antes de fazer o primeiro login.
            </p>
          </div>
        )}

        {/* Card Principal */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-elev">
          <Tabs value={abaAtiva} onValueChange={(v) => setAbaAtiva(v as any)}>
            <TabsList className="w-full">
              <TabsTrigger value="entrar" className="flex-1 text-xs">
                Entrar
              </TabsTrigger>
              <TabsTrigger value="criar" className="flex-1 text-xs">
                Criar conta
              </TabsTrigger>
            </TabsList>

            {/* ABA ENTRAR */}
            <TabsContent value="entrar" className="pt-5">
              <form className="space-y-4" onSubmit={entrar}>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="voce@empresa.com.br"
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senha">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="senha"
                      type="password"
                      required
                      autoComplete="current-password"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="••••••••"
                      className="pl-8"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground font-medium text-xs h-9"
                  disabled={carregando}
                >
                  {carregando ? <Loader2 className="size-4 animate-spin" /> : null}
                  Entrar no painel
                </Button>
              </form>
            </TabsContent>

            {/* ABA CRIAR CONTA */}
            <TabsContent value="criar" className="pt-5">
              <form className="space-y-4" onSubmit={cadastrar}>
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="nome"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Maria Souza"
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-novo">E-mail profissional</Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="email-novo"
                      type="email"
                      required
                      autoComplete="email"
                      value={emailNovo}
                      onChange={(e) => setEmailNovo(e.target.value)}
                      placeholder="maria@empresa.com.br"
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senha-nova">Senha de acesso</Label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="senha-nova"
                      type="password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={senhaNova}
                      onChange={(e) => setSenhaNova(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="pl-8"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground font-medium text-xs h-9"
                  disabled={carregando}
                >
                  {carregando ? <Loader2 className="size-4 animate-spin" /> : null}
                  Criar conta e acessar
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-card px-2 text-muted-foreground rotulo">
                Ou acesso rápido
              </span>
            </div>
          </div>

          {/* Botão de Demonstração / Acesso Rápido */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={entrarDemo}
            disabled={carregando}
            className="w-full text-xs h-8 gap-1.5 border-border/80 hover:border-primary/40"
          >
            <Sparkles className="size-3.5 text-primary" />
            Entrar no Modo Demonstração
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          O primeiro usuário cadastrado recebe o papel de administrador do sistema.
        </p>
      </div>
    </div>
  );
}
