import { createFileRoute } from "@tanstack/react-router";
import { OpportunityMapView } from "@/features/map";

export const Route = createFileRoute("/_authenticated/map")({
  head: () => ({
    meta: [
      { title: "Mapa de Oportunidades — Meridian" },
      {
        name: "description",
        content: "Visualização geoespacial e inteligência cartográfica de oportunidades comerciais",
      },
    ],
  }),
  component: OpportunityMapView,
});
