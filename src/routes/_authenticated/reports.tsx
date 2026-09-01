import { createFileRoute } from "@tanstack/react-router";
import { ReportsView } from "@/features/analytics";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Relatórios — Meridian" },
      {
        name: "description",
        content: "Geração de relatórios gerenciais e exportação de dados em CSV, JSON e PDF",
      },
    ],
  }),
  component: ReportsView,
});
