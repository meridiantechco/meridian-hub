import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Search,
  LayoutDashboard,
  Target,
  Building2,
  Contact,
  Users2,
  Kanban,
  Sun,
  CheckSquare,
  Calendar,
  History,
  Radar,
  MapPin,
  Radio,
  Lightbulb,
  BarChart3,
  Compass,
  FileSpreadsheet,
  Wallet,
  Zap,
  MessageSquare,
  Sparkles,
  Shield,
  Bell,
  ArrowRight,
  ExternalLink,
  Plus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { prospectaService, BadgePriority, type LeadItem } from "@/features/leads";

interface CommandPaletteProps {
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
}

interface ActionItem {
  id: string;
  titulo: string;
  categoria: string;
  icone: any;
  rota?: string;
  acao?: () => void;
}

export function CommandPalette({ aberto, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [termo, setTermo] = useState("");
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [carregandoLeads, setCarregandoLeads] = useState(false);

  useEffect(() => {
    if (aberto && leads.length === 0) {
      setCarregandoLeads(true);
      void prospectaService.listarLeads().then((data) => {
        setLeads(data);
        setCarregandoLeads(false);
      });
    }
  }, [aberto, leads.length]);

  useEffect(() => {
    if (!aberto) {
      setTermo("");
    }
  }, [aberto]);

  const paginas: ActionItem[] = useMemo(
    () => [
      {
        id: "nav-nova-busca",
        titulo: "Buscar Clientes (Minerador no Maps)",
        categoria: "Prospecção",
        icone: Search,
        rota: "/nova-busca",
      },
      {
        id: "nav-leads",
        titulo: "Meus Clientes (Carteira & WhatsApp)",
        categoria: "CRM",
        icone: Building2,
        rota: "/leads",
      },
      {
        id: "nav-templates",
        titulo: "Templates & Scripts (Modelos de WhatsApp)",
        categoria: "Comunicação",
        icone: MessageSquare,
        rota: "/templates",
      },
      {
        id: "nav-painel",
        titulo: "Dashboard Comercial (Métricas & Funil)",
        categoria: "Visão Geral",
        icone: LayoutDashboard,
        rota: "/painel",
      },
      {
        id: "nav-financial",
        titulo: "Painel Financeiro (Fluxo de Caixa)",
        categoria: "Financeiro",
        icone: Wallet,
        rota: "/financeiro",
      },
      {
        id: "nav-usuarios",
        titulo: "Gestão de Equipe & Acessos",
        categoria: "Configurações",
        icone: Shield,
        rota: "/usuarios",
      },
    ],
    [],
  );

  const acoesRapidas: ActionItem[] = useMemo(
    () => [
      {
        id: "act-prospeccao",
        titulo: "Iniciar Nova Busca de Empresas no Google Maps",
        categoria: "Ações",
        icone: Search,
        rota: "/nova-busca",
      },
      {
        id: "act-leads",
        titulo: "Visualizar Meus Clientes e Disparar WhatsApp",
        categoria: "Ações",
        icone: Building2,
        rota: "/leads",
      },
      {
        id: "act-templates",
        titulo: "Acessar Scripts e Mensagens Prontas",
        categoria: "Ações",
        icone: MessageSquare,
        rota: "/templates",
      },
      {
        id: "act-financeiro",
        titulo: "Registrar Novo Gasto ou Receita",
        categoria: "Ações",
        icone: Wallet,
        rota: "/financeiro",
      },
    ],
    [],
  );

  const paginasFiltradas = useMemo(() => {
    if (!termo.trim()) return paginas;
    const t = termo.toLowerCase();
    return paginas.filter(
      (p) => p.titulo.toLowerCase().includes(t) || p.categoria.toLowerCase().includes(t),
    );
  }, [paginas, termo]);

  const acoesFiltradas = useMemo(() => {
    if (!termo.trim()) return acoesRapidas;
    const t = termo.toLowerCase();
    return acoesRapidas.filter((a) => a.titulo.toLowerCase().includes(t));
  }, [acoesRapidas, termo]);

  const leadsFiltrados = useMemo(() => {
    if (!termo.trim()) {
      return leads.slice(0, 4);
    }
    const t = termo.toLowerCase();
    return leads
      .filter(
        (l) =>
          l.nome.toLowerCase().includes(t) ||
          (l.categoria || "").toLowerCase().includes(t) ||
          (l.bairro || "").toLowerCase().includes(t) ||
          (l.cidade || "").toLowerCase().includes(t),
      )
      .slice(0, 6);
  }, [leads, termo]);

  const totalResultados = paginasFiltradas.length + acoesFiltradas.length + leadsFiltrados.length;

  const executarItem = (item: ActionItem) => {
    onOpenChange(false);
    if (item.rota) {
      void navigate({ to: item.rota as any });
    }
  };

  const abrirEmpresa = (leadId: string) => {
    onOpenChange(false);
    void navigate({ to: "/companies/$id", params: { id: leadId } });
  };

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 bg-card/98 backdrop-blur-2xl border-border/80 overflow-hidden shadow-2xl rounded-2xl">
        <DialogHeader className="p-4 pb-3 border-b border-border/60">
          <DialogTitle className="sr-only">Command Palette Meridian</DialogTitle>
          <DialogDescription className="sr-only">
            Navegue por páginas, execute ações e pesquise empresas
          </DialogDescription>

          <div className="relative flex items-center">
            <Search className="absolute left-3.5 size-4 text-primary pointer-events-none" />
            <Input
              autoFocus
              placeholder="Digite um comando, módulo ou nome de empresa..."
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              className="pl-10 pr-12 h-11 text-sm bg-surface/60 border-border/70 focus-visible:ring-primary/40 rounded-xl"
            />
            <kbd className="absolute right-3 text-[10px] font-mono bg-secondary/80 px-1.5 py-0.5 rounded border border-border text-muted-foreground pointer-events-none">
              ESC
            </kbd>
          </div>
        </DialogHeader>

        <div className="max-h-[420px] overflow-y-auto p-2.5 space-y-4">
          {/* GRUPO: AÇÕES RÁPIDAS */}
          {acoesFiltradas.length > 0 && (
            <div className="space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rotulo text-muted-foreground/70">
                Ações Rápidas
              </div>
              <div className="space-y-0.5">
                {acoesFiltradas.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => executarItem(a)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-secondary/70 transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-7 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
                        <a.icone className="size-3.5" />
                      </div>
                      <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate">
                        {a.titulo}
                      </span>
                    </div>
                    <ArrowRight className="size-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* GRUPO: EMPRESAS & LEADS */}
          {leadsFiltrados.length > 0 && (
            <div className="space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rotulo text-muted-foreground/70 flex items-center justify-between">
                <span>Empresas & Contas</span>
                {carregandoLeads && <span className="text-[9px] lowercase">carregando...</span>}
              </div>
              <div className="space-y-0.5">
                {leadsFiltrados.map((lead) => (
                  <button
                    key={lead.id}
                    type="button"
                    onClick={() => abrirEmpresa(lead.id)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-secondary/70 transition-colors text-left group cursor-pointer"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {lead.nome}
                        </span>
                        {!lead.tem_site && (
                          <span className="text-[9px] font-mono uppercase bg-primary/15 text-primary px-1.5 py-0.2 rounded font-semibold shrink-0">
                            Sem Site
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {lead.categoria} · 📍 {lead.bairro || lead.cidade || "Brasil"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <BadgePriority score={lead.score} />
                      <ExternalLink className="size-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* GRUPO: PÁGINAS DO SISTEMA */}
          {paginasFiltradas.length > 0 && (
            <div className="space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rotulo text-muted-foreground/70">
                Páginas & Módulos
              </div>
              <div className="space-y-0.5">
                {paginasFiltradas.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => executarItem(p)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-secondary/70 transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-7 rounded-lg bg-surface flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                        <p.icone className="size-3.5" />
                      </div>
                      <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate">
                        {p.titulo}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/70 px-2 py-0.5 rounded bg-surface border border-border/50 hidden sm:inline">
                      {p.categoria}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {totalResultados === 0 && (
            <div className="py-10 text-center space-y-1">
              <Search className="size-6 text-muted-foreground/40 mx-auto" />
              <p className="text-xs font-semibold text-foreground">Nenhum resultado encontrado</p>
              <p className="text-[11px] text-muted-foreground">
                Tente buscar com outro termo de pesquisa ou rota.
              </p>
            </div>
          )}
        </div>

        {/* RODAPÉ DO PALETTE */}
        <div className="p-2.5 px-4 bg-surface/80 border-t border-border/70 flex items-center justify-between text-[11px] text-muted-foreground rotulo">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-secondary px-1 py-0.2 rounded text-[10px]">↑↓</kbd>{" "}
              navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-secondary px-1 py-0.2 rounded text-[10px]">ENTER</kbd>{" "}
              selecionar
            </span>
          </div>
          <span>{totalResultados} itens mapeados</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
