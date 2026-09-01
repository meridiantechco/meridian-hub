import { Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Download,
  MessageSquare,
  Globe,
  AlertCircle,
  Instagram,
  ArrowUpDown,
  Plus,
  Table as TableIcon,
  LayoutGrid,
  Building2,
  Phone,
  Trash2,
  SlidersHorizontal,
  CheckSquare,
  Eye,
  MoreHorizontal,
  Flame,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLeads } from "../hooks/useLeads";
import { BadgePriority } from "./BadgePriority";
import { BadgeStatus } from "./BadgeStatus";
import { WhatsAppModal } from "./WhatsAppModal";
import { LeadDrawer } from "./LeadDrawer";
import { LeadsTableSkeleton } from "./LeadsTableSkeleton";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { gerarUrlBuscaInstagram } from "../utils/socialMedia";
import type { LeadItem } from "../types";

export function LeadsView() {
  const {
    leads,
    leadsFiltrados,
    carregando,
    busca,
    setBusca,
    filtroCategoria,
    setFiltroCategoria,
    filtroStatus,
    setFiltroStatus,
    filtroFaixaScore,
    setFiltroFaixaScore,
    filtroInstagram,
    setFiltroInstagram,
    apenasSemSite,
    setApenasSemSite,
    ordenacao,
    setOrdenacao,
    categoriasDisponiveis,
    mudarStatus,
    zerarBase,
    removerLead,
    recarregar,
  } = useLeads();

  const [modoVisualizacao, setModoVisualizacao] = useState<"tabela" | "grade">("tabela");
  const [modalZerarAberto, setModalZerarAberto] = useState(false);
  const [leadParaWhatsApp, setLeadParaWhatsApp] = useState<LeadItem | null>(null);
  const [modalWhatsAppAberto, setModalWhatsAppAberto] = useState(false);
  const [leadParaExcluir, setLeadParaExcluir] = useState<LeadItem | null>(null);
  const [excluindoLead, setExcluindoLead] = useState(false);

  // Drawer de visualização rápida
  const [leadDrawer, setLeadDrawer] = useState<LeadItem | null>(null);
  const [drawerAberto, setDrawerAberto] = useState(false);

  // Seleção em massa
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  // Visibilidade de colunas
  const [colunasVisiveis, setColunasVisiveis] = useState({
    categoria: true,
    localizacao: true,
    contato: true,
    presenca: true,
    avaliacao: true,
    score: true,
    status: true,
  });

  const totalSemSite = leads.filter((l) => !l.tem_site).length;
  const totalComInstagram = leads.filter((l) => Boolean(l.instagram)).length;
  const totalAltaPrioridade = leads.filter((l) => l.score >= 70).length;

  const alternarSelecao = (id: string) => {
    setSelecionados((prev) => {
      const novo = new Set(prev);
      if (novo.has(id)) {
        novo.delete(id);
      } else {
        novo.add(id);
      }
      return novo;
    });
  };

  const alternarTodos = () => {
    if (selecionados.size === leadsFiltrados.length && leadsFiltrados.length > 0) {
      setSelecionados(new Set());
    } else {
      setSelecionados(new Set(leadsFiltrados.map((l) => l.id)));
    }
  };

  const exportarCSV = (apenasMarcados = false) => {
    const listaParaExportar = apenasMarcados
      ? leadsFiltrados.filter((l) => selecionados.has(l.id))
      : leadsFiltrados;

    if (listaParaExportar.length === 0) {
      toast.error("Nenhum estabelecimento selecionado para exportação.");
      return;
    }

    const cabecalho =
      "Nome,Categoria,Bairro,Cidade,Estado,Telefone,Instagram,Avaliação Google,Total Avaliações,Tem Site,Score,Status\n";
    const linhas = listaParaExportar
      .map(
        (l) =>
          `"${l.nome}","${l.categoria}","${l.bairro || ""}","${l.cidade || ""}","${l.estado || "SP"}","${l.telefone || ""}","${l.instagram || ""}",${l.avaliacao_google || ""},${l.total_avaliacoes},${l.tem_site ? "Sim" : "Não"},${l.score},"${l.status}"`,
      )
      .join("\n");

    const blob = new Blob([cabecalho + linhas], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `estabelecimentos_meridian_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${listaParaExportar.length} estabelecimentos exportados com sucesso!`);
  };

  const mudarStatusEmMassa = async (novoStatus: LeadItem["status"]) => {
    const ids = Array.from(selecionados);
    if (ids.length === 0) return;

    for (const id of ids) {
      await mudarStatus(id, novoStatus);
    }
    toast.success(`Status de ${ids.length} leads alterado para "${novoStatus}"!`);
    setSelecionados(new Set());
  };

  const abrirDrawerLead = (lead: LeadItem) => {
    setLeadDrawer(lead);
    setDrawerAberto(true);
  };

  const limparFiltros = () => {
    setBusca("");
    setFiltroCategoria("todas");
    setFiltroStatus("todos");
    setFiltroFaixaScore("todas");
    setFiltroInstagram("todos");
    setApenasSemSite(false);
    setOrdenacao("score");
  };

  const temFiltroAtivo = Boolean(
    busca ||
    filtroCategoria !== "todas" ||
    filtroStatus !== "todos" ||
    filtroInstagram !== "todos" ||
    apenasSemSite,
  );

  return (
    <AppShell
      titulo="Base de Estabelecimentos"
      descricao="Listagem consolidada de inteligência comercial, segmentação e ações de abordagem"
      acoes={
        <div className="flex items-center gap-2">
          {/* Menu de Opções Secundárias */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8.5 px-2.5 gap-1.5 text-xs border-border/80 text-foreground hover:border-primary/40"
              >
                <MoreHorizontal className="size-3.5" />
                <span className="hidden sm:inline">Opções</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-card border-border shadow-elev">
              <DropdownMenuItem
                onClick={() => exportarCSV(false)}
                className="text-xs cursor-pointer gap-2"
              >
                <Download className="size-3.5 text-primary" />
                Exportar Base (CSV)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setModalZerarAberto(true)}
                className="text-xs cursor-pointer gap-2 text-rose-400 focus:text-rose-300 focus:bg-rose-500/10"
              >
                <Trash2 className="size-3.5" />
                Zerar Base de Dados
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* CTA Principal */}
          <Button
            size="sm"
            asChild
            className="h-8.5 px-3.5 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
          >
            <Link to="/nova-busca">
              <Plus className="size-3.5" />
              <span>Detectar Empresas</span>
            </Link>
          </Button>
        </div>
      }
    >
      {carregando && leads.length === 0 ? (
        <LeadsTableSkeleton />
      ) : (
        <div className="space-y-4 animate-fade-in">
          {/* RESUMO RÁPIDO EM 4 CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-card border border-border/70 shadow-xs flex items-center justify-between">
              <div>
                <p className="rotulo text-[10px]">Total Mapeados</p>
                <p className="text-xl sm:text-2xl font-bold font-display dado mt-0.5 text-foreground">
                  {leads.length}
                </p>
              </div>
              <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Building2 className="size-4" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-card border border-border/70 shadow-xs flex items-center justify-between ring-1 ring-primary/20">
              <div>
                <p className="rotulo text-[10px] text-primary">Sem Site Próprio</p>
                <p className="text-xl sm:text-2xl font-bold font-display text-primary dado mt-0.5">
                  {totalSemSite}
                </p>
              </div>
              <div className="size-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                <Zap className="size-4 fill-current" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-card border border-border/70 shadow-xs flex items-center justify-between">
              <div>
                <p className="rotulo text-[10px] text-amber-400">Score &ge; 70 pts</p>
                <p className="text-xl sm:text-2xl font-bold font-display text-amber-400 dado mt-0.5">
                  {totalAltaPrioridade}
                </p>
              </div>
              <div className="size-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Flame className="size-4 fill-current" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-card border border-border/70 shadow-xs flex items-center justify-between">
              <div>
                <p className="rotulo text-[10px] text-pink-400">Com Instagram</p>
                <p className="text-xl sm:text-2xl font-bold font-display text-pink-400 dado mt-0.5">
                  {totalComInstagram}
                </p>
              </div>
              <div className="size-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
                <Instagram className="size-4" />
              </div>
            </div>
          </div>

          {/* CARD PRINCIPAL (TOOLBAR INTEGRADA + TABELA/GRADE) */}
          <Card className="bg-card border-border/80 shadow-elev overflow-hidden">
            {/* TOOLBAR UNIFICADA INTEGRADA */}
            <div className="p-3.5 border-b border-border/60 bg-surface/30 space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Esquerda: Busca, Categoria, Status, Sem site */}
                <div className="flex flex-1 items-center gap-2 flex-wrap">
                  <div className="relative min-w-[200px] flex-1 max-w-xs">
                    <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, bairro, @insta..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="pl-8 text-xs h-8.5 bg-surface/50 border-border/70"
                    />
                  </div>

                  <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                    <SelectTrigger className="text-xs h-8.5 w-36 sm:w-40 bg-surface/50 border-border/70">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas categorias</SelectItem>
                      {categoriasDisponiveis.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                    <SelectTrigger className="text-xs h-8.5 w-32 sm:w-36 bg-surface/50 border-border/70">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos status</SelectItem>
                      <SelectItem value="novo">Novo</SelectItem>
                      <SelectItem value="contatado">Contatado</SelectItem>
                      <SelectItem value="proposta">Proposta</SelectItem>
                      <SelectItem value="fechado">Fechado</SelectItem>
                      <SelectItem value="recusado">Recusado</SelectItem>
                    </SelectContent>
                  </Select>

                  <button
                    type="button"
                    onClick={() => setApenasSemSite(!apenasSemSite)}
                    className={cn(
                      "h-8.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 shrink-0",
                      apenasSemSite
                        ? "bg-primary/15 text-primary border-primary/40 shadow-xs"
                        : "bg-surface/50 text-muted-foreground border-border/70 hover:text-foreground",
                    )}
                  >
                    <Zap className={cn("size-3", apenasSemSite && "fill-current")} />
                    <span>Sem Site</span>
                  </button>
                </div>

                {/* Direita: Ordenação, Colunas e Alternador Tabela/Grade */}
                <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                  {/* Ordenação */}
                  <Select value={ordenacao} onValueChange={(val) => setOrdenacao(val as any)}>
                    <SelectTrigger className="text-xs h-8.5 w-36 bg-surface/50 border-border/70">
                      <ArrowUpDown className="size-3 mr-1 text-muted-foreground" />
                      <SelectValue placeholder="Ordenar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="score">Maior Score</SelectItem>
                      <SelectItem value="avaliacao">Avaliação Google</SelectItem>
                      <SelectItem value="data">Mais Recentes</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Seletor de Colunas */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8.5 px-2.5 gap-1.5 text-xs border-border/80 text-foreground"
                        title="Configurar Colunas"
                      >
                        <SlidersHorizontal className="size-3.5" />
                        <span className="hidden xl:inline">Colunas</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                      <DropdownMenuLabel className="text-xs">Exibir Colunas</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        checked={colunasVisiveis.categoria}
                        onCheckedChange={(val) =>
                          setColunasVisiveis((prev) => ({ ...prev, categoria: val }))
                        }
                      >
                        Categoria
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={colunasVisiveis.localizacao}
                        onCheckedChange={(val) =>
                          setColunasVisiveis((prev) => ({ ...prev, localizacao: val }))
                        }
                      >
                        Localização
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={colunasVisiveis.contato}
                        onCheckedChange={(val) =>
                          setColunasVisiveis((prev) => ({ ...prev, contato: val }))
                        }
                      >
                        Contato & Redes
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={colunasVisiveis.presenca}
                        onCheckedChange={(val) =>
                          setColunasVisiveis((prev) => ({ ...prev, presenca: val }))
                        }
                      >
                        Presença Web
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={colunasVisiveis.avaliacao}
                        onCheckedChange={(val) =>
                          setColunasVisiveis((prev) => ({ ...prev, avaliacao: val }))
                        }
                      >
                        Avaliação Google
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={colunasVisiveis.score}
                        onCheckedChange={(val) =>
                          setColunasVisiveis((prev) => ({ ...prev, score: val }))
                        }
                      >
                        Score
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={colunasVisiveis.status}
                        onCheckedChange={(val) =>
                          setColunasVisiveis((prev) => ({ ...prev, status: val }))
                        }
                      >
                        Status
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Switcher Tabela / Grade */}
                  <div className="flex items-center gap-0.5 bg-surface/60 p-0.5 rounded-lg border border-border/80">
                    <button
                      type="button"
                      onClick={() => setModoVisualizacao("tabela")}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                        modoVisualizacao === "tabela"
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                      title="Exibir em Tabela"
                    >
                      <TableIcon className="size-3.5" />
                      <span className="hidden sm:inline">Tabela</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setModoVisualizacao("grade")}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                        modoVisualizacao === "grade"
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                      title="Exibir em Grade"
                    >
                      <LayoutGrid className="size-3.5" />
                      <span className="hidden sm:inline">Grade</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Chips de Filtros Ativos */}
              {temFiltroAtivo && (
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-muted-foreground text-[11px]">Filtros ativos ({leadsFiltrados.length} encontrados):</span>
                    {busca && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-foreground text-[11px] border border-border/70">
                        Busca: "{busca}"
                        <button type="button" onClick={() => setBusca("")} className="hover:text-destructive cursor-pointer font-bold">×</button>
                      </span>
                    )}
                    {filtroCategoria !== "todas" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-foreground text-[11px] border border-border/70">
                        {filtroCategoria}
                        <button type="button" onClick={() => setFiltroCategoria("todas")} className="hover:text-destructive cursor-pointer font-bold">×</button>
                      </span>
                    )}
                    {filtroStatus !== "todos" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-foreground text-[11px] border border-border/70">
                        Status: {filtroStatus}
                        <button type="button" onClick={() => setFiltroStatus("todos")} className="hover:text-destructive cursor-pointer font-bold">×</button>
                      </span>
                    )}
                    {apenasSemSite && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/15 text-primary text-[11px] border border-primary/30 font-semibold">
                        Apenas sem site
                        <button type="button" onClick={() => setApenasSemSite(false)} className="hover:text-destructive cursor-pointer font-bold">×</button>
                      </span>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={limparFiltros}
                    className="h-6 text-xs px-2 text-primary hover:underline cursor-pointer"
                  >
                    Limpar todos
                  </Button>
                </div>
              )}
            </div>

            {/* BARRA DE AÇÕES EM MASSA QUANDO SELECIONADOS > 0 */}
            {selecionados.size > 0 && (
              <div className="p-3 bg-primary/15 border-b border-primary/30 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckSquare className="size-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    <strong className="dado">{selecionados.size}</strong> de {leadsFiltrados.length} estabelecimentos selecionados
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => exportarCSV(true)}
                    className="h-7.5 text-xs gap-1.5 border-primary/30 hover:bg-primary/10"
                  >
                    <Download className="size-3.5" />
                    Exportar Marcados ({selecionados.size})
                  </Button>

                  <Select onValueChange={(val) => mudarStatusEmMassa(val as LeadItem["status"])}>
                    <SelectTrigger className="h-7.5 text-xs w-44 bg-card border-border">
                      <SelectValue placeholder="Mover Status em Massa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="novo">Mover para: Novo</SelectItem>
                      <SelectItem value="contatado">Mover para: Contatado</SelectItem>
                      <SelectItem value="proposta">Mover para: Proposta</SelectItem>
                      <SelectItem value="fechado">Mover para: Fechado</SelectItem>
                      <SelectItem value="recusado">Mover para: Recusado</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelecionados(new Set())}
                    className="h-7.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Desmarcar
                  </Button>
                </div>
              </div>
            )}

            {/* MODO TABELA (ALTA DENSIDADE) */}
            {modoVisualizacao === "tabela" ? (
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-surface/70 text-muted-foreground uppercase text-[10px] rotulo tracking-wider whitespace-nowrap">
                        <th className="p-3 pl-4 w-9">
                          <Checkbox
                            checked={
                              selecionados.size === leadsFiltrados.length &&
                              leadsFiltrados.length > 0
                            }
                            onCheckedChange={alternarTodos}
                            aria-label="Selecionar todos os estabelecimentos da lista"
                          />
                        </th>
                        <th className="p-3">Empresa</th>
                        {colunasVisiveis.categoria && <th className="p-3">Categoria</th>}
                        {colunasVisiveis.localizacao && <th className="p-3">Localização</th>}
                        {colunasVisiveis.contato && <th className="p-3">Contato & Redes</th>}
                        {colunasVisiveis.presenca && <th className="p-3">Presença Web</th>}
                        {colunasVisiveis.avaliacao && <th className="p-3">Avaliação</th>}
                        {colunasVisiveis.score && <th className="p-3">Score</th>}
                        {colunasVisiveis.status && <th className="p-3">Status</th>}
                        <th className="p-3 pr-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {leadsFiltrados.map((lead) => {
                        const estaMarcado = selecionados.has(lead.id);

                        return (
                          <tr
                            key={lead.id}
                            className={cn(
                              "hover:bg-secondary/30 transition-colors group",
                              estaMarcado && "bg-primary/5",
                            )}
                          >
                            <td className="p-3 pl-4">
                              <Checkbox
                                checked={estaMarcado}
                                onCheckedChange={() => alternarSelecao(lead.id)}
                                aria-label={`Selecionar ${lead.nome}`}
                              />
                            </td>

                            <td className="p-3">
                              <button
                                type="button"
                                onClick={() => abrirDrawerLead(lead)}
                                className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1 block text-left cursor-pointer"
                              >
                                {lead.nome}
                              </button>
                              {lead.endereco && (
                                <p className="text-[10.5px] text-muted-foreground line-clamp-1">
                                  {lead.endereco}
                                </p>
                              )}
                            </td>

                            {colunasVisiveis.categoria && (
                              <td className="p-3 text-muted-foreground">{lead.categoria}</td>
                            )}

                            {colunasVisiveis.localizacao && (
                              <td className="p-3 text-muted-foreground dado">
                                {lead.bairro || lead.cidade || "—"}
                              </td>
                            )}

                            {colunasVisiveis.contato && (
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  {lead.telefone ? (
                                    <a
                                      href={`tel:${lead.telefone}`}
                                      className="text-muted-foreground hover:text-foreground font-mono text-[11px] flex items-center gap-1"
                                    >
                                      <Phone className="size-3 text-primary" />
                                      {lead.telefone}
                                    </a>
                                  ) : (
                                    <span className="text-muted-foreground/60 text-[11px]">—</span>
                                  )}

                                  {lead.instagram ? (
                                    <a
                                      href={`https://instagram.com/${lead.instagram}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-pink-400 hover:text-pink-300 font-mono text-[11px] flex items-center gap-0.5"
                                    >
                                      <Instagram className="size-3" />
                                      <span className="hidden sm:inline">@{lead.instagram}</span>
                                    </a>
                                  ) : (
                                    <a
                                      href={gerarUrlBuscaInstagram(lead.nome, lead.cidade)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-muted-foreground/40 hover:text-pink-400 text-[10px] flex items-center gap-0.5 transition-colors"
                                      title="Buscar no Instagram"
                                    >
                                      <Search className="size-2.5" />
                                    </a>
                                  )}
                                </div>
                              </td>
                            )}

                            {colunasVisiveis.presenca && (
                              <td className="p-3">
                                {!lead.tem_site ? (
                                  <span className="inline-flex items-center gap-1 rounded bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/25">
                                    <AlertCircle className="size-2.5" /> Sem site
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                                    <Globe className="size-2.5" /> Com site
                                  </span>
                                )}
                              </td>
                            )}

                            {colunasVisiveis.avaliacao && (
                              <td className="p-3 dado">
                                {lead.avaliacao_google ? (
                                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                                    ★ {lead.avaliacao_google.toFixed(1)}
                                    <span className="text-[10px] text-muted-foreground font-normal">
                                      ({lead.total_avaliacoes})
                                    </span>
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground/60">—</span>
                                )}
                              </td>
                            )}

                            {colunasVisiveis.score && (
                              <td className="p-3">
                                <BadgePriority score={lead.score} />
                              </td>
                            )}

                            {colunasVisiveis.status && (
                              <td className="p-3">
                                <Select
                                  value={lead.status}
                                  onValueChange={(val) =>
                                    mudarStatus(lead.id, val as LeadItem["status"])
                                  }
                                >
                                  <SelectTrigger className="h-7 text-[11px] w-28 bg-surface/50 border-border">
                                    <SelectValue>
                                      <BadgeStatus status={lead.status} />
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="novo">Novo</SelectItem>
                                    <SelectItem value="contatado">Contatado</SelectItem>
                                    <SelectItem value="proposta">Proposta</SelectItem>
                                    <SelectItem value="fechado">Fechado</SelectItem>
                                    <SelectItem value="recusado">Recusado</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                            )}

                            <td className="p-3 pr-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setLeadParaWhatsApp(lead);
                                    setModalWhatsAppAberto(true);
                                  }}
                                  className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] gap-1 font-semibold shadow-xs"
                                >
                                  <MessageSquare className="size-3" />
                                  Abordar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => abrirDrawerLead(lead)}
                                  className="size-7 border-border/80 hover:border-primary/40 hover:text-primary"
                                  title="Ver preview rápido"
                                >
                                  <Eye className="size-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setLeadParaExcluir(lead)}
                                  className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  title="Excluir estabelecimento"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {leadsFiltrados.length === 0 && (
                        <tr>
                          <td colSpan={10} className="py-12 text-center space-y-2">
                            <Building2 className="size-8 text-muted-foreground/40 mx-auto" />
                            <p className="text-sm font-semibold text-foreground">
                              Nenhum estabelecimento encontrado
                            </p>
                            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                              Não encontramos empresas correspondentes aos filtros aplicados.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={limparFiltros}
                              className="mt-2 text-xs"
                            >
                              Limpar Todos os Filtros
                            </Button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            ) : (
              /* MODO GRADE */
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {leadsFiltrados.map((lead) => (
                  <Card
                    key={lead.id}
                    className="bg-card border-border/80 shadow-elev hover:border-primary/40 transition-all flex flex-col justify-between"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider rotulo truncate">
                          {lead.categoria}
                        </span>
                        <BadgePriority score={lead.score} />
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={() => abrirDrawerLead(lead)}
                          className="font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-1 text-left block cursor-pointer"
                        >
                          {lead.nome}
                        </button>
                        <p className="text-xs text-muted-foreground truncate dado mt-0.5">
                          📍 {lead.bairro || lead.cidade || "Local não informado"}
                        </p>
                      </div>

                      <div className="space-y-1 py-1 border-y border-border/60 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-[11px]">Presença:</span>
                          {!lead.tem_site ? (
                            <span className="text-[10px] font-semibold text-primary">
                              Sem site
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">Com site</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-[11px]">Instagram:</span>
                          {lead.instagram ? (
                            <span className="text-[10px] text-pink-400 font-mono truncate max-w-[120px]">
                              @{lead.instagram}
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">—</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <BadgeStatus status={lead.status} />
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            onClick={() => {
                              setLeadParaWhatsApp(lead);
                              setModalWhatsAppAberto(true);
                            }}
                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-1 font-semibold"
                          >
                            <MessageSquare className="size-3" />
                            Abordar
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => abrirDrawerLead(lead)}
                            className="size-7"
                            title="Preview"
                          >
                            <Eye className="size-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setLeadParaExcluir(lead)}
                            className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title="Excluir estabelecimento"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {leadsFiltrados.length === 0 && (
                  <div className="col-span-full py-12 text-center space-y-2">
                    <Building2 className="size-8 text-muted-foreground/40 mx-auto" />
                    <p className="text-sm font-semibold text-foreground">
                      Nenhum estabelecimento encontrado
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tente ajustar os termos de busca ou filtros aplicados.
                    </p>
                    <Button variant="outline" size="sm" onClick={limparFiltros} className="mt-2 text-xs">
                      Limpar Filtros
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* MODAL CONFIRMAÇÃO DE EXCLUSÃO INDIVIDUAL */}
      <ConfirmDeleteDialog
        open={Boolean(leadParaExcluir)}
        onOpenChange={(open) => !open && setLeadParaExcluir(null)}
        titulo="Excluir Estabelecimento da Base?"
        descricao="Esta ação removerá este lead permanentemente da sua operação e dos relatórios analíticos."
        itemNome={leadParaExcluir ? `${leadParaExcluir.nome} (${leadParaExcluir.categoria || "Geral"})` : undefined}
        carregando={excluindoLead}
        onConfirmar={async () => {
          if (!leadParaExcluir) return;
          setExcluindoLead(true);
          try {
            await removerLead(leadParaExcluir.id);
            setLeadParaExcluir(null);
            await recarregar();
          } finally {
            setExcluindoLead(false);
          }
        }}
      />

      {/* MODAL ZERAR BASE COMPLETA */}
      <AlertDialog open={modalZerarAberto} onOpenChange={setModalZerarAberto}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Zerar Base de Dados Comercial?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta ação removerá <strong className="text-foreground">{leads.length} estabelecimentos</strong> da
              sua base de dados local. Você precisará realizar novas buscas para repovoar os dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await zerarBase();
                toast.success("Base de dados limpa com sucesso!");
                setModalZerarAberto(false);
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
            >
              Sim, Zerar Base
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* WHATSAPP MODAL INTEGRADO */}
      <WhatsAppModal
        lead={leadParaWhatsApp}
        aberto={modalWhatsAppAberto}
        onOpenChange={setModalWhatsAppAberto}
        onMensagemEnviada={recarregar}
      />

      {/* LEAD DRAWER */}
      <LeadDrawer
        lead={leadDrawer}
        aberto={drawerAberto}
        onOpenChange={setDrawerAberto}
        onStatusChange={async (leadId, status) => {
          await mudarStatus(leadId, status);
          await recarregar();
        }}
        onAbordarWhatsApp={(l) => {
          setLeadParaWhatsApp(l);
          setModalWhatsAppAberto(true);
        }}
        onLeadAtualizado={recarregar}
      />
    </AppShell>
  );
}
