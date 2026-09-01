import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import type { EstadoAuth, Papel } from "../types";

export const SUPER_ADMIN_EMAIL = "meridiantech.co@gmail.com";

export function useAuth(): EstadoAuth {
  const [session, setSession] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [nome, setNome] = useState("");
  const [papel, setPapel] = useState<Papel | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregarPermissoes(sessaoAtual: Session | null) {
      if (!sessaoAtual?.user) {
        if (ativo) {
          setNome("");
          setPapel(null);
          setCarregando(false);
        }
        return;
      }

      const user = sessaoAtual.user;
      const userEmail = user.email?.toLowerCase();
      const userMetadataNome = user.user_metadata?.["nome"] as string | undefined;
      const isSuperAdmin = userEmail === SUPER_ADMIN_EMAIL;

      // Nome inicial a partir dos metadados ou e-mail
      let nomeDefinido = userMetadataNome || (userEmail ? userEmail.split("@")[0] || "Usuário" : "Usuário");
      let papelDefinido: Papel = isSuperAdmin ? "admin" : "vendedor";

      try {
        const [perfilRes, rolesRes] = await Promise.all([
          supabase.from("profiles").select("nome").eq("id", user.id).maybeSingle(),
          supabase.from("user_roles").select("role").eq("user_id", user.id),
        ]);

        if (perfilRes.data?.nome) {
          nomeDefinido = perfilRes.data.nome;
        }

        if (isSuperAdmin) {
          papelDefinido = "admin";
        } else {
          const roles = (rolesRes.data ?? []).map((r) => r.role as Papel);
          if (roles.includes("admin")) {
            papelDefinido = "admin";
          } else if (roles.length > 0) {
            papelDefinido = roles[0] ?? "vendedor";
          } else {
            papelDefinido = "vendedor";
          }
        }
      } catch (err) {
        console.error("[useAuth] Erro ao carregar perfil/papel:", err);
      } finally {
        if (ativo) {
          setNome(nomeDefinido);
          setPapel(papelDefinido);
          setCarregando(false);
        }
      }
    }

    // 1. Ouvir mudanças no estado de autenticação
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSession(novaSessao);
      void carregarPermissoes(novaSessao);
    });

    // 2. Carregar sessão inicial
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      void carregarPermissoes(data.session);
    });

    return () => {
      ativo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const userEmail = session?.user?.email?.toLowerCase();
  const ehAdmin = papel === "admin" || userEmail === SUPER_ADMIN_EMAIL;

  return {
    carregando,
    session,
    user: session?.user ?? null,
    nome: nome || "Usuário",
    papel: ehAdmin ? "admin" : (papel ?? "vendedor"),
    ehAdmin,
  };
}
