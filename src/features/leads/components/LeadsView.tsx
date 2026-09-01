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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
  ExternalLink,
  Star,
  Globe,
  AlertCircle,
  Instagram,
  ArrowUpDown,
  RefreshCw,
  Plus,
  Table as TableIcon,
  LayoutGrid,
  MapPin,
  Flame,
  Zap,
  Building2,
  Phone,
  Trash2,
  AlertTriangle,
  SlidersHorizontal,
  CheckSquare,
  Eye,
  Sliders,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLeads } from "../hooks/useLeads";
import { BadgePriority } from "./BadgePriority";
import { BadgeStatus } from "./BadgeStatus";
import { WhatsAppModal } from "./WhatsAppModal";
import { LeadDrawer } from "./LeadDrawer";
import { LeadsTableSkeleton } from "./LeadsTableSkeleton";
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
    recarregar,
  } = useLeads();

  const [modoVisualizacao, setModoVisualizacao] = useState<"tabela" | "grade">("tabela");
  const [modalZerarAberto, setModalZerarAberto] = useState(false);
  const [leadParaWhatsApp, setLeadParaWhatsApp] = useState<LeadItem | null>(null);
  const [modalWhatsAppAberto, setModalWhatsAppAberto] = useState(false);

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

  return (
    <AppShell
      titulo="Base de Estabelecimentos"
      descricao="Listagem consolidada de inteligência comercial, segmentação avançada e ações de contato"
      acoes={
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
          {/* Switcher de Visualização */}
          <div className="flex items-center gap-1 bg-secondary/80 p-0.5 rounded-lg border border-border/80">
            <button
              type="button"
              onClick={() => setModoVisualizacao("tabela")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                modoVisualizacao === "tabela"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
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
            >
              <LayoutGrid className="size-3.5" />
              <span className="hidden sm:inline">Grade</span>
            </button>
          </div>

          {/* Seletor de Colunas */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 gap-1.5 text-xs border-border/80 text-foreground"
              >
                <SlidersHorizontal className="size-3.5" />
                <span className="hidden md:inline">Colunas</span>
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

          {/* Exportar CSV Geral */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportarCSV(false)}
            className="h-8 px-2.5 gap-1.5 text-xs border-border/80 text-foreground"
          >
            <Download className="size-3.5" />
            <span className="hidden md:inline">Exportar </span>CSV
          </Button>

          {/* Zerar Base */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setModalZerarAberto(true)}
            className="h-8 px-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-1.5"
            title="Limpar estabelecimentos da base de dados"
          >
            <Trash2 className="size-3.5" />
            <span className="hidden sm:inline">Zerar Base</span>
          </Button>

          {/* Detectar Novos */}
          <Button
            size="sm"
            asChild
            className="h-8 px-3 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
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
        <div className="space-y-4">
          {/* RESUMO RÁPIDO EM CARDS SUPERIORES */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-3 rounded-xl bg-card border border-border/70 shadow-xs flex items-center justify-between">
              <div>
                <p className="rotulo text-[9.5px]">Total Base</p>
                <p className="text-xl sm:text-2xl font-bold font-display dado mt-0.5 text-foreground">
                  {leads.length}
                </p>
              </div>
              <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Building2 className="size-4" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-card border border-border/70 shadow-xs flex items-center justify-between ring-1 ring-primary/20">
              <div>
                <p className="rotulo text-[9.5px] text-primary">Sem Site Próprio</p>
                <p className="text-xl sm:text-2xl font-bold font-display text-primary dado mt-0.5">
                  {totalSemSite}
                </p>
              </div>
              <div className="size-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                <Zap className="size-4 fill-current" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-card border border-border/70 shadow-xs flex items-center justify-between">
              <div>
                <p className="rotulo text-[9.5px] text-pink-400">Com Instagram</p>
                <p className="text-xl sm:text-2xl font-bold font-display text-pink-400 dado mt-0.5">
                  {totalComInstagram}
                </p>
              </div>
              <div className="size-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
                <Instagram className="size-4" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-card border border-border/70 shadow-xs flex items-center justify-between">
              <div>
                <p className="rotulo text-[9.5px] text-amber-400">Score &ge; 70 pts</p>
                <p className="text-xl sm:text-2xl font-bold font-display text-amber-400 dado mt-0.5">
                  {totalAltaPrioridade}
                </p>
              </div>
              <div className="size-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Flame className="size-4 fill-current" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-card border border-border/70 shadow-xs flex items-center justify-between col-span-2 sm:col-span-1 lg:col-span-1">
              <div>
                <p className="rotulo text-[9.5px] text-emerald-400">Filtrados em Tela</p>
                <p className="text-xl sm:text-2xl font-bold font-display text-emerald-400 dado mt-0.5">
                  {leadsFiltrados.length}
                </p>
              </div>
              <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <RefreshCw className={`size-3.5 ${carregando ? "animate-spin" : ""}`} />
              </div>
            </div>
          </div>

          {/* BARRA DE FILTROS AVANÇADA */}
          <Card className="bg-card border-border/80 shadow-elev">
            <CardContent className="p-3.5 sm:p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, bairro, @insta..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-8 text-xs h-8.5 bg-surface/50 border-border/70"
                  />
                </div>

                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger className="text-xs h-8.5 bg-surface/50 border-border/70">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as categorias</SelectItem>
                    {categoriasDisponiveis.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="text-xs h-8.5 bg-surface/50 border-border/70">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="novo">Novo</SelectItem>
                    <SelectItem value="contatado">Contatado</SelectItem>
                    <SelectItem value="proposta">Proposta</SelectItem>
                    <SelectItem value="fechado">Fechado</SelectItem>
                    <SelectItem value="recusado">Recusado</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filtroInstagram}
                  onValueChange={(val) => setFiltroInstagram(val as "todos" | "com" | "sem")}
                >
                  <SelectTrigger className="text-xs h-8.5 bg-surface/50 border-border/70">
                    <SelectValue placeholder="Rede Social" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as redes</SelectItem>
                    <SelectItem value="com">Com Instagram ({totalComInstagram})</SelectItem>
                    <SelectItem value="sem">Sem Instagram</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-border/50">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="apenas-sem-site"
                    checked={apenasSemSite}
                    onCheckedChange={setApenasSemSite}
                  />
                  <Label
                    htmlFor="apenas-sem-site"
                    className="text-xs font-normal cursor-pointer flex items-center gap-1.5 text-foreground"
                  >
                    <span className="size-2 rounded-full bg-primary" />
                    Filtrar apenas sem site próprio
                  </Label>
                </div>

                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                    <ArrowUpDown className="size-3" /> Ordenar:
                  </span>
                  <Button
                    variant={ordenacao === "score" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setOrdenacao("score")}
                    className="h-7 text-xs px-2.5"
                  >
                    Score
                  </Button>
                  <Button
                    variant={ordenacao === "avaliacao" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setOrdenacao("avaliacao")}
                    className="h-7 text-xs px-2.5"
                  >
                    Avaliação Google
                  </Button>
                  <Button
                    variant={ordenacao === "data" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setOrdenacao("data")}
                    className="h-7 text-xs px-2.5"
                  >
                    Mais Recentes
                  </Button>
                  {(busca ||
                    filtroCategoria !== "todas" ||
                    filtroStatus !== "todos" ||
                    filtroInstagram !== "todos" ||
                    apenasSemSite) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={limparFiltros}
                      className="h-7 text-xs px-2 text-primary hover:underline"
                    >
                      Limpar Filtros
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* BARRA DE AÇÕES EM MASSA QUANDO SELECIONADOS > 0 */}
          {selecionados.size > 0 && (
            <div className="p-3 rounded-xl bg-primary/15 border border-primary/30 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
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
            <Card className="bg-card border-border/80 shadow-elev overflow-hidden">
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
                        <th className="p-3 pr-4 text-right">Ação</th>
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
                              <td className="p-3 dado text-muted-foreground">
                                {lead.bairro || lead.cidade || "—"}
                              </td>
                            )}

                            {colunasVisiveis.contato && (
                              <td className="p-3">
                                <div className="space-y-0.5">
                                  {lead.telefone ? (
                                    <p className="font-mono text-xs flex items-center gap-1 text-foreground">
                                      <Phone className="size-3 text-muted-foreground" />
                                      {lead.telefone}
                                    </p>
                                  ) : (
                                    <span className="text-[10px] text-muted-foreground">
                                      Sem telefone
                                    </span>
                                  )}

                                  {lead.instagram ? (
                                    <a
                                      href={`https://instagram.com/${lead.instagram.replace(/^@/, "")}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[10px] text-pink-400 hover:underline font-mono flex items-center gap-0.5"
                                    >
                                      <Instagram className="size-2.5" /> @{lead.instagram}
                                    </a>
                                  ) : (
                                    <a
                                      href={gerarUrlBuscaInstagram(
                                        lead.nome,
                                        lead.bairro || lead.cidade,
                                      )}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[10px] text-muted-foreground/60 hover:text-pink-400 flex items-center gap-0.5"
                                    >
                                      <Search className="size-2" /> Buscar @
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
                                  <a
                                    href={lead.site_url || "#"}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary"
                                  >
                                    <Globe className="size-2.5" /> Com site
                                    <ExternalLink className="size-2" />
                                  </a>
                                )}
                              </td>
                            )}

                            {colunasVisiveis.avaliacao && (
                              <td className="p-3">
                                {lead.avaliacao_google ? (
                                  <div className="flex items-center gap-1 text-amber-400 font-mono">
                                    <Star className="size-3 fill-amber-400" />
                                    <span className="font-bold">
                                      {lead.avaliacao_google.toFixed(1)}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                      ({lead.total_avaliacoes})
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-[10px]">Sem nota</span>
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
                              Não encontramos empresas correspondentes aos filtros aplicados. Tente ajustar a busca.
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
            </Card>
          ) : (
            /* MODO GRADE */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-1"
                        >
                          <MessageSquare className="size-3" />
                          Abordar
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => abrirDrawerLead(lead)}
                          className="size-7"
                        >
                          <Eye className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL WHATSAPP */}
      <WhatsAppModal
        lead={leadParaWhatsApp}
        aberto={modalWhatsAppAberto}
        onOpenChange={setModalWhatsAppAberto}
        onMensagemEnviada={recarregar}
      />

      {/* SLIDE-OVER DRAWER DE PREVIEW DO LEAD */}
      <LeadDrawer
        lead={leadDrawer}
        aberto={drawerAberto}
        onOpenChange={setDrawerAberto}
        onStatusChange={mudarStatus}
        onAbordarWhatsApp={(l) => {
          setLeadParaWhatsApp(l);
          setModalWhatsAppAberto(true);
        }}
        onLeadAtualizado={recarregar}
      />

      {/* DIÁLOGO ZERAR BASE */}
      <AlertDialog open={modalZerarAberto} onOpenChange={setModalZerarAberto}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-400 flex items-center gap-2">
              <AlertTriangle className="size-5" />
              Zerar Toda a Base de Estabelecimentos?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Esta ação removerá permanentemente todos os estabelecimentos e históricos de contato.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={zerarBase}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
            >
              Sim, Zerar Base
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
