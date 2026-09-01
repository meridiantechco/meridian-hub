import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Target,
  Building2,
  Sun,
  Moon,
  Laptop,
  CheckSquare,
  Calendar,
  History,
  Search,
  Zap,
  MessageSquare,
  Wallet,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";
import { MeridianLogo } from "@/components/brand/MeridianLogo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export interface NavGroup {
  rotulo?: string;
  itens: {
    para: string;
    rotulo: string;
    icone: typeof LayoutDashboard;
    somenteAdmin?: boolean;
    badge?: string;
  }[];
}

export const GRUPOS_NAV: NavGroup[] = [
  {
    rotulo: "Overview",
    itens: [
      { para: "/painel", rotulo: "Dashboard", icone: LayoutDashboard },
      { para: "/opportunities", rotulo: "Oportunidades", icone: Target, badge: "Foco" },
    ],
  },
  {
    rotulo: "CRM",
    itens: [
      { para: "/leads", rotulo: "Relacionamentos", icone: Building2 },
    ],
  },
  {
    rotulo: "Operação",
    itens: [
      { para: "/today", rotulo: "Hoje", icone: Sun },
      { para: "/tasks", rotulo: "Tarefas", icone: CheckSquare },
      { para: "/calendar", rotulo: "Agenda", icone: Calendar },
      { para: "/activities", rotulo: "Atividades", icone: History },
    ],
  },
  {
    rotulo: "Prospecção",
    itens: [
      { para: "/nova-busca", rotulo: "Buscar Empresas", icone: Search },
    ],
  },
  {
    rotulo: "Comunicação & Automação",
    itens: [
      { para: "/automations", rotulo: "Workflows", icone: Zap, badge: "Auto" },
      { para: "/templates", rotulo: "Templates & Scripts", icone: MessageSquare },
    ],
  },
  {
    rotulo: "Financeiro",
    itens: [
      { para: "/financeiro", rotulo: "Financeiro", icone: Wallet },
    ],
  },
  {
    rotulo: "Sistema",
    itens: [
      { para: "/usuarios", rotulo: "Configurações & Equipe", icone: Settings },
    ],
  },
];

interface SidebarProps {
  colapsada: boolean;
  onToggle: () => void;
  onSair: () => void;
}

