import { createFileRoute } from "@tanstack/react-router";
import { AssistantView } from "@/features/assistant";

export const Route = createFileRoute("/_authenticated/assistant")({
  head: () => ({
    meta: [
      { title: "Assistente de Vendas IA — Meridian" },
      {
        name: "description",
        content: "Assistente analítico inteligente para consulta de dados comerciais e priorização",
      },
    ],
  }),
  component: AssistantView,
});
