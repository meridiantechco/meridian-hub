import { Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Send,
  Building2,
  Bot,
  User,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { assistantService } from "../services/assistantService";
import type { MensagemChat } from "../types";
import { cn } from "@/lib/utils";

export function AssistantView() {
  const [mensagens, setMensagens] = useState<MensagemChat[]>([
    {
      id: "ai-initial",
      autor: "assistente",
      conteudo:
        "Olá! Sou o **AI Sales Assistant** do Meridian Hub 2.0. Estou conectado diretamente à base de dados real do sistema para ajudar na qualificação, detecção de riscos e direcionamento comercial.\n\nO que você gostaria de analisar agora?",
      data_hora: new Date().toISOString(),
    },
  ]);
  const [inputTexto, setInputTexto] = useState("");
  const [processando, setProcessando] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const sugestoes = [
    "Quais são meus melhores leads?",
    "Quais oportunidades estão paradas?",
    "Quais leads precisam de contato?",
    "Quais empresas possuem score acima de 80?",
    "Qual vendedor possui mais oportunidades?",
  ];

  const enviarMensagem = async (texto: string) => {
    if (!texto.trim() || processando) return;

    const msgUsuario: MensagemChat = {
      id: `usr-${Date.now()}`,
      autor: "usuario",
      conteudo: texto.trim(),
      data_hora: new Date().toISOString(),
    };

    setMensagens((prev) => [...prev, msgUsuario]);
    setInputTexto("");
    setProcessando(true);

    try {
      const resposta = await assistantService.processarPergunta(texto);
      setMensagens((prev) => [...prev, resposta]);
    } finally {
      setProcessando(false);
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, processando]);

  return (
    <AppShell
      titulo="AI Sales Assistant"
      descricao="Assistente analítico inteligente com consulta em tempo real à base de contas e métricas comerciais"
    >
      <div className="space-y-4 max-w-4xl mx-auto flex flex-col h-[calc(100vh-170px)]">
        {/* SUGESTÕES RÁPIDAS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
          {sugestoes.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => enviarMensagem(s)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-surface/70 border border-border/80 hover:border-primary/50 text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Lightbulb className="size-3 text-amber-400" />
              <span>{s}</span>
            </button>
          ))}
        </div>

        {/* FEED DE MENSAGENS */}
        <Card className="bg-card border-border/80 shadow-elev flex-1 flex flex-col overflow-hidden p-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {mensagens.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start gap-3 text-xs max-w-3xl",
                  msg.autor === "usuario" ? "ml-auto flex-row-reverse" : "mr-auto",
                )}
              >
                <div
                  className={cn(
                    "size-8 rounded-xl flex items-center justify-center shrink-0 border",
                    msg.autor === "assistente"
                      ? "bg-primary/20 text-primary border-primary/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                      : "bg-secondary text-muted-foreground border-border",
                  )}
                >
                  {msg.autor === "assistente" ? (
                    <Sparkles className="size-4" />
                  ) : (
                    <User className="size-4" />
                  )}
                </div>

                <div
                  className={cn(
                    "p-4 rounded-2xl space-y-2 leading-relaxed whitespace-pre-line border",
                    msg.autor === "assistente"
                      ? "bg-surface/50 border-border/70 text-foreground"
                      : "bg-primary text-primary-foreground border-primary/40 font-medium",
                  )}
                >
                  <div>{msg.conteudo}</div>

                  {/* CARDS DE LEADS VINCULADOS */}
                  {msg.metadadosLeads && msg.metadadosLeads.length > 0 && (
                    <div className="pt-2 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.metadadosLeads.map((l) => (
                        <Link
                          key={l.id}
                          to="/companies/$id"
                          params={{ id: l.id }}
                          className="p-2 rounded-lg bg-surface/70 border border-border/80 hover:border-primary/50 text-foreground transition-colors flex items-center justify-between"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-bold truncate text-[11px]">{l.nome}</p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {l.categoria}
                            </p>
                          </div>
                          <span className="font-mono font-bold text-xs text-primary ml-2">
                            {l.score} pts
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {processando && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse p-2">
                <Sparkles className="size-3.5 text-primary animate-spin" />
                <span>Consultando inteligência comercial e calculando scores...</span>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* INPUT FORMULÁRIO */}
          <div className="p-3 border-t border-border bg-surface/40 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void enviarMensagem(inputTexto);
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={inputTexto}
                onChange={(e) => setInputTexto(e.target.value)}
                placeholder="Pergunte sobre leads, riscos, oportunidades ou métricas..."
                disabled={processando}
                className="text-xs h-9 bg-card border-border"
              />
              <Button
                type="submit"
                disabled={processando || !inputTexto.trim()}
                className="h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs gap-1.5"
              >
                <Send className="size-3.5" />
                <span>Enviar</span>
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
