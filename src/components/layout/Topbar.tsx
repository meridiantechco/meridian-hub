import { ReactNode } from "react";
import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";

interface TopbarProps {
  titulo: string;
  descricao?: string | undefined;
  acoes?: ReactNode | undefined;
  onAbrirMobile: () => void;
  onAbrirBusca: () => void;
}

export function Topbar({ titulo, descricao, acoes, onAbrirMobile, onAbrirBusca }: TopbarProps) {
  const { nome, user } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-2.5 sm:gap-4 border-b border-border/70 bg-background/95 px-3.5 sm:px-5 md:px-6 backdrop-blur-xl shrink-0 select-none">
      {/* Lado Esquerdo: Mobile Trigger + Título */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <Button
          variant="outline"
          size="icon"
          onClick={onAbrirMobile}
          className="lg:hidden size-9 rounded-xl border-border/80 shrink-0"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="size-4" />
        </Button>

        <div className="min-w-0">
          <h1 className="truncate text-sm sm:text-base font-bold text-foreground tracking-tight">
            {titulo}
          </h1>
          {descricao && (
            <p className="text-[11px] text-muted-foreground truncate hidden sm:block max-w-xs xl:max-w-md">
              {descricao}
            </p>
          )}
        </div>
      </div>

      {/* LADO DIREITO: TRIGGER DE BUSCA RÁPIDA / PALETTE + STATUS + AÇÕES */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onAbrirBusca}
          className="flex items-center gap-2 h-9 px-3.5 rounded-full border border-border/80 bg-surface/50 text-xs text-muted-foreground hover:bg-surface hover:text-foreground hover:border-primary/40 transition-all shadow-xs cursor-pointer"
          title="Pesquisa rápida (⌘K)"
        >
          <Search className="size-3.5 text-primary" />
          <span className="hidden sm:inline">Buscar...</span>
          <kbd className="pointer-events-none hidden md:inline-flex items-center text-[10px] font-mono bg-secondary px-1.5 py-0.5 rounded-full border border-border text-muted-foreground ml-0.5">
            ⌘K
          </kbd>
        </button>

        {/* Badge de Operador Privado */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/50 border border-border/60 text-[11px] font-medium text-muted-foreground">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Admin Privativo</span>
        </div>

        {/* Slot de Ações Customizadas da Página */}
        {acoes && <div className="flex items-center gap-1.5 sm:gap-2">{acoes}</div>}
      </div>
    </header>
  );
}
