import { createFileRoute } from "@tanstack/react-router";
import { AuthView } from "@/features/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar no Meridian Hub | Meridian Tech" },
      {
        name: "description",
        content:
          "Acesse o Meridian Hub para localizar, priorizar e gerenciar estabelecimentos comerciais B2B.",
      },
    ],
  }),
  component: AuthView,
});
