import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { AppShell } from "@/components/prospecta/AppShell";
import { BadgePrioridade } from "@/components/prospecta/BadgePrioridade";
import { ModalMensagemWhatsApp } from "@/components/prospecta/ModalMensagemWhatsApp";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prospectaService } from "@/lib/prospecta-service";
import type { LeadItem } from "@/lib/leads-mock";
import { supabase } from "@/integrations/supabase/client";
import {
  MessageSquare,
  ExternalLink,
  Plus,
  AlertCircle,
  Star,
  RefreshCw,
  MoveRight,
  MoveLeft,
  Radio,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/funil")({
  head: () => ({
    meta: [
      { title: "Funil de Vendas (Kanban) — Prospecta" },
      { name: "description", content: "Pipeline visual kanban em tempo real com sincronização do Supabase" },
    ],
  }),
  component: PaginaFunil,
});

type ColunaDef = {
  id: LeadItem["status"];
  titulo: string;
  corBorda: string;
  corBadge: string;
  corFundoHover: string;
};

const COLUNAS: ColunaDef[] = [
  {
    id: "novo",
    titulo: "Novos",
    corBorda: "border-t-blue-500",
    corBadge: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    corFundoHover: "hover:bg-blue-500/5",
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
    corBorda: "border-t-purple-500",
    corBadge: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    corFundoHover: "hover:bg-purple-500/5",
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

export function PaginaFunil() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [leadArrastadoId, setLeadArrastadoId] = useState<string | null>(null);
  const [colunaHover, setColunaHover] = useState<string | null>(null);
  const [conectadoRealtime, setConectadoRealtime] = useState(false);

  const [leadParaWhatsApp, setLeadParaWhatsApp] = useState<LeadItem | null>(null);
  const [modalWhatsAppAberto, setModalWhatsAppAberto] = useState(false);

  const carregarDados = async () => {
    setCarregando(true);
    const lista = await prospectaService.listarLeads();
    setLeads(lista);
    setCarregando(false);
  };

  useEffect(() => {
    void carregarDados();

    // 3. Inscrição em Tempo Real (Supabase Realtime)
    const channel = supabase
      .channel("leads-funil-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const novo = payload.new as LeadItem;
            setLeads((prev) => [novo, ...prev.filter((l) => l.id !== novo.id)]);
            toast.info(`Novo lead recebido: ${novo.nome}`);
          } else if (payload.eventType === "UPDATE") {
            const atualizado = payload.new as LeadItem;
            setLeads((prev) =>
              prev.map((l) => (l.id === atualizado.id ? atualizado : l))
            );
          } else if (payload.eventType === "DELETE") {
            const deletadoId = (payload.old as { id: string })?.id;
            if (deletadoId) {
              setLeads((prev) => prev.filter((l) => l.id !== deletadoId));
            }
          }
        }
      )
      .subscribe((status) => {
        setConectadoRealtime(status === "SUBSCRIBED");
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const moverStatus = async (leadId: string, novoStatus: LeadItem["status"]) => {
    // Atualização otimista imediata
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: novoStatus } : l))
    );

    await prospectaService.atualizarStatusLead(leadId, novoStatus);
    toast.success(`Estágio alterado para "${novoStatus}"`);
  };

  // Funções de Drag & Drop
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setLeadArrastadoId(id);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setColunaHover(colId);
  };

  const handleDragLeave = () => {
    setColunaHover(null);
  };

  const handleDrop = async (e: React.DragEvent, statusDestino: LeadItem["status"]) => {
    e.preventDefault();
    setColunaHover(null);
    const id = e.dataTransfer.getData("text/plain") || leadArrastadoId;
    if (id) {
      await moverStatus(id, statusDestino);
    }
    setLeadArrastadoId(null);
  };

  return (
    <AppShell
      titulo="Funil de Vendas (Kanban)"
      descricao="Pipeline visual com atualização em tempo real e movimentação por arrastar e soltar"
      acoes={
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-border text-[11px] text-muted-foreground dado">
            <Radio className={`size-3 ${conectadoRealtime ? "text-emerald-400 animate-pulse" : "text-amber-400"}`} />
            <span>{conectadoRealtime ? "Tempo Real Ativo" : "Conectando..."}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={carregarDados}
            disabled={carregando}
            className="h-8 gap-1.5 text-xs"
          >
            <RefreshCw className={`size-3.5 ${carregando ? "animate-spin" : ""}`} />
            Atualizar
          </Button>

          <Button asChild size="sm" className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground">
            <Link to="/nova-busca">
              <Plus className="size-3.5" />
              Novo Lead
            </Link>
          </Button>
        </div>
      }
    >
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[1150px] items-start">
          {COLUNAS.map((coluna, colIdx) => {
            const leadsDaColuna = leads.filter((l) => l.status === coluna.id);
            const scoreMedioCol = leadsDaColuna.length > 0
              ? Math.round(leadsDaColuna.reduce((a, b) => a + b.score, 0) / leadsDaColuna.length)
              : 0;

            const isHover = colunaHover === coluna.id;
            const colAnterior = colIdx > 0 ? COLUNAS[colIdx - 1] : undefined;
            const colProxima = colIdx < COLUNAS.length - 1 ? COLUNAS[colIdx + 1] : undefined;

            return (
              <div
                key={coluna.id}
                onDragOver={(e) => handleDragOver(e, coluna.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, coluna.id)}
                className={`flex-1 rounded-xl border bg-surface/40 p-3 flex flex-col min-h-[640px] transition-all border-t-4 ${
                  coluna.corBorda
                } ${isHover ? "border-primary/80 bg-primary/5 ring-2 ring-primary/30" : "border-border"}`}
              >
                {/* Cabeçalho da Coluna */}
                <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-3">
                  <div>
                    <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      {coluna.titulo}
                    </h3>
                    <p className="text-[10px] text-muted-foreground dado">
                      Média: {scoreMedioCol} pts
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold dado border ${coluna.corBadge}`}>
                    {leadsDaColuna.length}
                  </span>
                </div>

                {/* Lista de Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[580px] pr-1">
                  {leadsDaColuna.map((lead) => (
                    <Card
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      className="bg-card border-border/80 p-3.5 space-y-3 shadow-sm hover:border-primary/50 cursor-grab active:cursor-grabbing transition-all hover:-translate-y-0.5 select-none"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                          {lead.categoria}
                        </span>
                        <BadgePrioridade score={lead.score} mostrarBarra={true} />
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

                        {lead.avaliacao_google && (
                          <span className="flex items-center gap-0.5 text-amber-400 dado">
                            <Star className="size-2.5 fill-amber-400" />
                            {lead.avaliacao_google.toFixed(1)} ({lead.total_avaliacoes})
                          </span>
                        )}
                      </div>

                      {/* Ações do Card */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/60">
                        {colAnterior ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 text-muted-foreground hover:text-foreground"
                            onClick={() => moverStatus(lead.id, colAnterior.id)}
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
                            onClick={() => {
                              setLeadParaWhatsApp(lead);
                              setModalWhatsAppAberto(true);
                            }}
                            className="h-6 px-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] gap-1"
                          >
                            <MessageSquare className="size-2.5" />
                            WhatsApp
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            asChild
                            className="size-6"
                          >
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
                            onClick={() => moverStatus(lead.id, colProxima.id)}
                            title={`Mover para ${colProxima.titulo}`}
                          >
                            <MoveRight className="size-3" />
                          </Button>
                        ) : (
                          <div className="size-6" />
                        )}
                      </div>
                    </Card>
                  ))}

                  {leadsDaColuna.length === 0 && (
                    <div className="h-36 flex items-center justify-center border border-dashed border-border rounded-lg text-[11px] text-muted-foreground text-center p-4">
                      Arraste um card até aqui
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de envio WhatsApp */}
      <ModalMensagemWhatsApp
        lead={leadParaWhatsApp}
        aberto={modalWhatsAppAberto}
        onOpenChange={setModalWhatsAppAberto}
        onMensagemEnviada={carregarDados}
      />
    </AppShell>
  );
}
