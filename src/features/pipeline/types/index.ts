import type { LeadItem } from "@/features/leads";

export type ColunaDef = {
  id: LeadItem["status"];
  titulo: string;
  corBorda: string;
  corBadge: string;
  corFundoHover: string;
};

export const COLUNAS_PIPELINE: ColunaDef[] = [
  {
    id: "novo",
    titulo: "Novos",
    corBorda: "border-t-purple-400",
    corBadge: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    corFundoHover: "hover:bg-purple-500/5",
  },
  {
    id: "contatado",
    titulo: "Contatados",
    corBorda: "border-t-amber-500",
    corBadge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    corFundoHover: "hover:bg-amber-500/5",
  },
  {
    id: "proposta",
    titulo: "Proposta Enviada",
    corBorda: "border-t-purple-600",
    corBadge: "bg-purple-600/25 text-purple-200 border-purple-500/50",
    corFundoHover: "hover:bg-purple-600/10",
  },
  {
    id: "fechado",
    titulo: "Fechados (Ganhos)",
    corBorda: "border-t-emerald-500",
    corBadge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    corFundoHover: "hover:bg-emerald-500/5",
  },
  {
    id: "recusado",
    titulo: "Recusados",
    corBorda: "border-t-rose-500",
    corBadge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    corFundoHover: "hover:bg-rose-500/5",
  },
];
