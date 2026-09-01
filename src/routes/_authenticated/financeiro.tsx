import { createFileRoute } from "@tanstack/react-router";
import { FinancialView } from "@/features/financial";

export const Route = createFileRoute("/_authenticated/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro — Meridian" },
      {
        name: "description",
        content: "Gestão de despesas operacionais, receitas e controle de fluxo de caixa",
      },
    ],
  }),
  component: FinancialView,
});
