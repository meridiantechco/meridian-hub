import { createFileRoute } from "@tanstack/react-router";
import { OpportunityRadarView } from "@/features/radar";

export const Route = createFileRoute("/_authenticated/radar")({
  head: () => ({
    meta: [
      { title: "Radar de Oportunidades — Meridian" },
      {
        name: "description",
        content: "Radar de oportunidades de mercado, detecção de demanda e nichos em alta",
      },
    ],
  }),
  component: OpportunityRadarView,
});
