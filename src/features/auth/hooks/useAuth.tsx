import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import type { EstadoAuth, Papel } from "../types";

export const SUPER_ADMIN_EMAIL = "meridiantech.co@gmail.com";

export function useAuth(): EstadoAuth {
  const [session, setSession] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [nome, setNome] = useState("");
  const [papel] = useState<Papel>("admin");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSession(novaSessao);
      if (!novaSessao) {
        setNome("");
        setCarregando(false);
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
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
      return;
    }

    let ativo = true;

    // Preencher provisoriamente com metadata do signup enquanto busca no banco
    if (userMetadataNome) {
      setNome(userMetadataNome);
    } else if (userEmail) {
      setNome(userEmail.split("@")[0] || "Administrador");
    }

    void (async () => {
      try {
        const perfil = await supabase
          .from("profiles")
          .select("nome")
          .eq("id", userId)
          .maybeSingle();
        if (ativo && perfil.data?.nome) {
          setNome(perfil.data.nome);
        }
      } catch (err) {
        console.error("Erro ao carregar perfil do usuário:", err);
      }
    })();

    return () => {
      ativo = false;
    };
  }, [userId, userMetadataNome, userEmail]);

  return {
    carregando,
    session,
    user: session?.user ?? null,
    nome: nome || "Administrador",
    papel: "admin",
    ehAdmin: true,
  };
}
