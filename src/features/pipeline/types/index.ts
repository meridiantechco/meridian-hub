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
    titulo: "Novos (A Contatar)",
    corBorda: "border-t-purple-400",
    corBadge: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    corFundoHover: "hover:bg-purple-500/5",
  },
  {
    id: "contatado",
    titulo: "Contatados (WhatsApp)",
    corBorda: "border-t-amber-500",
    corBadge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    corFundoHover: "hover:bg-amber-500/5",
  },
  {
    id: "proposta",
    titulo: "Proposta Comercial",
    corBorda: "border-t-indigo-500",
    corBadge: "bg-indigo-500/25 text-indigo-200 border-indigo-500/50",
    corFundoHover: "hover:bg-indigo-500/10",
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
    titulo: "Sem Interesse / Recusado",
    corBorda: "border-t-rose-500",
    corBadge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    corFundoHover: "hover:bg-rose-500/5",
  },
];
