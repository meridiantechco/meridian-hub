import { useState } from "react";
import { Copy, Check, KeyRound, MessageSquare, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface UserCredentialsModalProps {
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  textoConvite: string;
}

export function UserCredentialsModal({
  aberto,
  onOpenChange,
  textoConvite,
}: UserCredentialsModalProps) {
  const [copiado, setCopiado] = useState(false);

  const copiarTexto = async () => {
    try {
      await navigator.clipboard.writeText(textoConvite);
      setCopiado(true);
      toast.success("Credenciais copiadas para a área de transferência!");
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      toast.error("Não foi possível copiar automaticamente.");
    }
  };

  const enviarWhatsApp = () => {
    const textoCodificado = encodeURIComponent(textoConvite);
    window.open(`https://api.whatsapp.com/send?text=${textoCodificado}`, "_blank");
  };

  const enviarEmail = () => {
    const assunto = encodeURIComponent("Seu Convite de Acesso — Meridian Hub");
    const corpo = encodeURIComponent(textoConvite);
    window.open(`mailto:?subject=${assunto}&body=${corpo}`, "_blank");
  };

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base flex items-center gap-2">
            <KeyRound className="size-4 text-emerald-400" />
            Credenciais de Acesso Geradas
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Envie as credenciais abaixo para o novo membro da equipe acessar a plataforma no primeiro acesso.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-3">
          <Textarea
            value={textoConvite}
            readOnly
            rows={8}
            className="text-xs font-mono bg-surface/70 border-border resize-none leading-relaxed"
          />

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copiarTexto}
              className="text-xs gap-1.5 h-8 font-semibold flex-1"
            >
              {copiado ? (
                <>
                  <Check className="size-3.5 text-emerald-400" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  Copiar Convite
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={enviarWhatsApp}
              className="text-xs gap-1.5 h-8 font-semibold border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            >
              <MessageSquare className="size-3.5" />
              WhatsApp
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={enviarEmail}
              className="text-xs gap-1.5 h-8 font-semibold"
            >
              <Mail className="size-3.5" />
              E-mail
            </Button>
          </div>
        </div>

        <DialogFooter className="pt-2 border-t border-border flex items-center justify-end">
          <Button
            type="button"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8 bg-primary text-primary-foreground font-semibold px-4"
          >
            Concluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
