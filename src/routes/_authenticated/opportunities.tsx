import { createFileRoute } from "@tanstack/react-router";
import { OpportunityCenterView } from "@/features/opportunities";

export const Route = createFileRoute("/_authenticated/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunity Center — Meridian" },
      {
        name: "description",
        content: "Central de inteligência comercial e priorização de oportunidades de alta conversão",
      },
    ],
  }),
  component: OpportunityCenterView,
});
