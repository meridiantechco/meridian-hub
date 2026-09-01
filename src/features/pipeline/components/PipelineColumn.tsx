import type { LeadItem } from "@/features/leads";
import type { ColunaDef } from "../types";
import { PipelineCard } from "./PipelineCard";

interface PipelineColumnProps {
  coluna: ColunaDef;
  colIdx: number;
  todasColunas: ColunaDef[];
  leads: LeadItem[];
  isHover: boolean;
  onDragOver: (e: React.DragEvent, colId: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, statusDestino: LeadItem["status"]) => void;
  onMoverStatus: (leadId: string, novoStatus: LeadItem["status"]) => void;
  onAbordar: (lead: LeadItem) => void;
  onPreviewLead?: (lead: LeadItem) => void;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
}

export function PipelineColumn({
  coluna,
  colIdx,
  todasColunas,
  leads,
  isHover,
  onDragOver,
  onDragLeave,
  onDrop,
  onMoverStatus,
  onAbordar,
  onPreviewLead,
  onDragStart,
}: PipelineColumnProps) {
  const scoreMedio =
    leads.length > 0 ? Math.round(leads.reduce((a, b) => a + b.score, 0) / leads.length) : 0;

  const colAnterior = colIdx > 0 ? todasColunas[colIdx - 1] : undefined;
  const colProxima = colIdx < todasColunas.length - 1 ? todasColunas[colIdx + 1] : undefined;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(e, coluna.id);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          onDragLeave();
        }
      }}
      onDrop={(e) => onDrop(e, coluna.id)}
      className={`w-[260px] sm:w-[280px] lg:flex-1 shrink-0 rounded-2xl border bg-surface/30 p-3 flex flex-col min-h-[600px] transition-colors duration-150 border-t-3 ${
        coluna.corBorda
      } ${isHover ? "border-primary/80 bg-primary/10 ring-2 ring-primary/30 shadow-md" : "border-border/80"}`}
    >
      {/* Cabeçalho da Coluna */}
      <div className="flex items-center justify-between pb-2.5 border-b border-border/60 mb-2.5">
        <div>
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider rotulo">
            {coluna.titulo}
          </h3>
          <p className="text-[10px] text-muted-foreground dado">Média: {scoreMedio} pts</p>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-bold dado border ${coluna.corBadge}`}
        >
          {leads.length}
        </span>
      </div>

      {/* Lista de Cards com Scroll Interno */}
      <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
        {leads.map((lead) => (
          <PipelineCard
            key={lead.id}
            lead={lead}
            colAnterior={colAnterior}
            colProxima={colProxima}
            onMoverStatus={onMoverStatus}
            onAbordar={onAbordar}
            onPreviewLead={onPreviewLead}
            onDragStart={onDragStart}
          />
        ))}

        {leads.length === 0 && (
          <div className="h-36 flex items-center justify-center border border-dashed border-border/70 rounded-xl text-[11px] text-muted-foreground text-center p-4">
            Arraste um card até aqui
          </div>
        )}
      </div>
    </div>
  );
}
