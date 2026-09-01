import { createFileRoute } from "@tanstack/react-router";
import { TeamAnalyticsView } from "@/features/analytics";

export const Route = createFileRoute("/_authenticated/analytics/team")({
  head: () => ({
    meta: [
      { title: "Performance da Equipe — Meridian" },
      {
        name: "description",
        content: "Produtividade individual, taxa de conversão e receita gerada por vendedor",
      },
    ],
  }),
  component: TeamAnalyticsView,
});
