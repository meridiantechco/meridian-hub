import { useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, type ReactNode } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MeridianLogo } from "@/components/brand/MeridianLogo";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LogOut } from "lucide-react";
import { useAuth } from "@/features/auth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  PageHeaderProvider,
  usePageHeaderContext,
  usePageHeader,
} from "@/contexts/PageHeaderContext";

import { Sidebar, ITENS_NAV } from "./Sidebar";
import { Topbar } from "./Topbar";
import { CommandPalette } from "./CommandPalette";
import { ThemeToggle } from "./ThemeToggle";

interface AppShellProps {
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
  children: ReactNode;
}

/**
 * Layout persistente de alto desempenho montado na rota raiz autenticada.
 * A Sidebar, Topbar, atalhos de teclado e Sheet mobile NUNCA são destruídos ao navegar.
 */
export function AppPersistentLayout({ children }: { children: ReactNode }) {
  return (
    <PageHeaderProvider>
      <AppPersistentLayoutInner>{children}</AppPersistentLayoutInner>
    </PageHeaderProvider>
  );
}

function AppPersistentLayoutInner({ children }: { children: ReactNode }) {
  const { ehAdmin, nome, user } = useAuth();
  const navigate = useNavigate();
  const { header } = usePageHeaderContext();

  // Estado da barra lateral (expandida ou colapsada) com persistência em localStorage
  const [colapsada, setColapsada] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const salvo = localStorage.getItem("meridian_sidebar_colapsada");
      return salvo === "true";
    } catch {
      return false;
    }
  });

  const [mobileAberto, setMobileAberto] = useState(false);
  const [buscaAberta, setBuscaAberta] = useState(false);

  // Atalho global Cmd+K / Ctrl+K registrado uma única vez no ciclo de vida
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setBuscaAberta((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleSidebar = () => {
    setColapsada((prev) => {
      const novo = !prev;
      try {
        localStorage.setItem("meridian_sidebar_colapsada", String(novo));
      } catch {
        // storage restrito
      }
      return novo;
    });
  };

  const handleSair = async () => {
    await supabase.auth.signOut();
    void navigate({ to: "/auth" });
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen bg-background text-foreground flex antialiased selection:bg-primary/25">
        {/* SIDEBAR DESKTOP FIXA E PERSISTENTE */}
        <Sidebar colapsada={colapsada} onToggle={toggleSidebar} onSair={handleSair} />

        {/* CONTAINER PRINCIPAL */}
        <div
          className={cn(
            "flex-1 flex flex-col min-w-0 transition-[padding] duration-250 ease-in-out pb-16 lg:pb-0 overflow-x-hidden",
            colapsada ? "lg:pl-[72px]" : "lg:pl-64",
          )}
        >
          {/* TOPBAR DINÂMICA ALIMENTADA PELO CONTEXTO DA PÁGINA ATIVA */}
          <Topbar
            titulo={header.titulo}
            descricao={header.descricao}
            acoes={header.acoes}
            onAbrirMobile={() => setMobileAberto(true)}
            onAbrirBusca={() => setBuscaAberta(true)}
          />

          {/* ÁREA DE CONTEÚDO COM TRANSIÇÃO ULTRA-FLUIDA */}
          <main className="flex-1 min-h-[calc(100vh-64px)] p-3 sm:p-5 md:p-6 lg:p-7 min-w-0">
            <div className="max-w-[1600px] mx-auto w-full space-y-6">{children}</div>
          </main>
        </div>

        {/* SHEET DE NAVEGAÇÃO MOBILE */}
        <Sheet open={mobileAberto} onOpenChange={setMobileAberto}>
          <SheetContent side="left" className="w-72 bg-sidebar p-0 border-r border-sidebar-border">
            <SheetTitle className="sr-only">Navegação Principal</SheetTitle>
            <div className="flex items-center gap-2.5 border-b border-sidebar-border px-4 py-4">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
                <MeridianLogo variant="light" size="custom" className="size-5" />
              </span>
              <div className="leading-tight">
                <p className="font-display text-base font-bold tracking-tight">Meridian</p>
                <p className="rotulo text-[9.5px] text-muted-foreground/80">
                  Inteligência Comercial
                </p>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-140px)] p-3 space-y-2">
              <nav className="flex flex-col gap-1.5">
                {ITENS_NAV.filter((item) => !item.somenteAdmin || ehAdmin).map((item) => (
                  <Link
                    key={item.para}
                    to={item.para}
                    onClick={() => setMobileAberto(false)}
                    className="flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                    activeProps={{
                      className: "bg-foreground text-background font-semibold shadow-xs",
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icone className="size-4 shrink-0" />
                      <span>{item.rotulo}</span>
                    </div>
                    {item.badge && (
                      <Badge
                        variant="outline"
                        className="text-[9px] border-primary/40 text-primary rounded-full"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="absolute bottom-0 inset-x-0 border-t border-sidebar-border p-3.5 bg-sidebar">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="rotulo text-[9px]">Usuário Ativo</p>
                  <p className="truncate text-xs font-semibold text-foreground">
                    {nome || user?.email}
                  </p>
                </div>
                <ThemeToggle variant="icon" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs text-destructive hover:bg-destructive/10 h-7 px-2"
                onClick={handleSair}
              >
                <LogOut className="size-3.5 mr-2" /> Encerrar Sessão
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* COMMAND PALETTE */}
        <CommandPalette aberto={buscaAberta} onOpenChange={setBuscaAberta} />
      </div>
    </TooltipProvider>
  );
}

/**
 * Componente AppShell compatível com todas as páginas do sistema.
 * Quando montado dentro de AppPersistentLayout, apenas atualiza o cabeçalho
 * e exibe o conteúdo com transição suave de 0ms sem remontar a casca externa.
 */
export function AppShell({ titulo, descricao, acoes, children }: AppShellProps) {
  const { isPersistentLayout } = usePageHeader({ titulo, descricao, acoes });

  if (isPersistentLayout) {
    return (
      <div className="animate-in fade-in-50 duration-150 ease-out space-y-6 w-full">{children}</div>
    );
  }

  // Fallback seguro caso o componente seja renderizado fora do layout persistente
  return (
    <AppPersistentLayout>
      <div className="animate-in fade-in-50 duration-150 ease-out space-y-6 w-full">{children}</div>
    </AppPersistentLayout>
  );
}
