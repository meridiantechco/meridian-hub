import { createFileRoute } from "@tanstack/react-router";
import { CompanyProfileView } from "@/features/companies";

export const Route = createFileRoute("/_authenticated/companies/$id")({
  head: () => ({
    meta: [
      { title: "Perfil da Empresa — Meridian" },
      {
        name: "description",
        content: "Visão 360° da empresa, inteligência comercial e histórico de interações",
      },
    ],
  }),
  component: PaginaPerfilEmpresa,
});

function PaginaPerfilEmpresa() {
  const { id } = Route.useParams();
  return <CompanyProfileView companyId={id} />;
}
