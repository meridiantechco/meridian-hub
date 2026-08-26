import { createFileRoute } from "@tanstack/react-router";
import { ProspectingHistoryView } from "@/features/prospecting";

export const Route = createFileRoute("/_authenticated/buscas")({
  head: () => ({
    meta: [
      { title: "Histórico de Varreduras | Meridian Hub" },
      {
        name: "description",
        content: "Registro de varreduras cartográficas realizadas no Google Places",
      },
    ],
  }),
  component: ProspectingHistoryView,
});
