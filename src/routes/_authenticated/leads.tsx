import { createFileRoute } from "@tanstack/react-router";
import { LeadsView } from "@/features/leads";

export const Route = createFileRoute("/_authenticated/leads")({
  head: () => ({
    meta: [
      { title: "Estabelecimentos — Meridian" },
      {
        name: "description",
        content: "Gerenciamento e inteligência da base de estabelecimentos comerciais",
      },
    ],
  }),
  component: LeadsView,
});
