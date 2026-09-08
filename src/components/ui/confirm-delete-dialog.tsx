import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo?: string | undefined;
  descricao: ReactNode;
  itemNome?: string | undefined;
  onConfirmar: () => void | Promise<void>;
  carregando?: boolean | undefined;
  textoBotao?: string | undefined;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  titulo = "Confirmar Exclusão?",
  descricao,
  itemNome,
  onConfirmar,
  carregando = false,
  textoBotao = "Sim, Excluir",
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border shadow-elev max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-rose-400 flex items-center gap-2 text-base font-semibold">
            <AlertTriangle className="size-5 shrink-0" />
            {titulo}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
            {descricao}
            {itemNome && (
              <span className="block mt-2 font-medium text-foreground bg-surface/60 p-2 rounded border border-border/60">
                {itemNome}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
          <AlertDialogCancel
            disabled={carregando}
            className="text-xs border-border hover:bg-surface h-8"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              void onConfirmar();
            }}
            disabled={carregando}
            className="bg-rose-600 hover:bg-rose-500 text-white text-xs h-8 font-semibold gap-1.5 cursor-pointer shadow-xs"
          >
            {carregando ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Excluindo...</span>
              </>
            ) : (
              textoBotao
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
