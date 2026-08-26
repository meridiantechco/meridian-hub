import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, ExternalLink, Send, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { gerarLinkWhatsApp, gerarMensagemPadrao, limparTelefone } from "../utils/whatsapp";
import type { LeadItem } from "../types";
import { leadsService } from "../services/leadsService";
import { auditoriaService } from "@/features/audit";

interface WhatsAppModalProps {
  lead: LeadItem | null;
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  onMensagemEnviada?: () => void;
}

export function WhatsAppModal({
  lead,
  aberto,
  onOpenChange,
  onMensagemEnviada,
}: WhatsAppModalProps) {
  const [mensagem, setMensagem] = useState(() =>
    lead
      ? gerarMensagemPadrao({
          telefone: lead.telefone ?? "",
          nomeEmpresa: lead.nome,
          categoria: lead.categoria,
          cidadeOuBairro: lead.bairro || lead.cidade,
          instagram: lead.instagram,
        })
      : "",
  );
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (lead) {
      setMensagem(
        gerarMensagemPadrao({
          telefone: lead.telefone ?? "",
          nomeEmpresa: lead.nome,
          categoria: lead.categoria,
          cidadeOuBairro: lead.bairro || lead.cidade,
          instagram: lead.instagram,
        }),
      );
    }
  }, [lead]);

  if (!lead) return null;

  const resetarMensagem = () => {
    setMensagem(
      gerarMensagemPadrao({
        telefone: lead.telefone ?? "",
        nomeEmpresa: lead.nome,
        categoria: lead.categoria,
        cidadeOuBairro: lead.bairro || lead.cidade,
        instagram: lead.instagram,
      }),
    );
  };

  const copiarTexto = async () => {
    try {
      await navigator.clipboard.writeText(mensagem);
      setCopiado(true);
      toast.success("Mensagem copiada para a área de transferência!");
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const enviarWhatsApp = async () => {
    if (!lead.telefone) {
      toast.error("Este lead não possui telefone cadastrado.");
      return;
    }

    const url = gerarLinkWhatsApp(
      {
        telefone: lead.telefone,
        nomeEmpresa: lead.nome,
      },
      mensagem,
    );

    // Registrar interação
    await leadsService.registrarInteracao({
      lead_id: lead.id,
      tipo: "whatsapp",
      descricao: mensagem,
    });

    // Se estava como "novo", avança automaticamente para "contatado"
    if (lead.status === "novo") {
      await leadsService.atualizarStatusLead(lead.id, "contatado");
    }

    await auditoriaService.registrarAtividade({
      tipo: "whatsapp",
      titulo: `Mensagem WhatsApp disparada`,
      descricao: `Abordagem comercial enviada para "${lead.nome}" via WhatsApp (${lead.telefone}).`,
      lead_id: lead.id,
      lead_nome: lead.nome,
      metadados: { telefone: lead.telefone, mensagem_tamanho: mensagem.length },
    });

    // Abre o WhatsApp
    window.open(url, "_blank", "noopener,noreferrer");

    toast.success("WhatsApp aberto e status atualizado para 'Contatado'!");
    onOpenChange(false);
    onMensagemEnviada?.();
  };

  const telFormatado = lead.telefone ? limparTelefone(lead.telefone) : null;

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border shadow-elev">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <MessageSquare className="size-4" />
            </span>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Abordar no WhatsApp
              </DialogTitle>
              <DialogDescription className="text-xs">
                {lead.nome} · {lead.telefone || "Sem telefone"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Modelo de mensagem comercial</span>
            <button
              type="button"
              onClick={resetarMensagem}
              className="text-primary hover:underline text-[11px]"
            >
              Restaurar padrão
            </button>
          </div>

          <Textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            rows={7}
            className="text-xs font-mono leading-relaxed resize-none bg-surface/70 border-border"
            placeholder="Digite a mensagem personalizada..."
          />

          <div className="rounded-lg bg-secondary/50 p-2.5 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>
              Destino: <strong className="text-foreground">+{telFormatado || "N/D"}</strong>
            </span>
            <span className="text-emerald-400 font-medium">Auto-avanço para "Contatado"</span>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copiarTexto}
            className="text-xs gap-1.5 h-8"
          >
            {copiado ? (
              <>
                <Check className="size-3.5 text-emerald-400" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                Copiar Texto
              </>
            )}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={enviarWhatsApp}
              disabled={!lead.telefone}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5 h-8 font-semibold shadow-sm"
            >
              <Send className="size-3.5" />
              Abrir Conversa
              <ExternalLink className="size-3 opacity-70" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const ModalMensagemWhatsApp = WhatsAppModal;
