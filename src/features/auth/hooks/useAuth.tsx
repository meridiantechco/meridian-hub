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
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSession(novaSessao);
      if (!novaSessao) {
        setNome("");
        setPapel(null);
        setCarregando(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCarregando(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id;
  const userMetadataNome = session?.user?.user_metadata?.["nome"] as string | undefined;
  const userEmail = session?.user?.email?.toLowerCase();

  useEffect(() => {
    if (!userId) {
      setNome("");
      setPapel(null);
      return;
    }

    let ativo = true;

    // Regra prioritária para Super Admin pelo email do fundador
    const isSuperAdmin = userEmail === SUPER_ADMIN_EMAIL;

    // Preencher provisoriamente com metadata do signup enquanto busca no banco
    if (userMetadataNome) {
      setNome(userMetadataNome);
    } else if (userEmail) {
      setNome(userEmail.split("@")[0] || "Usuário");
    }

    if (isSuperAdmin) {
      setPapel("admin");
    }

    void (async () => {
      try {
        const [perfil, roles] = await Promise.all([
          supabase.from("profiles").select("nome").eq("id", userId).maybeSingle(),
          supabase.from("user_roles").select("role").eq("user_id", userId),
        ]);

        if (!ativo) return;

        if (perfil.data?.nome) {
          setNome(perfil.data.nome);
        } else if (userMetadataNome) {
          setNome(userMetadataNome);
        }

        if (isSuperAdmin) {
          setPapel("admin");
          return;
        }

        const papeis = (roles.data ?? []).map((r) => r.role as Papel);
        if (papeis.includes("admin")) {
          setPapel("admin");
        } else if (papeis.length > 0) {
          setPapel(papeis[0] ?? "vendedor");
        } else {
          // Princípio de menor privilégio: vendedor por padrão
          setPapel("vendedor");
        }
      } catch (err) {
        console.error("Erro ao carregar permissões do usuário:", err);
        if (ativo) {
          setPapel(isSuperAdmin ? "admin" : "vendedor");
        }
      }
    })();

    return () => {
      ativo = false;
    };
  }, [userId, userMetadataNome, userEmail]);

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
