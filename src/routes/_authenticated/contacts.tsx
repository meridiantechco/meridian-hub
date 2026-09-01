import { createFileRoute } from "@tanstack/react-router";
import { ContactsView } from "@/features/contacts";

export const Route = createFileRoute("/_authenticated/contacts")({
  head: () => ({
    meta: [
      { title: "Contatos — Meridian" },
      {
        name: "description",
        content: "Diretório de tomadores de decisão, sócios e contatos comerciais",
      },
    ],
  }),
  component: ContactsView,
});
