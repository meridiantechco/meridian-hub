import { createFileRoute } from "@tanstack/react-router";
import { LeadsView } from "@/features/leads";

export const Route = createFileRoute("/_authenticated/leads")({
  head: () => ({
    meta: [
      { title: "Base de Estabelecimentos | Meridian Hub" },
      {
        name: "description",
        content: "Gerenciamento e prospecção de estabelecimentos comerciais da Meridian Tech",
      },
    ],
  }),
  component: LeadsView,
});
