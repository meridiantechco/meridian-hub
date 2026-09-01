import { createFileRoute } from "@tanstack/react-router";
import { GeoAnalyticsView } from "@/features/analytics";

export const Route = createFileRoute("/_authenticated/analytics/geo")({
  head: () => ({
    meta: [
      { title: "Performance Geográfica — Meridian" },
      {
        name: "description",
        content: "Mapeamento territorial de oportunidades e penetração comercial por região",
      },
    ],
  }),
  component: GeoAnalyticsView,
});
