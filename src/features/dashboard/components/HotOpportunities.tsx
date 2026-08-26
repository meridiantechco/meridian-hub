import { Link } from "@tanstack/react-router";
import { Flame, ArrowRight, MessageSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgePrioridade } from "@/components/prospecta/BadgePrioridade";
import type { LeadItem } from "@/lib/leads-mock";

interface HotOpportunitiesProps {
  leads: LeadItem[];
  onAbordar: (lead: LeadItem) => void;
}

export function HotOpportunities({ leads, onAbordar }: HotOpportunitiesProps) {
  return (
    <Card className="bg-card border-border shadow-elev">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Flame className="size-4 text-primary fill-primary" />
            Oportunidades Mais Quentes
          </CardTitle>
          <CardDescription className="text-xs">
            Estabelecimentos sem site com maior pontuação aguardando primeiro contato
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-xs gap-1">
          <Link to="/leads">
            Ver todos
            <ArrowRight className="size-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="rounded-xl border border-border bg-surface/60 p-3.5 space-y-3 hover:border-primary/50 hover:bg-card transition-all flex flex-col justify-between shadow-sm"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider rotulo">
                    {lead.categoria}
                  </span>
                  <BadgePrioridade score={lead.score} />
                </div>

                <h4 className="font-semibold text-sm line-clamp-1 text-foreground">{lead.nome}</h4>

                <p className="text-xs text-muted-foreground truncate dado">
                  📍 {lead.bairro || lead.cidade || "Localização não informada"}
                </p>

                {lead.avaliacao_google && (
                  <div className="flex items-center gap-1 text-xs text-amber-400 dado">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    <span>{lead.avaliacao_google.toFixed(1)}</span>
                    <span className="text-muted-foreground text-[11px]">
                      ({lead.total_avaliacoes} avaliações)
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white h-7 text-xs gap-1.5 font-semibold"
                  onClick={() => onAbordar(lead)}
                >
                  <MessageSquare className="size-3" />
                  Abordar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-7 text-xs px-2.5 border-border/80 hover:border-primary/40"
                >
                  <Link to="/leads/$id" params={{ id: lead.id }}>
                    Ver
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
