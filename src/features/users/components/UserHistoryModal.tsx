import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Activity, Calendar } from "lucide-react";
import type { AtividadeUsuario } from "@/features/audit";
import type { UsuarioEquipe } from "../types";

interface UserHistoryModalProps {
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  usuario: UsuarioEquipe | null;
  atividades: AtividadeUsuario[];
}

export function UserHistoryModal({
  aberto,
  onOpenChange,
  usuario,
  atividades,
}: UserHistoryModalProps) {
  if (!usuario) return null;

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            Histórico de Atividades — {usuario.nome}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {usuario.email} · {usuario.papel === "admin" ? "Administrador" : "Vendedor / SDR"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
          {atividades.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-lg border border-border/80 bg-surface/50 space-y-1 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{item.titulo}</span>
                <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                  <Calendar className="size-3" />
                  {new Date(item.criado_em).toLocaleString("pt-BR")}
                </span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">{item.descricao}</p>
            </div>
          ))}

          {atividades.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-8">
              Nenhuma atividade registrada para este usuário ainda.
            </p>
          )}
        </div>

        <DialogFooter className="pt-2 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
