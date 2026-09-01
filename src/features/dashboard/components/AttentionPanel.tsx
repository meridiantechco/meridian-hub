import { Link } from "@tanstack/react-router";
import { AlertCircle, Flame, MessageSquare, ArrowRight, Kanban, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BadgePriority } from "@/features/leads/components/BadgePriority";
import type { LeadItem } from "@/features/leads";

interface AttentionPanelProps {
  leads: LeadItem[];
  onAbordar: (lead: LeadItem) => void;
}

export function AttentionPanel({ leads, onAbordar }: AttentionPanelProps) {
  // 1. Leads com score alto (>= 75) no status 'novo' sem site
  const leadsQuentesSemContato = leads
    .filter((l) => l.status === "novo" && !l.tem_site && l.score >= 70)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // 2. Leads em proposta
  const leadsEmProposta = leads.filter((l) => l.status === "proposta");

  // 3. Leads contatados aguardando evolução
  const leadsContatados = leads.filter((l) => l.status === "contatado");

  return (
    <Card className="bg-card border-border/80 shadow-elev overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/60 bg-surface/30 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
            Requer sua Atenção
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Ações e oportunidades comerciais prioritárias que exigem intervenção imediata
          </CardDescription>
        </div>

        <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 dado">
          {leadsQuentesSemContato.length + leadsEmProposta.length} ITENS PENDENTES
        </span>
      </CardHeader>

      <CardContent className="p-4 space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* CARD 1: OPORTUNIDADES QUENTES SEM CONTATO */}
          <div className="p-3.5 rounded-xl bg-surface/50 border border-border/70 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <Flame className="size-3.5 fill-current" />
                  Score Alto Sem Contato
                </span>
                <span className="text-[10px] font-mono text-muted-foreground dado">
                  {leadsQuentesSemContato.length} empresas
                </span>
              </div>

              {leadsQuentesSemContato.length > 0 ? (
                <div className="space-y-2">
                  {leadsQuentesSemContato.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-2 rounded-lg bg-card border border-border/60 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate">{lead.nome}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {lead.categoria} · 📍 {lead.bairro || lead.cidade}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <BadgePriority score={lead.score} />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onAbordar(lead)}
                          className="size-6 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                          title="Abordar via WhatsApp"
                        >
                          <MessageSquare className="size-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-2">
                  Todos os leads de alta prioridade já foram abordados!
                </p>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              asChild
              className="w-full h-7 text-xs border-border text-foreground hover:border-primary/40 gap-1"
            >
              <Link to="/leads">
                <span>Ver todos os leads</span>
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>

          {/* CARD 2: PROPOSTAS EM ANDAMENTO */}
          <div className="p-3.5 rounded-xl bg-surface/50 border border-border/70 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                  <Kanban className="size-3.5" />
                  Propostas em Negociação
                </span>
                <span className="text-[10px] font-mono text-muted-foreground dado">
                  {leadsEmProposta.length} ativas
                </span>
              </div>

              {leadsEmProposta.length > 0 ? (
                <div className="space-y-2">
                  {leadsEmProposta.slice(0, 3).map((lead) => (
                    <div
                      key={lead.id}
                      className="p-2 rounded-lg bg-card border border-border/60 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate">{lead.nome}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {lead.categoria} · Proposta enviada
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onAbordar(lead)}
                        className="size-6 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 shrink-0"
                        title="Follow-up via WhatsApp"
                      >
                        <MessageSquare className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-3 text-xs text-muted-foreground">
                  Nenhuma proposta em aberto no momento.
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              asChild
              className="w-full h-7 text-xs border-border text-foreground hover:border-primary/40 gap-1"
            >
              <Link to="/funil">
                <span>Abrir Funil de Vendas</span>
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>

          {/* CARD 3: LEADS CONTATADOS AGUARDANDO EVOLUÇÃO */}
          <div className="p-3.5 rounded-xl bg-surface/50 border border-border/70 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <MessageSquare className="size-3.5" />
                  Aguardando Follow-up
                </span>
                <span className="text-[10px] font-mono text-muted-foreground dado">
                  {leadsContatados.length} contatados
                </span>
              </div>

              {leadsContatados.length > 0 ? (
                <div className="space-y-2">
                  {leadsContatados.slice(0, 3).map((lead) => (
                    <div
                      key={lead.id}
                      className="p-2 rounded-lg bg-card border border-border/60 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate">{lead.nome}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {lead.categoria} · Contato inicial feito
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onAbordar(lead)}
                        className="size-6 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 shrink-0"
                        title="Reenviar mensagem via WhatsApp"
                      >
                        <MessageSquare className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-2">
                  Nenhum lead contatado pendente de resposta no momento.
                </p>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              asChild
              className="w-full h-7 text-xs border-border text-foreground hover:border-primary/40 gap-1"
            >
              <Link to="/leads">
                <span>Ver Todos os Contatados</span>
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
