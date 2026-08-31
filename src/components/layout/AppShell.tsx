import { Link, useNavigate } from "@tanstack/react-router";
import {
  Compass,
  LayoutDashboard,
  LogOut,
  History,
  Menu,
  Search,
  Kanban,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
  Radio,
  Command as CommandIcon,
  Sparkles,
  ExternalLink,
  Radar,
  Building2,
  Wallet,
} from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { MeridianLogo } from "@/components/brand/MeridianLogo";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth";
import { supabase } from "@/integrations/supabase/client";
import { prospectaService } from "@/lib/prospecta-service";
import type { LeadItem } from "@/lib/leads-mock";
import { cn } from "@/lib/utils";

type ItemNav = {
  para: string;
  rotulo: string;
  icone: typeof LayoutDashboard;
  somenteAdmin?: boolean;
  badge?: string;
};

const itens: ItemNav[] = [
  { para: "/painel", rotulo: "Painel Comercial", icone: LayoutDashboard },
  { para: "/nova-busca", rotulo: "Detectar Empresas", icone: Radar, badge: "Scanner" },
  { para: "/leads", rotulo: "Base de Estabelecimentos", icone: Building2 },
  { para: "/funil", rotulo: "Funil Comercial", icone: Kanban },
  { para: "/financeiro", rotulo: "Financeiro & Planos", icone: Wallet, badge: "Gestão" },
  { para: "/buscas", rotulo: "Histórico de Buscas", icone: History },
  { para: "/usuarios", rotulo: "Usuários & Equipe", icone: Users, somenteAdmin: true },
];

