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
      { id: "nav-painel", titulo: "Dashboard Comercial", categoria: "Overview", icone: LayoutDashboard, rota: "/painel" },
      { id: "nav-opportunities", titulo: "Opportunity Center (Priorização)", categoria: "Overview", icone: Target, rota: "/opportunities" },
      { id: "nav-companies", titulo: "CRM de Empresas & Contas", categoria: "CRM", icone: Building2, rota: "/companies" },
      { id: "nav-contacts", titulo: "Diretório de Contatos & Decisores", categoria: "CRM", icone: Contact, rota: "/contacts" },
      { id: "nav-leads", titulo: "Base de Estabelecimentos (Leads)", categoria: "CRM", icone: Users2, rota: "/leads" },
      { id: "nav-funil", titulo: "Funil Comercial (Kanban)", categoria: "CRM", icone: Kanban, rota: "/funil" },
      { id: "nav-today", titulo: "Central do Dia (Hoje)", categoria: "Operação", icone: Sun, rota: "/today" },
      { id: "nav-tasks", titulo: "Tarefas Operacionais & Prazos", categoria: "Operação", icone: CheckSquare, rota: "/tasks" },
      { id: "nav-calendar", titulo: "Agenda & Reuniões", categoria: "Operação", icone: Calendar, rota: "/calendar" },
      { id: "nav-activities", titulo: "Histórico de Atividades & Timeline", categoria: "Operação", icone: History, rota: "/activities" },
      { id: "nav-nova-busca", titulo: "Prospecção & Mineração (Scanner)", categoria: "Inteligência", icone: Radar, rota: "/nova-busca" },
      { id: "nav-map", titulo: "Mapa Interativo de Oportunidades", categoria: "Inteligência", icone: MapPin, rota: "/map" },
      { id: "nav-radar", titulo: "Radar de Demanda & Mercado", categoria: "Inteligência", icone: Radio, rota: "/radar" },
      { id: "nav-insights", titulo: "Insights Estratégicos & Benchmarks", categoria: "Inteligência", icone: Lightbulb, rota: "/insights" },
      { id: "nav-analytics", titulo: "Analytics de Vendas & Conversão", categoria: "Analytics", icone: BarChart3, rota: "/analytics" },
      { id: "nav-analytics-team", titulo: "Performance da Equipe", categoria: "Analytics", icone: Users2, rota: "/analytics/team" },
      { id: "nav-analytics-geo", titulo: "Performance Geográfica", categoria: "Analytics", icone: Compass, rota: "/analytics/geo" },
      { id: "nav-reports", titulo: "Gerador de Relatórios & Exportação", categoria: "Analytics", icone: FileSpreadsheet, rota: "/reports" },
      { id: "nav-financial", titulo: "Financeiro & Lucro Real", categoria: "Financeiro", icone: Wallet, rota: "/financeiro" },
      { id: "nav-automations", titulo: "Automações & Workflows", categoria: "Automação", icone: Zap, rota: "/automations" },
      { id: "nav-templates", titulo: "Templates & Scripts de Mensagem", categoria: "Comunicação", icone: MessageSquare, rota: "/templates" },
      { id: "nav-assistant", titulo: "AI Sales Assistant", categoria: "IA", icone: Sparkles, rota: "/assistant" },
      { id: "nav-usuarios", titulo: "Gestão de Usuários & Equipe", categoria: "Admin", icone: Shield, rota: "/usuarios" },
      { id: "nav-notifications", titulo: "Central de Notificações", categoria: "Admin", icone: Bell, rota: "/notifications" },
    ],
    [],
  );

  const acoesRapidas: ActionItem[] = useMemo(
    () => [
      { id: "act-prospeccao", titulo: "Iniciar Nova Varredura de Prospecção", categoria: "Ações", icone: Sparkles, rota: "/nova-busca" },
      { id: "act-criar-tarefa", titulo: "Criar Nova Tarefa Operacional", categoria: "Ações", icone: Plus, rota: "/tasks" },
      { id: "act-agendar-reuniao", titulo: "Agendar Nova Reunião / Demonstração", categoria: "Ações", icone: Calendar, rota: "/calendar" },
      { id: "act-abrir-mapa", titulo: "Visualizar Mapa de Oportunidades", categoria: "Ações", icone: MapPin, rota: "/map" },
      { id: "act-perguntar-ia", titulo: "Fazer Pergunta ao Assistente IA", categoria: "Ações", icone: Sparkles, rota: "/assistant" },
      { id: "act-relatorio", titulo: "Exportar Relatório Customizado", categoria: "Ações", icone: FileSpreadsheet, rota: "/reports" },
    ],
    [],
  );

  const paginasFiltradas = useMemo(() => {
    if (!termo.trim()) return paginas;
    const t = termo.toLowerCase();
    return paginas.filter((p) => p.titulo.toLowerCase().includes(t) || p.categoria.toLowerCase().includes(t));
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
              <kbd className="font-mono bg-secondary px-1 py-0.2 rounded text-[10px]">↑↓</kbd> navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-secondary px-1 py-0.2 rounded text-[10px]">ENTER</kbd> selecionar
            </span>
          </div>
          <span>{totalResultados} itens mapeados</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
