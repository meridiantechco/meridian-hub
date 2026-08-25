import type { LeadItem } from "@/lib/leads-mock";
import { cn } from "@/lib/utils";

export const CONFIG_STATUS: Record<
  LeadItem["status"],
  { rotulo: string; classe: string; corPonto: string }
> = {
  novo: {
    rotulo: "Novo",
    classe: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    corPonto: "bg-blue-400",
  },
  contatado: {
    rotulo: "Contatado",
    classe: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    corPonto: "bg-amber-400",
  },
  proposta: {
    rotulo: "Proposta",
    classe: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    corPonto: "bg-purple-400",
  },
  fechado: {
    rotulo: "Fechado",
    classe: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    corPonto: "bg-emerald-400",
  },
  recusado: {
    rotulo: "Recusado",
    classe: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    corPonto: "bg-rose-400",
  },
};

export function BadgeStatus({
  status,
  className,
}: {
  status: LeadItem["status"];
  className?: string;
}) {
  const cfg = CONFIG_STATUS[status] || CONFIG_STATUS.novo;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-tight",
        cfg.classe,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", cfg.corPonto)} />
      <span>{cfg.rotulo}</span>
    </span>
  );
}