export function AppShell({
  titulo,
  descricao,
  acoes,
  children,
}: {
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
  children: ReactNode;
}) {
  const { ehAdmin, nome, papel, user } = useAuth();
  const navigate = useNavigate();

  // Estado da barra lateral (expandida ou colapsada) com inicialização síncrona
  const [colapsada, setColapsada] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const salvo =
        localStorage.getItem("meridian_sidebar_colapsada") ??
        localStorage.getItem("prospecta_sidebar_colapsada");
      return salvo === "true";
    } catch {
      return false;
    }
  });
  const [mobileAberto, setMobileAberto] = useState(false);

  // Command palette / Busca Rápida
  const [buscaModalAberta, setBuscaModalAberta] = useState(false);
  const [termoBuscaRapida, setTermoBuscaRapida] = useState("");
  const [leadsBuscaRapida, setLeadsBuscaRapida] = useState<LeadItem[]>([]);

  // Atalho de Teclado Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setBuscaModalAberta((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Carregar leads para o modal de busca quando aberto
  useEffect(() => {
    if (buscaModalAberta && leadsBuscaRapida.length === 0) {
      void prospectaService.listarLeads().then((lista) => {
        setLeadsBuscaRapida(lista);
      });
    }
  }, [buscaModalAberta, leadsBuscaRapida.length]);

  const toggleSidebar = () => {
    setColapsada((prev) => {
      const novo = !prev;
      try {
        localStorage.setItem("meridian_sidebar_colapsada", String(novo));
      } catch {
        // Storage inacessível em ambiente restrito
      }
      return novo;
    });
  };

  async function sair() {
    await supabase.auth.signOut();
    void navigate({ to: "/auth" });
  }

  const leadsFiltradosBusca = leadsBuscaRapida
    .filter((l) => {
      if (!termoBuscaRapida.trim()) return true;
      const t = termoBuscaRapida.toLowerCase();
      return (
        l.nome.toLowerCase().includes(t) ||
        (l.categoria || "").toLowerCase().includes(t) ||
        (l.bairro || "").toLowerCase().includes(t) ||
        (l.cidade || "").toLowerCase().includes(t)
      );
    })
    .slice(0, 8);

  const iniciaisNome = (nome || user?.email || "M")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen bg-background text-foreground flex">
        {/* ========================================================================= */}
        {/* SIDEBAR DESKTOP (EXPANSÍVEL / COLAPSÁVEL) */}
        {/* ========================================================================= */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-sidebar-border/80 bg-sidebar/95 backdrop-blur-xl transition-all duration-300 ease-in-out lg:flex",
            colapsada ? "w-20" : "w-64",
          )}
        >
          {/* TOPO DA SIDEBAR: LOGO & BOTÃO TOGGLE */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border/70 px-3.5">
            <Link to="/painel" className="flex items-center gap-3 min-w-0 group">
              <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 via-primary/10 to-transparent text-primary border border-primary/30 shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all duration-300 group-hover:scale-105 group-hover:border-primary/50 group-hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]">
                <MeridianLogo
                  variant="light"
                  size="custom"
                  className="size-5.5 drop-shadow-[0_0_8px_rgba(255,255,255,0.45)] transition-transform group-hover:scale-110"
                />
                <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 border-2 border-sidebar shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              </div>

              {!colapsada && (
                <div className="leading-tight min-w-0 animate-in fade-in duration-200">
                  <p className="font-display text-base font-bold tracking-tight text-sidebar-foreground">
                    Meridian Hub
                  </p>
                  <p className="rotulo text-[10px] text-muted-foreground flex items-center gap-1">
                    <span>Meridian Tech</span>
                    <span className="size-1 rounded-full bg-primary/60" />
                    <span>B2B Intel</span>
                  </p>
                </div>
              )}
            </Link>

            {!colapsada && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="size-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                title="Recolher barra lateral"
              >
                <PanelLeftClose className="size-4" />
              </Button>
            )}
          </div>

          {/* BOTÃO TOGGLE QUANDO COLAPSADA */}
          {colapsada && (
            <div className="flex justify-center pt-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="size-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  >
                    <PanelLeftOpen className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Expandir menu</TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* ITENS DE NAVEGAÇÃO */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 space-y-1">
            {!colapsada && (
              <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest rotulo">
                Inteligência Comercial
              </div>
            )}

            <nav className="flex flex-col gap-1">
              {itens
                .filter((item) => !item.somenteAdmin || ehAdmin)
                .map((item) => {
                  const conteudoLink = (
                    <Link
                      key={item.para}
                      to={item.para}
                      className={cn(
                        "group relative flex items-center rounded-xl py-2.5 text-sm font-medium transition-all duration-150",
                        colapsada
                          ? "justify-center px-0 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                          : "gap-3 px-3 text-sidebar-foreground/75 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground",
                      )}
                      activeProps={{
                        className: colapsada
                          ? "bg-primary/15 text-primary border border-primary/30 shadow-[0_0_15px_rgba(168,85,247,0.3)] font-semibold"
                          : "bg-gradient-to-r from-primary/15 to-transparent text-sidebar-foreground font-semibold border-l-3 border-l-primary pl-3 shadow-sm",
                      }}
                    >
                      <item.icone
                        className={cn(
                          "size-5 shrink-0 transition-transform group-hover:scale-110",
                          "group-data-[state=active]:text-primary",
                        )}
                      />

                      {!colapsada && (
                        <div className="flex flex-1 items-center justify-between min-w-0">
                          <span className="truncate">{item.rotulo}</span>
                          {item.badge && (
                            <span className="rounded-full bg-primary/20 border border-primary/30 px-1.5 py-0.2 text-[10px] font-mono font-bold text-primary">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  );

                  if (colapsada) {
                    return (
                      <Tooltip key={item.para}>
                        <TooltipTrigger asChild>{conteudoLink}</TooltipTrigger>
                        <TooltipContent side="right" className="flex items-center gap-2">
                          <span>{item.rotulo}</span>
                          {item.badge && (
                            <Badge
                              variant="outline"
                              className="text-[10px] py-0 px-1 border-primary/40 text-primary"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return conteudoLink;
                })}
            </nav>
          </div>

          {/* CARD DE PROSPECÇÃO / ATALHO RÁPIDO */}
          {!colapsada && (
            <div className="p-3 mx-2 mb-2 rounded-xl bg-gradient-to-b from-surface/80 to-surface/40 border border-border/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Radio className="size-3.5 text-[var(--color-alerta)] animate-pulse" />
                  Radar Automático
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">ATIVO</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Varredura geolocalizada B2B ativa para todas as cidades do Brasil.
              </p>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full h-7 text-xs border-primary/30 text-primary hover:bg-primary/10 gap-1"
              >
                <Link to="/nova-busca">
                  <Sparkles className="size-3" />
                  Escanear Área
                </Link>
              </Button>
            </div>
          )}

          {/* RODAPÉ DA SIDEBAR: PERFIL DO USUÁRIO & LOGOUT */}
          <div className="border-t border-sidebar-border/70 p-2.5">
            {colapsada ? (
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <button className="flex size-10 w-full items-center justify-center rounded-xl bg-secondary/70 hover:bg-sidebar-accent transition-colors border border-border/50">
                        <Avatar className="size-8">
                          <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold font-mono">
                            {iniciaisNome}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="right">Opções do Usuário</TooltipContent>
                </Tooltip>

                <DropdownMenuContent
                  side="right"
                  align="end"
                  className="w-56 bg-card border-border p-2"
                >
                  <DropdownMenuLabel className="font-normal">
                    <p className="font-semibold text-xs truncate">{nome || user?.email}</p>
                    <p className="text-[10px] text-muted-foreground capitalize flex items-center gap-1 mt-0.5">
                      <Shield className="size-3 text-primary" /> {papel ?? "operador"}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={sair}
                    className="text-destructive focus:text-destructive text-xs cursor-pointer"
                  >
                    <LogOut className="size-3.5 mr-2" /> Encerrar Sessão
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center justify-between gap-2 rounded-xl bg-secondary/50 p-2 border border-border/50">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold font-mono">
                      {iniciaisNome}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="truncate text-xs font-bold text-foreground">
                      {nome || user?.email}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground capitalize flex items-center gap-1">
                      <Shield className="size-2.5 text-primary" /> {papel ?? "operador"}
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={sair}
                  className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Sair"
                >
                  <LogOut className="size-3.5" />
                </Button>
              </div>
            )}
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* CONTEÚDO PRINCIPAL COM AJUSTE DE PADDING CONFORME A SIDEBAR */}
        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* CONTEÚDO PRINCIPAL COM AJUSTE DE PADDING CONFORME A SIDEBAR */}
        {/* ========================================================================= */}
        <div
          className={cn(
            "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out pb-20 lg:pb-0 overflow-x-hidden",
            colapsada ? "lg:pl-20" : "lg:pl-64",
          )}
        >
          {/* HEADER PRINCIPAL */}
          <header className="sticky top-0 z-20 flex min-h-16 h-auto py-2.5 sm:py-0 sm:h-16 items-center justify-between gap-2 sm:gap-3 border-b border-border/70 bg-background/90 px-3 sm:px-4 backdrop-blur-xl md:px-6">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Sheet open={mobileAberto} onOpenChange={setMobileAberto}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="lg:hidden size-9 border-border/80 shrink-0"
                    aria-label="Abrir menu de navegação"
                  >
                    <Menu className="size-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-72 bg-sidebar p-0 border-r border-sidebar-border"
                >
                  <SheetTitle className="sr-only">Navegação Meridian Hub</SheetTitle>
                  <div className="flex items-center gap-2.5 border-b border-sidebar-border px-4 py-4">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
                      <MeridianLogo variant="light" size="custom" className="size-5 drop-shadow-[0_0_6px_rgba(255,255,255,0.45)]" />
                    </span>
                    <div className="leading-tight">
                      <p className="font-display text-base font-bold tracking-tight">Meridian Hub</p>
                      <p className="rotulo text-[10px]">Meridian Tech</p>
                    </div>
                  </div>
                  <nav className="flex flex-col gap-1 p-3">
                    {itens
                      .filter((item) => !item.somenteAdmin || ehAdmin)
                      .map((item) => (
                        <Link
                          key={item.para}
                          to={item.para}
                          onClick={() => setMobileAberto(false)}
                          className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                          activeProps={{
                            className:
                              "bg-sidebar-accent text-sidebar-foreground font-semibold border-l-2 border-l-primary",
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <item.icone className="size-4 shrink-0 text-primary" />
                            <span>{item.rotulo}</span>
                          </div>
                          {item.badge && (
                            <Badge
                              variant="outline"
                              className="text-[10px] border-primary/40 text-primary"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      ))}
                  </nav>

                  <div className="absolute bottom-0 inset-x-0 border-t border-sidebar-border p-4 bg-sidebar">
                    <p className="rotulo text-[10px]">Usuário Ativo</p>
                    <p className="truncate text-xs font-semibold">{nome || user?.email}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 w-full justify-start text-xs text-destructive hover:bg-destructive/10"
                      onClick={sair}
                    >
                      <LogOut className="size-3.5 mr-2" /> Sair
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <div className="min-w-0 flex-1">
                <div className="items-center gap-1.5 text-[11px] text-muted-foreground rotulo hidden sm:flex">
                  <span>Meridian Hub</span>
                  <span>/</span>
                  <span className="text-foreground font-medium truncate">{titulo}</span>
                </div>
                <h1 className="truncate text-sm sm:text-base md:text-lg font-bold text-foreground tracking-tight">
                  {titulo}
                </h1>
              </div>
            </div>

            {/* Centro / Direita: Barra de Busca Rápida + Ações */}
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setBuscaModalAberta(true)}
                className="hidden md:flex items-center gap-2 h-8 px-3 rounded-lg border border-border/80 bg-surface/70 text-xs text-muted-foreground hover:bg-surface hover:text-foreground transition-all hover:border-primary/40 shadow-sm"
              >
                <Search className="size-3.5 text-primary" />
                <span>Buscar empresas...</span>
                <kbd className="pointer-events-none items-center gap-0.5 text-[10px] font-mono uppercase bg-secondary/80 px-1.5 py-0.5 rounded border border-border text-muted-foreground ml-2">
                  ⌘K
                </kbd>
              </button>

              <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-secondary/50 border border-border/60 text-[11px] font-mono text-muted-foreground dado">
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
                </span>
                <span>Meridian Radar · Online</span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">{acoes}</div>
            </div>
          </header>

          {/* ÁREA DE CONTEÚDO */}
          <main className="malha-mapa flex-1 min-h-[calc(100vh-64px)] p-3 sm:p-4 md:p-6 lg:p-7 min-w-0">
            {children}
          </main>
        </div>

        {/* BARRA DE NAVEGAÇÃO INFERIOR PARA MOBILE */}
        <div className="fixed bottom-0 inset-x-0 z-40 flex lg:hidden items-center justify-around bg-sidebar/95 backdrop-blur-xl border-t border-border/70 py-1.5 px-1 shadow-lg">
          {itens.slice(0, 5).map((item) => (
            <Link
              key={item.para}
              to={item.para}
              className="flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-1 px-0.5 rounded-lg text-sidebar-foreground/60 transition-colors hover:text-primary active:scale-95"
              activeProps={{
                className: "text-primary font-bold bg-primary/10",
              }}
            >
              <item.icone className="size-5 shrink-0" />
              <span className="text-[10px] font-medium truncate max-w-full text-center tracking-tight">
                {item.rotulo.split(" ")[0]}
              </span>
            </Link>
          ))}
        </div>

        {/* MODAL DE BUSCA GLOBAL (COMMAND PALETTE CMD+K) */}
        <Dialog open={buscaModalAberta} onOpenChange={setBuscaModalAberta}>
          <DialogContent className="max-w-xl p-0 bg-card border-border overflow-hidden shadow-2xl">
            <DialogHeader className="p-4 pb-2 border-b border-border">
              <DialogTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <CommandIcon className="size-4 text-primary" />
                Busca Rápida de Estabelecimentos
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Pesquise por nome da empresa, segmento, bairro ou cidade
              </DialogDescription>

              <div className="relative mt-2">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  autoFocus
                  placeholder="Ex: Farmácia Central, Pituba, Mecânica..."
                  value={termoBuscaRapida}
                  onChange={(e) => setTermoBuscaRapida(e.target.value)}
                  className="pl-9 h-10 text-xs bg-surface border-border/80"
                />
              </div>
            </DialogHeader>

            <div className="max-h-80 overflow-y-auto p-2 divide-y divide-border/50">
              {leadsFiltradosBusca.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => {
                    setBuscaModalAberta(false);
                    void navigate({ to: "/leads/$id", params: { id: lead.id } });
                  }}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/60 cursor-pointer transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {lead.nome}
                      </h4>
                      {!lead.tem_site && (
                        <span className="text-[9px] font-mono uppercase bg-[var(--color-alerta)]/15 text-[var(--color-alerta)] px-1.5 py-0.2 rounded font-bold">
                          Sem Site
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {lead.categoria} · 📍 {lead.bairro || lead.cidade}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pl-3">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {lead.score} pts
                    </span>
                    <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}

              {leadsFiltradosBusca.length === 0 && (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  Nenhum estabelecimento encontrado com este termo.
                </div>
              )}
            </div>

            <div className="p-2.5 bg-surface/80 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground rotulo">
              <span>Pressione ESC para fechar</span>
              <span>{leadsFiltradosBusca.length} resultados</span>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
