import { useNavigate } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { auditoriaService } from "@/lib/auditoria-service";
import type { AuthTab } from "../types";
import { LoginForm } from "./LoginForm";
import { FirstAccessForm } from "./FirstAccessForm";
import { RegisterForm } from "./RegisterForm";
import { ForcePasswordForm } from "./ForcePasswordForm";

export function AuthView() {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<AuthTab>("entrar");

  // Campos de login
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // Campos de Primeiro Acesso
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

  // Confirmação de e-mail pendente
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
            "E-mail ou senha incorretos. Se este é seu primeiro acesso, utilize a aba '1º Acesso'.",
        });
      } else {
        toast.error("Não foi possível entrar", { description: error.message });
      }
      return;
    }

    if (data.session) {
      const metadata = data.user?.user_metadata;
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
        descricao: `Usuário ${data.user?.email} autenticado com sucesso no Meridian Hub.`,
      });

      toast.success("Login realizado com sucesso!");
      void navigate({ to: "/painel" });
    }
  }

  async function reenviarConfirmacao(emailDestino: string) {
    setCarregando(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: emailDestino,
    });
    setCarregando(false);

    if (error) {
      toast.error("Erro ao reenviar confirmação", { description: error.message });
    } else {
      toast.success("E-mail reenviado com sucesso!", {
        description: "Verifique sua caixa de entrada e pasta de spam.",
      });
    }
  }

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
      description: "Sua conta foi ativada. Bem-vindo ao Meridian Hub!",
    });

    void navigate({ to: "/painel" });
  }

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

  async function deslogar() {
    await supabase.auth.signOut();
    setModoDefinirSenhaObrigatoria(false);
    setUsuarioPrimeiroLogin(null);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute -top-40 -left-40 size-96 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 size-96 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* LOGO & CABEÇALHO */}
        <div className="text-center space-y-2">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 text-primary border border-primary/30 shadow-[0_0_25px_rgba(168,85,247,0.35)] mb-2">
            <Compass className="size-6" />
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">
            Meridian Hub
          </h1>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Plataforma de inteligência comercial e prospecção da Meridian Tech
          </p>
        </div>

        {modoDefinirSenhaObrigatoria ? (
          <ForcePasswordForm
            usuarioPrimeiroLogin={usuarioPrimeiroLogin}
            senhaDefinitiva={senhaDefinitiva}
            setSenhaDefinitiva={setSenhaDefinitiva}
            confirmarSenhaDefinitiva={confirmarSenhaDefinitiva}
            setConfirmarSenhaDefinitiva={setConfirmarSenhaDefinitiva}
            carregando={carregando}
            onSubmit={salvarSenhaObrigatoria}
            onLogout={deslogar}
          />
        ) : (
          <Card className="bg-card border-border shadow-elev">
            <CardContent className="pt-6">
              <Tabs
                value={abaAtiva}
                onValueChange={(val) => setAbaAtiva(val as AuthTab)}
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

                <TabsContent value="entrar">
                  <LoginForm
                    email={email}
                    setEmail={setEmail}
                    senha={senha}
                    setSenha={setSenha}
                    carregando={carregando}
                    onSubmit={entrar}
                    emailConfirmacaoPendente={emailConfirmacaoPendente}
                    onReenviarConfirmacao={reenviarConfirmacao}
                  />
                </TabsContent>

                <TabsContent value="primeiro_acesso">
                  <FirstAccessForm
                    email={emailPrimeiroAcesso}
                    setEmail={setEmailPrimeiroAcesso}
                    senhaProvisoria={senhaProvisoria}
                    setSenhaProvisoria={setSenhaProvisoria}
                    senhaDefinitiva={senhaDefinitiva}
                    setSenhaDefinitiva={setSenhaDefinitiva}
                    confirmarSenhaDefinitiva={confirmarSenhaDefinitiva}
                    setConfirmarSenhaDefinitiva={setConfirmarSenhaDefinitiva}
                    carregando={carregando}
                    onSubmit={executarPrimeiroAcesso}
                  />
                </TabsContent>

                <TabsContent value="criar">
                  <RegisterForm
                    nome={nome}
                    setNome={setNome}
                    email={emailNovo}
                    setEmail={setEmailNovo}
                    senha={senhaNova}
                    setSenha={setSenhaNova}
                    carregando={carregando}
                    onSubmit={cadastrar}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <p className="text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} Meridian Tech. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
