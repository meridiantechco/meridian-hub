import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    try {
      // 1. Verificar primeiro a sessão ativa em storage
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        return { user: sessionData.session.user };
      }

      // 2. Tentar buscar dados do usuário autenticado
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        return { user: data.user };
      }
    } catch (e) {
      if (e && typeof e === "object" && "to" in e) {
        throw e;
      }
      // continua para redirect
    }

    // 3. Se não houver sessão ativa, redirecionar para a tela de autenticação
    throw redirect({ to: "/auth" });
  },
  component: () => <Outlet />,
});
