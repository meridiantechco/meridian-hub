import { createFileRoute } from "@tanstack/react-router";
import { TodayView } from "@/features/tasks";

export const Route = createFileRoute("/_authenticated/today")({
  head: () => ({
    meta: [
      { title: "Hoje — Meridian" },
      {
        name: "description",
        content: "Cockpit diário de operações comerciais, tarefas prioritárias e follow-ups",
      },
    ],
  }),
  component: TodayView,
});
