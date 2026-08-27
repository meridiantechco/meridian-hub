import { useNavigate } from "@tanstack/react-router";
import { Compass, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { auditoriaService } from "@/lib/auditoria-service";
import { LoginForm } from "./LoginForm";
import { ForcePasswordForm } from "./ForcePasswordForm";

export function AuthView() {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false);

  // Campos de login direto
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // Pop-up / Bloqueio obrigatório de troca de senha no primeiro login
  const [modoDefinirSenhaObrigatoria, setModoDefinirSenhaObrigatoria] = useState(false);
  const [usuarioPrimeiroLogin, setUsuarioPrimeiroLogin] = useState<any>(null);
  const [senhaDefinitiva, setSenhaDefinitiva] = useState("");
  const [confirmarSenhaDefinitiva, setConfirmarSenhaDefinitiva] = useState("");

  // Confirmação de e-mail pendente (se aplicável)
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
          description: "E-mail ou senha incorretos. Verifique os dados fornecidos pelo administrador.",
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

  async function salvarSenhaObrigatoria(e: React.FormEvent) {
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
    const { error } = await supabase.auth.updateUser({
      password: senhaDefinitiva,
      data: {
        primeiro_acesso_pendente: false,
        senha_configurada_em: new Date().toISOString(),
      },
    });
    setCarregando(false);

    if (error) {
      toast.error("Erro ao salvar senha definitiva", { description: error.message });
      return;
    }

    await auditoriaService.registrarAtividade({
      tipo: "primeiro_acesso",
      titulo: "Primeiro acesso concluído",
      descricao: `Usuário ${usuarioPrimeiroLogin?.email} definiu sua senha definitiva e ativou o acesso.`,
      usuario_id: usuarioPrimeiroLogin?.id,
      usuario_email: usuarioPrimeiroLogin?.email,
    });

    toast.success("Senha definitiva cadastrada com sucesso!", {
      description: "Bem-vindo ao Meridian Hub!",
    });
    setModoDefinirSenhaObrigatoria(false);
    void navigate({ to: "/painel" });
  }

  async function deslogar() {
    await supabase.auth.signOut();
    setModoDefinirSenhaObrigatoria(false);
    setUsuarioPrimeiroLogin(null);
    setSenhaDefinitiva("");
    setConfirmarSenhaDefinitiva("");
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
            Plataforma de inteligência comercial e prospecção corporativa da Meridian Tech
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/80 text-[11px] text-muted-foreground border border-border">
            <ShieldCheck className="size-3 text-primary" />
            <span>Sistema Interno · Acesso Restrito</span>
          </div>
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
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <p className="text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} Meridian Tech · Uso Interno Exclusivo
          </p>
        </div>
      </div>
    </div>
  );
}
