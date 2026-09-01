import { createFileRoute } from "@tanstack/react-router";
import { ProspectingView } from "@/features/prospecting";

export const Route = createFileRoute("/_authenticated/nova-busca")({
  head: () => ({
    meta: [
      { title: "Detectar Empresas — Meridian" },
      {
        name: "description",
        content: "Varredura geográfica e detecção de estabelecimentos comerciais sem presença web",
      },
    ],
  }),
  component: ProspectingView,
});
