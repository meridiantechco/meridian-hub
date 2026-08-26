import { createFileRoute } from "@tanstack/react-router";
import { ProspectingView } from "@/features/prospecting";

export const Route = createFileRoute("/_authenticated/nova-busca")({
  head: () => ({
    meta: [
      { title: "Detecção de Estabelecimentos | Meridian Hub" },
      {
        name: "description",
        content:
          "Varredura e listagem inteligente de estabelecimentos comerciais locais da Meridian Tech",
      },
    ],
  }),
  component: ProspectingView,
});
