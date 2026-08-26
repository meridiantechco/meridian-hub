import { useState } from "react";
import { Copy, Check, KeyRound } from "lucide-react";
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
      toast.success("Credenciais copiadas com sucesso!");
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      toast.error("Não foi possível copiar.");
    }
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
            Copie as credenciais abaixo e envie para o membro da equipe por WhatsApp ou e-mail.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-3">
          <Textarea
            value={textoConvite}
            readOnly
            rows={7}
            className="text-xs font-mono bg-surface/70 border-border resize-none leading-relaxed"
          />
        </div>

        <DialogFooter className="pt-2 border-t border-border flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copiarTexto}
            className="text-xs gap-1.5 h-8 font-semibold"
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
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8 bg-primary text-primary-foreground font-semibold"
          >
            Concluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
