import { createFileRoute } from "@tanstack/react-router";
import { PipelineView } from "@/features/pipeline";

export const Route = createFileRoute("/_authenticated/funil")({
  head: () => ({
    meta: [
      { title: "Funil Comercial — Meridian" },
      {
        name: "description",
        content: "Pipeline comercial interativo em tempo real para controle de estágios de negociação",
      },
    ],
  }),
  component: PipelineView,
});
