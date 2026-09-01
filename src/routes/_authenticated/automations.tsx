import { createFileRoute } from "@tanstack/react-router";
import { AutomationsView } from "@/features/automations";

export const Route = createFileRoute("/_authenticated/automations")({
  head: () => ({
    meta: [
      { title: "Automações — Meridian" },
      {
        name: "description",
        content: "Workflows visuais e regras de automação comercial para follow-up e alertas",
      },
    ],
  }),
  component: AutomationsView,
});
