import { createFileRoute } from "@tanstack/react-router";
import { PipelineView } from "@/features/pipeline";

export const Route = createFileRoute("/_authenticated/funil")({
  head: () => ({
    meta: [
      { title: "Funil de Vendas (Kanban) | Meridian Hub" },
      {
        name: "description",
        content:
          "Pipeline visual kanban em tempo real com sincronização do Supabase da Meridian Tech",
      },
    ],
  }),
  component: PipelineView,
});
