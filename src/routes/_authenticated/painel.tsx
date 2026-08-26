import { createFileRoute } from "@tanstack/react-router";
import { DashboardView } from "@/features/dashboard";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Painel Comercial & Lucratividade | Meridian Hub" },
      {
        name: "description",
        content:
          "Visão geral da prospecção B2B de estabelecimentos sem site e controle financeiro da Meridian Tech",
      },
    ],
  }),
  component: DashboardView,
});
