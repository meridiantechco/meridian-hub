import { Link } from "@tanstack/react-router";
import { MoveLeft, MoveRight, MessageSquare, ExternalLink, AlertCircle, Instagram, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BadgePriority } from "@/features/leads";
import type { LeadItem } from "@/features/leads";
import type { ColunaDef } from "../types";

interface PipelineCardProps {
  lead: LeadItem;
  colAnterior?: ColunaDef | undefined;
  colProxima?: ColunaDef | undefined;
  onMoverStatus: (leadId: string, novoStatus: LeadItem["status"]) => void;
  onAbordar: (lead: LeadItem) => void;
  onPreviewLead?: (lead: LeadItem) => void;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
}

export function PipelineCard({
  lead,
  colAnterior,
  colProxima,
  onMoverStatus,
  onAbordar,
  onPreviewLead,
  onDragStart,
}: PipelineCardProps) {
  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      className="bg-card border-border/80 p-3 space-y-2.5 shadow-xs hover:border-primary/50 cursor-grab active:cursor-grabbing transition-all hover:-translate-y-0.5 select-none rounded-xl"
    >
      {/* Categoria & Score */}
      <div className="flex items-start justify-between gap-1.5">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider rotulo truncate">
          {lead.categoria}
        </span>
        <BadgePriority score={lead.score} mostrarBarra={true} />
      </div>

      {/* Nome da Empresa & Localização */}
      <div>
        <h4 className="font-semibold text-xs text-foreground line-clamp-1">
          <Link
            to="/leads/$id"
            params={{ id: lead.id }}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            {lead.nome}
          </Link>
        </h4>
        <p className="text-[10.5px] text-muted-foreground truncate dado mt-0.5">
          📍 {lead.bairro || lead.cidade || "—"}
        </p>
      </div>

      {/* Presença Web & Avaliação */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground flex-wrap gap-1 pt-1.5 border-t border-border/40">
        {!lead.tem_site ? (
          <span className="inline-flex items-center gap-1 text-primary font-medium">
            <AlertCircle className="size-2.5" /> Sem site
          </span>
        ) : (
          <span className="text-muted-foreground text-[10px]">Com site</span>
        )}

        {lead.instagram && (
          <a
            href={`https://instagram.com/${lead.instagram.replace(/^@/, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-400 hover:text-pink-300 flex items-center gap-0.5 font-mono"
            title={`Instagram: @${lead.instagram}`}
          >
            <Instagram className="size-2.5" /> @{lead.instagram}
          </a>
        )}

        {lead.avaliacao_google && (
          <span className="flex items-center gap-0.5 text-amber-400 dado">
            <Star className="size-2.5 fill-amber-400" />
            {lead.avaliacao_google.toFixed(1)}
          </span>
        )}
      </div>

      {/* Ações e Navegação entre Colunas */}
      <div className="flex items-center justify-between pt-1.5 border-t border-border/60 gap-1">
        {colAnterior ? (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground hover:bg-secondary shrink-0"
            onClick={() => onMoverStatus(lead.id, colAnterior.id)}
            title={`Mover para ${colAnterior.titulo}`}
            aria-label={`Mover para ${colAnterior.titulo}`}
          >
            <MoveLeft className="size-3.5" />
          </Button>
        ) : (
          <div className="size-7" />
        )}

        <div className="flex items-center gap-1.5 flex-1 justify-center">
          <Button
            size="sm"
            onClick={() => onAbordar(lead)}
            className="h-6.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] gap-1 font-semibold shadow-xs"
          >
            <MessageSquare className="size-3" />
            WhatsApp
          </Button>

          {onPreviewLead ? (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPreviewLead(lead)}
              className="size-6.5 border-border/80 hover:border-primary/40 hover:text-primary shrink-0"
              title="Preview rápido do lead"
            >
              <Eye className="size-3" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="icon"
              asChild
              className="size-6.5 border-border/80 hover:border-primary/40 hover:text-primary shrink-0"
              title="Ver detalhes do lead"
            >
              <Link to="/leads/$id" params={{ id: lead.id }}>
                <ExternalLink className="size-3" />
              </Link>
            </Button>
          )}
        </div>

        {colProxima ? (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground hover:bg-secondary shrink-0"
            onClick={() => onMoverStatus(lead.id, colProxima.id)}
            title={`Mover para ${colProxima.titulo}`}
            aria-label={`Mover para ${colProxima.titulo}`}
          >
            <MoveRight className="size-3.5" />
          </Button>
        ) : (
          <div className="size-7" />
        )}
      </div>
    </Card>
  );
}
