import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsOverviewView } from "@/features/analytics";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Meridian" },
      {
        name: "description",
        content: "Inteligência analítica de vendas, taxas de conversão e velocidade de pipeline",
      },
    ],
  }),
  component: AnalyticsOverviewView,
});
