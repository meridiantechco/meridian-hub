import { createFileRoute } from "@tanstack/react-router";
import { FinancialView } from "@/features/financial";

export const Route = createFileRoute("/_authenticated/financeiro")({
  head: () => ({
    meta: [
      { title: "Gestão Financeira & Lucro | Meridian Hub" },
      {
        name: "description",
        content:
          "Gestão de despesas operacionais, receitas e visão consolidada de lucro real da Meridian Tech.",
      },
    ],
  }),
  component: FinancialView,
});
