import { createFileRoute } from "@tanstack/react-router";
import { ProspectingHistoryView } from "@/features/prospecting";

export const Route = createFileRoute("/_authenticated/buscas")({
  head: () => ({
    meta: [
      { title: "Histórico de Varreduras — Meridian" },
      {
        name: "description",
        content: "Registro consolidado de varreduras cartográficas e setores mapeados",
      },
    ],
  }),
  component: ProspectingHistoryView,
});
