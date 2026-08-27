import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    try {
      // 1. Verificar primeiro a sessão ativa em storage
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (user) {
        // Se o usuário ainda estiver com o primeiro acesso pendente, força o cadastro de senha
        if (user.user_metadata?.["primeiro_acesso_pendente"] === true) {
          throw redirect({ to: "/auth" });
        }
        return { user };
      }

      // 2. Tentar buscar dados do usuário autenticado no servidor Supabase
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        if (data.user.user_metadata?.["primeiro_acesso_pendente"] === true) {
          throw redirect({ to: "/auth" });
        }
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
