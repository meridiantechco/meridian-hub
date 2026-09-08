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
  Kanban,
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

export interface NavItem {
  para: string;
  rotulo: string;
  icone: typeof LayoutDashboard;
  somenteAdmin?: boolean;
  badge?: string;
}

export const ITENS_NAV: NavItem[] = [
  { para: "/nova-busca", rotulo: "Buscar Clientes", icone: Search, badge: "Radar" },
  { para: "/painel", rotulo: "Dashboard", icone: LayoutDashboard },
  { para: "/funil", rotulo: "Quadro Kanban", icone: Kanban, badge: "Status" },
  { para: "/leads", rotulo: "Meus Clientes", icone: Building2 },
  { para: "/templates", rotulo: "Templates & Scripts", icone: MessageSquare },
  { para: "/financeiro", rotulo: "Financeiro", icone: Wallet },
  { para: "/usuarios", rotulo: "Equipe", icone: Settings, somenteAdmin: true },
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
              <p className="rotulo text-[9.5px] text-muted-foreground/75">Inteligência Comercial</p>
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 space-y-1.5">
        <nav className="flex flex-col gap-1.5">
          {ITENS_NAV.map((item) => {
            const conteudoLink = (
              <Link
                key={item.para}
                to={item.para}
                className={cn(
                  "flex items-center gap-3 rounded-2xl text-xs font-medium text-muted-foreground transition-all duration-200 group relative",
                  colapsada
                    ? "h-11 w-11 justify-center mx-auto p-0"
                    : "px-3.5 py-2.5 justify-between hover:bg-secondary/60 hover:text-foreground",
                )}
                activeProps={{
                  className: cn(
                    "bg-foreground text-background font-semibold shadow-md",
                    colapsada && "bg-foreground text-background shadow-md",
                  ),
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <item.icone
                    className={cn(
                      "size-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                    )}
                  />
                  {!colapsada && (
                    <span className="truncate text-xs font-medium">{item.rotulo}</span>
                  )}
                </div>

                {!colapsada && item.badge && (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );

            if (colapsada) {
              return (
                <Tooltip key={item.para}>
                  <TooltipTrigger asChild>{conteudoLink}</TooltipTrigger>
                  <TooltipContent side="right" className="flex items-center gap-2 rounded-xl">
                    <span>{item.rotulo}</span>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-mono">
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
                  {resolvedTheme === "dark" ? (
                    <Moon className="size-3.5 mr-2" />
                  ) : (
                    <Sun className="size-3.5 mr-2" />
                  )}
                  Tema
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme("light")} className="text-xs">
                    Claro
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")} className="text-xs">
                    Escuro
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")} className="text-xs">
                    Sistema
                  </DropdownMenuItem>
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
                {resolvedTheme === "dark" ? (
                  <Sun className="size-3.5" />
                ) : (
                  <Moon className="size-3.5" />
                )}
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
