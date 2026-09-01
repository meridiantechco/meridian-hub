import { createFileRoute } from "@tanstack/react-router";
import { TasksView } from "@/features/tasks";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({
    meta: [
      { title: "Tarefas — Meridian" },
      {
        name: "description",
        content: "Gestão operacional de tarefas, prazos e rotinas comerciais",
      },
    ],
  }),
  component: TasksView,
});
