import { createFileRoute } from "@tanstack/react-router";
import { ActivitiesView } from "@/features/activities";

export const Route = createFileRoute("/_authenticated/activities")({
  head: () => ({
    meta: [
      { title: "Atividades — Meridian" },
      {
        name: "description",
        content: "Timeline e feed auditável de atividades comerciais, movimentações e reuniões",
      },
    ],
  }),
  component: ActivitiesView,
});
