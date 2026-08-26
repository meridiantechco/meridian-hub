import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Compass,
  Loader2,
  Sparkles,
  Mail,
  Lock,
  User,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { auditoriaService } from "@/lib/auditoria-service";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar no Prospecta — Prospecção de Estabelecimentos" },
      {
        name: "description",
        content:
          "Acesse o Prospecta Hub para localizar, priorizar e gerenciar estabelecimentos comerciais locais.",
      },
    ],
  }),
  component: PaginaAuth,
});

export function PaginaAuth() {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<"entrar" | "primeiro_acesso" | "criar">("entrar");

  // Campos de login
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // Campos de Primeiro Acesso / Definição de Senha
  const [emailPrimeiroAcesso, setEmailPrimeiroAcesso] = useState("");
  const [senhaProvisoria, setSenhaProvisoria] = useState("");
  const [senhaDefinitiva, setSenhaDefinitiva] = useState("");
  const [confirmarSenhaDefinitiva, setConfirmarSenhaDefinitiva] = useState("");

  // Modal / Tela de obrigatoriedade de senha no primeiro login
  const [modoDefinirSenhaObrigatoria, setModoDefinirSenhaObrigatoria] = useState(false);
  const [usuarioPrimeiroLogin, setUsuarioPrimeiroLogin] = useState<any>(null);

  // Campos de cadastro livre
  const [nome, setNome] = useState("");
  const [emailNovo, setEmailNovo] = useState("");
  const [senhaNova, setSenhaNova] = useState("");

  // Estado de confirmação de e-mail pendente
  const [emailConfirmacaoPendente, setEmailConfirmacaoPendente] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session && !modoDefinirSenhaObrigatoria) {
        const metadata = data.session.user?.user_metadata;
        if (metadata?.["primeiro_acesso_pendente"] === true) {
          setUsuarioPrimeiroLogin(data.session.user);
          setModoDefinirSenhaObrigatoria(true);
        } else {
          void navigate({ to: "/painel" });
        }
      }
    });
  }, [navigate, modoDefinirSenhaObrigatoria]);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setEmailConfirmacaoPendente(null);

    const emailLimpo = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailLimpo,
      password: senha,
    });
    setCarregando(false);

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        toast.error("E-mail não confirmado", {
          description:
            "Verifique sua caixa de entrada para confirmar seu cadastro antes de entrar.",
        });
        setEmailConfirmacaoPendente(emailLimpo);
      } else if (error.message.includes("Invalid login credentials")) {
        toast.error("Credenciais incorretas", {
          description:
            "E-mail ou senha incorretos. Se este é seu primeiro acesso, utilize a aba 'Primeiro Acesso'.",
        });
      } else {
        toast.error("Não foi possível entrar", { description: error.message });
      }
      return;
    }

    if (data.session) {
      const metadata = data.user?.user_metadata;
      // Verificar se é primeiro acesso com senha provisória
      if (metadata?.["primeiro_acesso_pendente"] === true) {
        setUsuarioPrimeiroLogin(data.user);
        setModoDefinirSenhaObrigatoria(true);
        toast.info("Primeiro acesso detectado!", {
          description: "Por favor, cadastre sua senha definitiva pessoal para continuar.",
        });
        return;
      }

      await auditoriaService.registrarAtividade({
        tipo: "login",
        titulo: "Login realizado",
        descricao: `Usuário ${data.user?.email} autenticado com sucesso no sistema.`,
      });

      toast.success("Login realizado com sucesso!");
      void navigate({ to: "/painel" });
    }
  }

  // Primeiro Acesso com Senha Provisória e Cadastro de Senha Definitiva
  async function executarPrimeiroAcesso(e: React.FormEvent) {
    e.preventDefault();

    if (senhaDefinitiva.length < 6) {
      toast.error("Senha muito curta", {
        description: "A nova senha deve ter no mínimo 6 caracteres.",
      });
      return;
    }

    if (senhaDefinitiva !== confirmarSenhaDefinitiva) {
      toast.error("As senhas não coincidem", {
        description: "Verifique a confirmação da nova senha.",
      });
      return;
    }

    setCarregando(true);
    const emailLimpo = emailPrimeiroAcesso.trim().toLowerCase();

    // 1. Fazer login com a senha provisória
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: emailLimpo,
      password: senhaProvisoria,
    });

    if (loginError) {
      setCarregando(false);
      toast.error("Credenciais provisórias inválidas", {
        description: "Verifique o e-mail e a senha inicial fornecidos pelo administrador.",
      });
      return;
    }

    // 2. Atualizar para a senha definitiva
    const { error: updateError } = await supabase.auth.updateUser({
      password: senhaDefinitiva,
      data: {
        primeiro_acesso_pendente: false,
        senha_configurada_em: new Date().toISOString(),
      },
    });

    setCarregando(false);

    if (updateError) {
      toast.error("Erro ao definir senha", { description: updateError.message });
      return;
    }

    await auditoriaService.registrarAtividade({
      tipo: "primeiro_acesso",
      titulo: "Primeiro acesso concluído",
      descricao: `Usuário ${emailLimpo} definiu sua senha definitiva e ativou a conta.`,
      usuario_id: loginData.user?.id,
      usuario_email: emailLimpo,
    });

    toast.success("Senha cadastrada com sucesso!", {
      description: "Sua conta foi ativada. Bem-vindo ao Prospecta!",
    });

    void navigate({ to: "/painel" });
  }

  // Salvar senha definitiva quando interceptado no login
  async function salvarSenhaObrigatoria(e: React.FormEvent) {
    e.preventDefault();

    if (senhaDefinitiva.length < 6) {
      toast.error("Senha muito curta", {
        description: "A nova senha deve ter no mínimo 6 caracteres.",
      });
      return;
    }

    if (senhaDefinitiva !== confirmarSenhaDefinitiva) {
      toast.error("As senhas não coincidem");
      return;
    }

    setCarregando(true);
    const { error } = await supabase.auth.updateUser({
      password: senhaDefinitiva,
      data: {
        primeiro_acesso_pendente: false,
        senha_configurada_em: new Date().toISOString(),
      },
    });
    setCarregando(false);

    if (error) {
      toast.error("Erro ao salvar senha", { description: error.message });
      return;
    }

    await auditoriaService.registrarAtividade({
      tipo: "primeiro_acesso",
      titulo: "Primeiro acesso concluído",
      descricao: `Usuário ${usuarioPrimeiroLogin?.email} definiu sua senha definitiva e ativou a conta.`,
      usuario_id: usuarioPrimeiroLogin?.id,
      usuario_email: usuarioPrimeiroLogin?.email,
    });

    toast.success("Senha definitiva cadastrada com sucesso!");
    setModoDefinirSenhaObrigatoria(false);
    void navigate({ to: "/painel" });
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

      if (data.session) {
        setCarregando(false);
        toast.success("Conta criada com sucesso!");
        void navigate({ to: "/painel" });
        return;
      }

      // Login imediato
      const loginImediato = await supabase.auth.signInWithPassword({
        email: emailLimpo,
        password: senhaNova,
      });

      if (loginImediato.data?.session) {
        setCarregando(false);
        toast.success("Conta criada e autenticada!");
        void navigate({ to: "/painel" });
        return;
      }

      setCarregando(false);
      setEmail(emailLimpo);
      setAbaAtiva("entrar");
      toast.success("Conta cadastrada!", {
        description: `Acesse com seu e-mail ${emailLimpo} e senha.`,
      });
    } catch (err: any) {
      setCarregando(false);
      toast.error("Erro inesperado no cadastro", { description: err?.message || String(err) });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute -top-40 -left-40 size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 size-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* LOGO & CABEÇALHO */}
        <div className="text-center space-y-2">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 text-primary border border-primary/30 shadow-[0_0_20px_rgba(255,107,53,0.25)] mb-2">
            <Compass className="size-6" />
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">
            Prospecta Hub
          </h1>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Plataforma de inteligência comercial e mineração de estabelecimentos
          </p>
        </div>

        {/* TELA DE DEFINIÇÃO DE SENHA OBRIGATÓRIA (PRIMEIRO ACESSO) */}
        {modoDefinirSenhaObrigatoria ? (
          <Card className="bg-card border-border shadow-elev">
            <CardHeader className="text-center pb-4">
              <div className="size-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-2">
                <KeyRound className="size-5" />
              </div>
              <CardTitle className="text-lg font-bold text-foreground">
                Cadastrar Senha Definitiva
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Olá! Como este é seu primeiro acesso, crie sua senha pessoal definitiva para
                continuar navegando.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={salvarSenhaObrigatoria} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="senha-def" className="text-xs font-semibold text-foreground">
                    Nova Senha *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="senha-def"
                      type="password"
                      placeholder="Mínimo de 6 caracteres"
                      value={senhaDefinitiva}
                      onChange={(e) => setSenhaDefinitiva(e.target.value)}
                      required
                      className="text-xs h-9 pl-9 bg-surface/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="conf-senha-def" className="text-xs font-semibold text-foreground">
                    Confirmar Nova Senha *
                  </Label>
                  <div className="relative">
                    <CheckCircle2 className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="conf-senha-def"
                      type="password"
                      placeholder="Repita a nova senha"
                      value={confirmarSenhaDefinitiva}
                      onChange={(e) => setConfirmarSenhaDefinitiva(e.target.value)}
                      required
                      className="text-xs h-9 pl-9 bg-surface/50"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={carregando || !senhaDefinitiva || !confirmarSenhaDefinitiva}
                  className="w-full bg-primary text-primary-foreground font-semibold text-xs h-9 gap-2 shadow-sm"
                >
                  {carregando ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="size-4" />
                  )}
                  Salvar Senha e Acessar
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          /* CARD PRINCIPAL COM ABAS */
          <Card className="bg-card border-border shadow-elev">
            <CardContent className="pt-6">
              <Tabs
                value={abaAtiva}
                onValueChange={(val) => setAbaAtiva(val as any)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 bg-secondary/70 p-1 mb-5">
                  <TabsTrigger value="entrar" className="text-xs font-medium">
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger value="primeiro_acesso" className="text-xs font-medium">
                    1º Acesso
                  </TabsTrigger>
                  <TabsTrigger value="criar" className="text-xs font-medium">
                    Criar Conta
                  </TabsTrigger>
                </TabsList>

                {/* ABA 1: ENTRAR */}
                <TabsContent value="entrar">
                  <form onSubmit={entrar} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="email-login"
                        className="text-xs font-semibold text-foreground"
                      >
                        E-mail
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <Input
                          id="email-login"
                          type="email"
                          placeholder="seu.email@empresa.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="text-xs h-9 pl-9 bg-surface/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <Label htmlFor="senha-login" className="font-semibold text-foreground">
                          Senha
                        </Label>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <Input
                          id="senha-login"
                          type="password"
                          placeholder="••••••••"
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                          required
                          className="text-xs h-9 pl-9 bg-surface/50"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={carregando || !email || !senha}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-9 gap-2 shadow-sm transition-all"
                    >
                      {carregando ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <ArrowRight className="size-4" />
                      )}
                      Entrar no Sistema
                    </Button>
                  </form>
                </TabsContent>

                {/* ABA 2: PRIMEIRO ACESSO / DEFINIR SENHA */}
                <TabsContent value="primeiro_acesso">
                  <form onSubmit={executarPrimeiroAcesso} className="space-y-3.5">
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border/80 text-[11px] text-muted-foreground">
                      <strong className="text-foreground block font-semibold">
                        Foi convidado pelo administrador?
                      </strong>
                      Insira o e-mail e a senha inicial fornecidos e cadastre sua senha definitiva.
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="email-pa" className="text-xs font-semibold text-foreground">
                        Seu E-mail Cadastrado
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <Input
                          id="email-pa"
                          type="email"
                          placeholder="seu.email@empresa.com"
                          value={emailPrimeiroAcesso}
                          onChange={(e) => setEmailPrimeiroAcesso(e.target.value)}
                          required
                          className="text-xs h-9 pl-9 bg-surface/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="senha-prov" className="text-xs font-semibold text-foreground">
                        Senha Inicial Provisória
                      </Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <Input
                          id="senha-prov"
                          type="password"
                          placeholder="Senha recebida do admin"
                          value={senhaProvisoria}
                          onChange={(e) => setSenhaProvisoria(e.target.value)}
                          required
                          className="text-xs h-9 pl-9 bg-surface/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label
                        htmlFor="senha-def-pa"
                        className="text-xs font-semibold text-foreground"
                      >
                        Criar Nova Senha Pessoal
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <Input
                          id="senha-def-pa"
                          type="password"
                          placeholder="Mínimo 6 caracteres"
                          value={senhaDefinitiva}
                          onChange={(e) => setSenhaDefinitiva(e.target.value)}
                          required
                          className="text-xs h-9 pl-9 bg-surface/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label
                        htmlFor="conf-senha-def-pa"
                        className="text-xs font-semibold text-foreground"
                      >
                        Confirmar Nova Senha
                      </Label>
                      <div className="relative">
                        <CheckCircle2 className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <Input
                          id="conf-senha-def-pa"
                          type="password"
                          placeholder="Repita a nova senha"
                          value={confirmarSenhaDefinitiva}
                          onChange={(e) => setConfirmarSenhaDefinitiva(e.target.value)}
                          required
                          className="text-xs h-9 pl-9 bg-surface/50"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={
                        carregando || !emailPrimeiroAcesso || !senhaProvisoria || !senhaDefinitiva
                      }
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-9 gap-2 shadow-sm"
                    >
                      {carregando ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <UserCheck className="size-4" />
                      )}
                      Ativar Conta e Entrar
                    </Button>
                  </form>
                </TabsContent>

                {/* ABA 3: CRIAR CONTA */}
                <TabsContent value="criar">
                  <form onSubmit={cadastrar} className="space-y-3.5">
                    <div className="space-y-1">
                      <Label
                        htmlFor="nome-cadastro"
                        className="text-xs font-semibold text-foreground"
                      >
                        Nome Completo
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <Input
                          id="nome-cadastro"
                          type="text"
                          placeholder="Ex: Carlos Silva"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          required
                          className="text-xs h-9 pl-9 bg-surface/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label
                        htmlFor="email-cadastro"
                        className="text-xs font-semibold text-foreground"
                      >
                        E-mail Profissional
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <Input
                          id="email-cadastro"
                          type="email"
                          placeholder="seu.email@empresa.com"
                          value={emailNovo}
                          onChange={(e) => setEmailNovo(e.target.value)}
                          required
                          className="text-xs h-9 pl-9 bg-surface/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label
                        htmlFor="senha-cadastro"
                        className="text-xs font-semibold text-foreground"
                      >
                        Senha
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <Input
                          id="senha-cadastro"
                          type="password"
                          placeholder="Mínimo de 6 caracteres"
                          value={senhaNova}
                          onChange={(e) => setSenhaNova(e.target.value)}
                          required
                          className="text-xs h-9 pl-9 bg-surface/50"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={carregando || !nome || !emailNovo || !senhaNova}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-9 gap-2 shadow-sm"
                    >
                      {carregando ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Sparkles className="size-4" />
                      )}
                      Criar Conta
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
