import { createFileRoute, redirect } from "@tanstack/react-router";
import { UsersView } from "@/features/users";
import { supabase } from "@/integrations/supabase/client";

const SUPER_ADMIN_EMAIL = "meridiantech.co@gmail.com";

export const Route = createFileRoute("/_authenticated/usuarios")({
  head: () => ({
    meta: [
      { title: "Gestão de Usuários — Meridian" },
      {
        name: "description",
        content: "Administração de equipe comercial e controle de permissões de acesso",
      },
    ],
  }),
  beforeLoad: async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user) {
        throw redirect({ to: "/auth" });
      }
    } catch (e) {
      if (e && typeof e === "object" && "to" in e) {
        throw e;
      }
      throw redirect({ to: "/auth" });
    }
  },
  component: UsersView,
});
