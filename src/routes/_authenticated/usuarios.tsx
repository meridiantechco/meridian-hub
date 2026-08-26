import { createFileRoute } from "@tanstack/react-router";
import { UsersView } from "@/features/users";

export const Route = createFileRoute("/_authenticated/usuarios")({
  head: () => ({
    meta: [
      { title: "Gestão de Usuários & Auditoria | Meridian Hub" },
      {
        name: "description",
        content:
          "Administração de equipe comercial e análise completa de movimentações da Meridian Tech",
      },
    ],
  }),
  component: UsersView,
});
