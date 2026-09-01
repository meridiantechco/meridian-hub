import { createFileRoute } from "@tanstack/react-router";
import { CompaniesView } from "@/features/companies";

export const Route = createFileRoute("/_authenticated/companies")({
  head: () => ({
    meta: [
      { title: "Empresas — Meridian" },
      {
        name: "description",
        content: "Gestão corporativa de contas, histórico de relacionamento e potencial estimado",
      },
    ],
  }),
  component: CompaniesView,
});
