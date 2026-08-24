import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export type Papel = "admin" | "vendedor";

export type EstadoAuth = {
  carregando: boolean;
  session: Session | null;
  user: User | null;
  nome: string;
  papel: Papel | null;
  ehAdmin: boolean;
};

export function useAuth(): EstadoAuth {
  const [session, setSession] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [nome, setNome] = useState("");
  const [papel, setPapel] = useState<Papel | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSession(novaSessao);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCarregando(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) {
      setNome("");
      setPapel(null);
      return;
    }
    let ativo = true;
    void (async () => {
      const [perfil, roles] = await Promise.all([
        supabase.from("profiles").select("nome").eq("id", userId).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId),
      ]);
      if (!ativo) return;
      setNome(perfil.data?.nome ?? "");
      const papeis = (roles.data ?? []).map((r) => r.role as Papel);
      setPapel(papeis.includes("admin") ? "admin" : (papeis[0] ?? "vendedor"));
    })();
    return () => {
      ativo = false;
    };
  }, [userId]);

  return {
    carregando,
    session,
    user: session?.user ?? null,
    nome,
    papel,
    ehAdmin: papel === "admin",
  };
}
