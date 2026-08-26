import { createFileRoute } from "@tanstack/react-router";
import { LeadDetailsView } from "@/features/leads";

export const Route = createFileRoute("/_authenticated/leads/$id")({
  head: () => ({
    meta: [
      { title: "Ficha do Estabelecimento | Meridian Hub" },
      {
        name: "description",
        content: "Ficha comercial detalhada e histórico de contatos do estabelecimento",
      },
    ],
  }),
  component: PaginaDetalheLead,
});

function PaginaDetalheLead() {
  const { id } = Route.useParams();
  return <LeadDetailsView leadId={id} />;
}
