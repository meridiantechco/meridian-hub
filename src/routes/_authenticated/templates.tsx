import { createFileRoute } from "@tanstack/react-router";
import { TemplatesView } from "@/features/templates";

export const Route = createFileRoute("/_authenticated/templates")({
  head: () => ({
    meta: [
      { title: "Templates — Meridian" },
      {
        name: "description",
        content: "Templates de mensagens comerciais de alta conversão para WhatsApp e e-mail",
      },
    ],
  }),
  component: TemplatesView,
});
