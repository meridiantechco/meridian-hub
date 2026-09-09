import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { EstadoAuth, Papel } from "@/features/auth/types";

const estadoInicial: EstadoAuth = {
  carregando: true,
  session: null,
  user: null,
  nome: "Administrador",
  papel: "admin",
  ehAdmin: true,
};

const AuthContext = createContext<EstadoAuth>(estadoInicial);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [nome, setNome] = useState("");
  const [papel, setPapel] = useState<Papel>("admin");

  useEffect(() => {
    let ativo = true;

    async function carregarPermissoes(sessaoAtual: Session | null) {
      if (!sessaoAtual?.user) {
        if (ativo) {
          setNome("");
          setCarregando(false);
        }
        return;
      }

      const user = sessaoAtual.user;
      const userEmail = user.email?.toLowerCase();
      const userMetadataNome = user.user_metadata?.["nome"] as string | undefined;

      let nomeDefinido =
        userMetadataNome ||
        (userEmail ? userEmail.split("@")[0] || "Administrador" : "Administrador");

      try {
        const [perfilRes, rolesRes] = await Promise.all([
          supabase.from("profiles").select("nome").eq("id", user.id).maybeSingle(),
          supabase.from("user_roles").select("role").eq("user_id", user.id),
        ]);

        if (perfilRes.data?.nome) {
          nomeDefinido = perfilRes.data.nome;
        }

        const roles = (rolesRes.data ?? []).map((r) => r.role as Papel);
        if (!roles.includes("admin")) {
          await supabase.from("user_roles").upsert(
            {
              user_id: user.id,
              role: "admin",
            },
            { onConflict: "user_id,role" },
          );
        }
      } catch (err) {
        console.error("[AuthProvider] Erro ao carregar perfil/papel:", err);
      } finally {
        if (ativo) {
          setNome(nomeDefinido);
          setPapel("admin");
          setCarregando(false);
        }
      }
    }

    // Listener único de autenticação para toda a aplicação
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSession(novaSessao);
      void carregarPermissoes(novaSessao);
    });

    // Sessão inicial
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      void carregarPermissoes(data.session);
    });

    return () => {
      ativo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const valor: EstadoAuth = {
    carregando,
    session,
    user: session?.user ?? null,
    nome: nome || "Administrador",
    papel,
    ehAdmin: true,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): EstadoAuth {
  return useContext(AuthContext);
}
