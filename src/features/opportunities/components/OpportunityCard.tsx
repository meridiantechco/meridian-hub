import { Link } from "@tanstack/react-router";
import {
  MessageSquare,
  Sparkles,
  Clock,
  Coins,
  ArrowRight,
  Info,
  Building2,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BadgePriority, BadgeStatus } from "@/features/leads";
import type { OportunidadeEnriquecida } from "../types";

interface OpportunityCardProps {
  oportunidade: OportunidadeEnriquecida;
  onVerExplicacaoScore: (op: OportunidadeEnriquecida) => void;
  onAbordarWhatsApp: (op: OportunidadeEnriquecida) => void;
  onPreviewDrawer: (op: OportunidadeEnriquecida) => void;
  onSolicitarExcluir?: ((op: OportunidadeEnriquecida) => void) | undefined;
}

export function OpportunityCard({
  oportunidade,
  onVerExplicacaoScore,
  onAbordarWhatsApp,
  onPreviewDrawer,
  onSolicitarExcluir,
}: OpportunityCardProps) {
  const { lead, score, proximaAcao, diasSemContato, valorEstimadoContrato } = oportunidade;

  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <Card className="bg-card border-border/80 shadow-elev hover:border-primary/50 transition-all flex flex-col justify-between rounded-xl overflow-hidden group">
      <CardContent className="p-4 space-y-3.5">
        {/* HEADER DO CARD */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider rotulo">
              {lead.categoria}
            </span>
            <button
              type="button"
              onClick={() => onPreviewDrawer(oportunidade)}
              className="font-bold text-sm text-foreground hover:text-primary transition-colors text-left block line-clamp-1 cursor-pointer mt-0.5"
            >
              {lead.nome}
            </button>
            <p className="text-[11px] text-muted-foreground truncate dado mt-0.5">
              📍 {lead.bairro || lead.cidade || "Localização não informada"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onVerExplicacaoScore(oportunidade)}
            className="cursor-pointer group-hover:scale-105 transition-transform"
            title="Clique para ver por que recebeu este score"
          >
            <BadgePriority score={score} />
          </button>
        </div>

        {/* METADADOS RÁPIDOS */}
        <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-surface/50 border border-border/60 text-xs">
          <div>
            <span className="text-[10px] text-muted-foreground block rotulo">Potencial</span>
            <span className="font-bold font-display text-emerald-400 dado">
              {formatarMoeda(valorEstimadoContrato)}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground block rotulo">Sem Contato</span>
            <span className="font-medium text-foreground dado flex items-center gap-1">
              <Clock className="size-3 text-muted-foreground" />
              {diasSemContato === 0 ? "Hoje" : `${diasSemContato}d atrás`}
            </span>
          </div>
        </div>

        {/* PRÓXIMA MELHOR AÇÃO */}
        <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-bold text-primary flex items-center gap-1">
              <Sparkles className="size-3 text-primary" />
              Próxima Ação Recomendada:
            </span>
            <button
              type="button"
              onClick={() => onVerExplicacaoScore(oportunidade)}
              className="text-primary hover:underline"
            >
              Ver por quê
            </button>
          </div>
          <p className="text-xs font-semibold text-foreground line-clamp-1">{proximaAcao.titulo}</p>
          <p className="text-[10.5px] text-muted-foreground line-clamp-2 leading-relaxed">
            {proximaAcao.motivo}
          </p>
        </div>

        {/* FOOTER & AÇÕES */}
        <div className="flex items-center justify-between pt-1 border-t border-border/60 gap-2">
          <BadgeStatus status={lead.status} />

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              onClick={() => onAbordarWhatsApp(oportunidade)}
              className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold gap-1 shadow-xs"
            >
              <MessageSquare className="size-3" />
              WhatsApp
            </Button>

            <Button
              size="sm"
              variant="outline"
              asChild
              className="h-7 px-2 text-xs border-border/80 hover:border-primary/40 text-foreground"
            >
              <Link to="/companies/$id" params={{ id: lead.id }}>
                <ArrowRight className="size-3" />
              </Link>
            </Button>

            {onSolicitarExcluir && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onSolicitarExcluir(oportunidade)}
                className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="Descartar / Excluir oportunidade"
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