export function Sidebar({ colapsada, onToggle, onSair }: SidebarProps) {
  const { ehAdmin, nome, papel, user } = useAuth();
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  const iniciaisNome = (nome || user?.email || "M")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-sidebar-border/80 bg-sidebar/95 backdrop-blur-xl transition-[width] duration-250 ease-in-out lg:flex select-none",
        colapsada ? "w-[72px]" : "w-64",
      )}
    >
      {/* HEADER DA SIDEBAR */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border/70 px-3.5 shrink-0">
        <Link to="/painel" className="flex items-center gap-3 min-w-0 group">
          <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent text-primary border border-primary/30 shadow-[0_0_16px_rgba(168,85,247,0.25)] transition-all duration-200 group-hover:scale-105 group-hover:border-primary/50">
            <MeridianLogo
              variant="light"
              size="custom"
              className="size-5 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
            />
            <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-emerald-400 border border-sidebar shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          </div>

          {!colapsada && (
            <div className="leading-tight min-w-0 animate-in fade-in duration-150">
              <p className="font-display text-sm font-bold tracking-tight text-sidebar-foreground">
                Meridian
              </p>
              <p className="rotulo text-[9.5px] text-muted-foreground/75">
                Inteligência Comercial
              </p>
            </div>
          )}
        </Link>

        {!colapsada && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="size-7 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/70 transition-colors"
            title="Recolher barra lateral"
          >
            <PanelLeftClose className="size-4" />
          </Button>
        )}
      </div>

      {/* BOTÃO EXPANDIR QUANDO COLAPSADA */}
      {colapsada && (
        <div className="flex justify-center pt-2 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="size-8 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/70"
              >
                <PanelLeftOpen className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Expandir menu lateral</TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* LISTA DE NAVEGAÇÃO */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 space-y-4">
        {GRUPOS_NAV.map((grupo, gIdx) => {
          const itensVisiveis = grupo.itens.filter((i) => !i.somenteAdmin || ehAdmin);
          if (itensVisiveis.length === 0) return null;

          return (
            <div key={grupo.rotulo || gIdx} className="space-y-1">
              {!colapsada && grupo.rotulo && (
                <div className="px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wider rotulo text-muted-foreground/60 select-none">
                  {grupo.rotulo}
                </div>
              )}

              {colapsada && (
                <div className="my-1 border-t border-sidebar-border/40 mx-2" />
              )}

              <nav className="flex flex-col gap-0.5">
                {itensVisiveis.map((item) => {
                  const conteudoLink = (
                    <Link
                      key={item.para}
                      to={item.para}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg text-xs font-medium text-sidebar-foreground/75 transition-all duration-150 group relative",
                        colapsada
                          ? "h-10 w-10 justify-center mx-auto p-0"
                          : "px-2.5 py-1.5 justify-between hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
                      )}
                      activeProps={{
                        className: cn(
                          "bg-primary/15 text-foreground font-semibold border-l-2 border-l-primary shadow-xs",
                          colapsada && "border-l-0 bg-primary/20 text-primary",
                        ),
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <item.icone
                          className={cn(
                            "size-4 shrink-0 transition-colors text-muted-foreground group-hover:text-primary",
                          )}
                        />
                        {!colapsada && (
                          <span className="truncate text-xs">{item.rotulo}</span>
                        )}
                      </div>

                      {!colapsada && item.badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-primary/20 text-primary border border-primary/30">
                          {item.badge}
                        </span>
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
                            <span className="text-[10px] px-1 py-0.5 rounded bg-primary/20 text-primary font-mono">
                              {item.badge}
                            </span>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return conteudoLink;
                })}
              </nav>
            </div>
          );
        })}
      </div>

      {/* RODAPÉ DA SIDEBAR: PERFIL, TEMA & LOGOUT */}
      <div className="border-t border-sidebar-border/70 p-2 shrink-0">
        {colapsada ? (
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="size-10 rounded-xl p-0 hover:bg-sidebar-accent/70 mx-auto flex items-center justify-center"
                  >
                    <Avatar className="size-8 border border-border/80">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold font-mono">
                        {iniciaisNome}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right">Perfil de Usuário</TooltipContent>
            </Tooltip>
            <DropdownMenuContent side="right" align="end" className="w-56 bg-card border-border">
              <DropdownMenuLabel className="font-normal p-2">
                <p className="text-xs font-bold text-foreground">{nome || "Operador"}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/30">
                  {papel || (ehAdmin ? "Administrador" : "Vendedor")}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/60" />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-xs cursor-pointer">
                  {resolvedTheme === "dark" ? <Moon className="size-3.5 mr-2" /> : <Sun className="size-3.5 mr-2" />}
                  Tema
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme("light")} className="text-xs">Claro</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")} className="text-xs">Escuro</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")} className="text-xs">Sistema</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator className="bg-border/60" />
              <DropdownMenuItem
                onClick={onSair}
                className="text-destructive focus:bg-destructive/15 cursor-pointer text-xs"
              >
                <LogOut className="size-3.5 mr-2" /> Encerrar Sessão
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center justify-between p-1.5 rounded-xl bg-surface/40 border border-border/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="size-8 border border-border/80 shrink-0">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold font-mono">
                  {iniciaisNome}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-xs font-bold text-foreground">{nome || "Operador"}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {papel || (ehAdmin ? "Admin" : "Vendedor")}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="size-7 text-muted-foreground hover:text-foreground transition-colors"
                title="Alternar tema"
              >
                {resolvedTheme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSair}
                className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Encerrar Sessão"
              >
                <LogOut className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
