import { createFileRoute } from "@tanstack/react-router";
import { NotificationsView } from "@/features/notifications";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notificações — Meridian" },
      {
        name: "description",
        content: "Central de alertas, avisos de risco, novas oportunidades e eventos",
      },
    ],
  }),
  component: NotificationsView,
});
