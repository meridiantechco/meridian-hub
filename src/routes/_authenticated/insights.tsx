import { createFileRoute } from "@tanstack/react-router";
import { MarketInsightsView } from "@/features/radar";

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({
    meta: [
      { title: "Insights de Mercado — Meridian" },
      {
        name: "description",
        content: "Benchmarks setoriais, taxas de conversão e insights estratégicos de vendas B2B",
      },
    ],
  }),
  component: MarketInsightsView,
});
