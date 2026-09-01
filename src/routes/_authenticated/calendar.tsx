import { createFileRoute } from "@tanstack/react-router";
import { CalendarView } from "@/features/calendar";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({
    meta: [
      { title: "Agenda — Meridian" },
      {
        name: "description",
        content: "Agenda comercial de reuniões, demonstrações e alinhamentos de contrato",
      },
    ],
  }),
  component: CalendarView,
});
