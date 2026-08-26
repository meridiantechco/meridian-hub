import { Link } from "@tanstack/react-router";
import { MoveLeft, MoveRight, MessageSquare, ExternalLink, AlertCircle, Instagram, Star } from "lucide-react";
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
  onDragStart: (e: React.DragEvent, leadId: string) => void;
}

export function PipelineCard({
  lead,
  colAnterior,
  colProxima,
  onMoverStatus,
  onAbordar,
  onDragStart,
}: PipelineCardProps) {
  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      className="bg-card border-border/80 p-3.5 space-y-3 shadow-sm hover:border-primary/50 cursor-grab active:cursor-grabbing transition-all hover:-translate-y-0.5 select-none"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
          {lead.categoria}
        </span>
        <BadgePriority score={lead.score} mostrarBarra={true} />
      </div>

      <div>
        <h4 className="font-semibold text-xs text-foreground line-clamp-1">
          <Link
            to="/leads/$id"
            params={{ id: lead.id }}
            className="hover:text-primary transition-colors"
          >
            {lead.nome}
          </Link>
        </h4>
        <p className="text-[11px] text-muted-foreground truncate dado">
          📍 {lead.bairro || lead.cidade || "—"}
        </p>
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground flex-wrap gap-1 pt-1 border-t border-border/40">
        {!lead.tem_site ? (
          <span className="inline-flex items-center gap-1 text-[var(--color-alerta)] font-medium">
            <AlertCircle className="size-3" /> Sem site
          </span>
        ) : (
          <span className="text-muted-foreground">Com site</span>
        )}

        {lead.instagram && (
          <a
            href={`https://instagram.com/${lead.instagram}`}
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
            {lead.avaliacao_google.toFixed(1)} ({lead.total_avaliacoes})
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/60">
        {colAnterior ? (
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-muted-foreground hover:text-foreground"
            onClick={() => onMoverStatus(lead.id, colAnterior.id)}
            title={`Mover para ${colAnterior.titulo}`}
          >
            <MoveLeft className="size-3" />
          </Button>
        ) : (
          <div className="size-6" />
        )}

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            onClick={() => onAbordar(lead)}
            className="h-6 px-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] gap-1"
          >
            <MessageSquare className="size-2.5" />
            WhatsApp
          </Button>
          <Button variant="outline" size="icon" asChild className="size-6">
            <Link to="/leads/$id" params={{ id: lead.id }}>
              <ExternalLink className="size-3" />
            </Link>
          </Button>
        </div>

        {colProxima ? (
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-muted-foreground hover:text-foreground"
            onClick={() => onMoverStatus(lead.id, colProxima.id)}
            title={`Mover para ${colProxima.titulo}`}
          >
            <MoveRight className="size-3" />
          </Button>
        ) : (
          <div className="size-6" />
        )}
      </div>
    </Card>
  );
}
