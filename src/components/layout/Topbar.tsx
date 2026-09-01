import { ReactNode } from "react";
import { Search, Menu, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
  onAbrirMobile: () => void;
  onAbrirBusca: () => void;
}

export function Topbar({
  titulo,
  descricao,
  acoes,
  onAbrirMobile,
  onAbrirBusca,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border/70 bg-background/90 px-4 md:px-6 backdrop-blur-xl shrink-0 select-none">
      {/* Lado Esquerdo: Mobile Trigger + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Button
          variant="outline"
          size="icon"
          onClick={onAbrirMobile}
          className="lg:hidden size-8.5 border-border/80 shrink-0"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="size-4" />
        </Button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm sm:text-base font-bold text-foreground tracking-tight">
            {titulo}
          </h1>
          {descricao && (
            <p className="text-[11px] text-muted-foreground truncate hidden md:block">
              {descricao}
            </p>
          )}
        </div>
      </div>

      {/* Lado Direito: Command Palette trigger + Status + Notificações + Ações */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Trigger de Busca / Command Palette */}
        <button
          type="button"
          onClick={onAbrirBusca}
          className="flex items-center gap-2 h-8 px-3 rounded-lg border border-border/80 bg-surface/50 text-xs text-muted-foreground hover:bg-surface hover:text-foreground hover:border-primary/40 transition-all shadow-xs cursor-pointer"
        >
          <Search className="size-3.5 text-primary" />
          <span className="hidden sm:inline">Buscar empresas ou ações...</span>
          <span className="sm:hidden">Buscar...</span>
          <kbd className="pointer-events-none hidden md:inline-flex items-center gap-0.5 text-[10px] font-mono bg-secondary/80 px-1.5 py-0.5 rounded border border-border text-muted-foreground ml-1">
            ⌘K
          </kbd>
        </button>

        {/* Live Status Radar */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-secondary/40 border border-border/60 text-[11px] font-mono text-muted-foreground dado">
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
          </span>
          <span>Radar · Ativo</span>
        </div>

        {/* Slot de Ações da Página */}
        {acoes && <div className="flex items-center gap-1.5 sm:gap-2">{acoes}</div>}
      </div>
    </header>
  );
}
