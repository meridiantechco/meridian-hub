import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, ExternalLink, Send, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { gerarLinkWhatsApp, gerarMensagemPadrao, limparTelefone } from "@/lib/whatsapp";
import type { LeadItem } from "@/lib/leads-mock";
import { prospectaService } from "@/lib/prospecta-service";

interface ModalMensagemWhatsAppProps {
  lead: LeadItem | null;
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  onMensagemEnviada?: () => void;
}

export function ModalMensagemWhatsApp({
  lead,
  aberto,
  onOpenChange,
  onMensagemEnviada,
}: ModalMensagemWhatsAppProps) {
  if (!lead) return null;

  const [mensagem, setMensagem] = useState(() =>
    gerarMensagemPadrao({
      telefone: lead.telefone ?? "",
      nomeEmpresa: lead.nome,
      categoria: lead.categoria,
      cidadeOuBairro: lead.bairro || lead.cidade,
    })
  );
  const [copiado, setCopiado] = useState(false);

  // Recalcular quando o lead mudar
  const resetarMensagem = () => {
    setMensagem(
      gerarMensagemPadrao({
        telefone: lead.telefone ?? "",
        nomeEmpresa: lead.nome,
        categoria: lead.categoria,
        cidadeOuBairro: lead.bairro || lead.cidade,
      })
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
      mensagem
    );

    // Registrar interação
    await prospectaService.registrarInteracao({
      lead_id: lead.id,
      tipo: "whatsapp",
      descricao: "Abordagem comercial inicial via WhatsApp",
      resultado: "Link wa.me gerado e aberto no navegador",
    });

    // Se o lead ainda estava como novo, sugerir ou marcar como contatado
    if (lead.status === "novo") {
      await prospectaService.atualizarStatusLead(lead.id, "contatado");
    }

    toast.success("WhatsApp aberto e interação registrada!");
    window.open(url, "_blank", "noopener,noreferrer");
    onOpenChange(false);
    onMensagemEnviada?.();
  };

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <MessageSquare className="size-5" />
            <DialogTitle className="text-foreground text-lg">
              Iniciar contato via WhatsApp
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-xs">
            Destinatário: <strong className="text-foreground">{lead.nome}</strong> ({lead.telefone || "Sem telefone"})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Mensagem comercial personalizada:</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={resetarMensagem}
            >
              Restaurar padrão
            </Button>
          </div>

          <Textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            className="min-h-[160px] text-xs font-sans resize-none leading-relaxed bg-background/60 border-input"
            placeholder="Digite a mensagem..."
          />

          <div className="rounded-md bg-secondary/50 p-2.5 text-[11px] text-muted-foreground border border-border/50">
            💡 <strong className="text-foreground">Dica comercial:</strong> O link abrirá o WhatsApp Web / App diretamente com esta mensagem pré-formatada. O status do lead será atualizado para <em>Contatado</em>.
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-between sm:justify-between items-center gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copiarTexto}
            className="gap-1.5 text-xs"
          >
            {copiado ? <Check className="size-3.5 text-green-400" /> : <Copy className="size-3.5" />}
            {copiado ? "Copiado" : "Copiar texto"}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={enviarWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 text-xs font-medium"
            >
              <Send className="size-3.5" />
              Abrir no WhatsApp
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
