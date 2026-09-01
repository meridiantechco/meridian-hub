import { createFileRoute } from "@tanstack/react-router";
import { DashboardView } from "@/features/dashboard";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Dashboard — Meridian" },
      {
        name: "description",
        content: "Visão geral da operação comercial, pipeline de vendas e métricas de conversão",
      },
    ],
  }),
  component: DashboardView,
});
