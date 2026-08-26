import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/prospecta/AppShell";
import { BadgePrioridade } from "@/components/prospecta/BadgePrioridade";
import { BadgeStatus } from "@/components/prospecta/BadgeStatus";
import { ModalMensagemWhatsApp } from "@/components/prospecta/ModalMensagemWhatsApp";
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
import { prospectaService } from "@/lib/prospecta-service";
import { auditoriaService } from "@/lib/auditoria-service";
import type { LeadItem } from "@/lib/leads-mock";
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
  ListFilter,
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
  ArrowUpRight,
  Trash2,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/leads")({
  head: () => ({
    meta: [
      { title: "Base de Estabelecimentos — Prospecta" },
      { name: "description", content: "Gerenciamento e prospecção de estabelecimentos comerciais" },
    ],
  }),
  component: PaginaLeads,
});

export function PaginaLeads() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [zerandoBase, setZerandoBase] = useState(false);
  const [modalZerarAberto, setModalZerarAberto] = useState(false);
  const [modoVisualizacao, setModoVisualizacao] = useState<"tabela" | "grade">("tabela");

  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroFaixaScore, setFiltroFaixaScore] = useState<string>("todos");
  const [apenasSemSite, setApenasSemSite] = useState(false);
  const [ordenacao, setOrdenacao] = useState<"score" | "avaliacao" | "data">("score");

  const [leadParaWhatsApp, setLeadParaWhatsApp] = useState<LeadItem | null>(null);
  const [modalWhatsAppAberto, setModalWhatsAppAberto] = useState(false);

  const carregarDados = async () => {
    setCarregando(true);
    const lista = await prospectaService.listarLeads();
    setLeads(lista);
    setCarregando(false);
  };

  useEffect(() => {
    void carregarDados();
  }, []);

  // Obter lista única de categorias
  const categoriasDisponiveis = useMemo(() => {
    const set = new Set(leads.map((l) => l.categoria).filter(Boolean));
    return Array.from(set);
  }, [leads]);

  // Alteração de status rápida na tabela
  const mudarStatus = async (leadId: string, novoStatus: LeadItem["status"]) => {
    const leadAlvo = leads.find((l) => l.id === leadId);

    await prospectaService.atualizarStatusLead(leadId, novoStatus);
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: novoStatus } : l)));

    await auditoriaService.registrarAtividade({
      tipo: "mudanca_status",
      titulo: `Status: ${leadAlvo?.nome || "Lead"} -> ${novoStatus.toUpperCase()}`,
      descricao: `Status comercial atualizado para "${novoStatus.toUpperCase()}"`,
      lead_id: leadId,
      lead_nome: leadAlvo?.nome,
      metadados: { novo_status: novoStatus },
    });

    toast.success("Status atualizado!");
  };

  const executarZerarBase = async () => {
    setZerandoBase(true);
    try {
      const total = await prospectaService.zerarBaseLeads();
      setLeads([]);
      setModalZerarAberto(false);

      await auditoriaService.registrarAtividade({
        tipo: "edicao_lead",
        titulo: "Base de estabelecimentos zerada",
        descricao: `Administrador limpou todos os ${total} estabelecimentos da base de dados.`,
      });

      toast.success("Base de estabelecimentos zerada com sucesso!");
    } catch (err: any) {
      toast.error("Falha ao zerar base", { description: err?.message || String(err) });
    } finally {
      setZerandoBase(false);
    }
  };

  // Filtragem e Ordenação
  const leadsFiltrados = useMemo(() => {
    return leads
      .filter((l) => {
        // Busca textual
        if (busca.trim()) {
          const termo = busca.toLowerCase();
          const matchNome = l.nome.toLowerCase().includes(termo);
          const matchBairro = (l.bairro || "").toLowerCase().includes(termo);
          const matchCidade = (l.cidade || "").toLowerCase().includes(termo);
          const matchTel = (l.telefone || "").includes(termo);
          if (!matchNome && !matchBairro && !matchCidade && !matchTel) return false;
        }

        // Categoria
        if (filtroCategoria !== "todas" && l.categoria !== filtroCategoria) return false;

        // Status
        if (filtroStatus !== "todos" && l.status !== filtroStatus) return false;

        // Sem site
        if (apenasSemSite && l.tem_site) return false;

        // Faixa de Score
        if (filtroFaixaScore === "alta" && l.score < 70) return false;
        if (filtroFaixaScore === "media" && (l.score < 40 || l.score >= 70)) return false;
        if (filtroFaixaScore === "baixa" && l.score >= 40) return false;

        return true;
      })
      .sort((a, b) => {
        if (ordenacao === "score") return b.score - a.score;
        if (ordenacao === "avaliacao") return (b.avaliacao_google ?? 0) - (a.avaliacao_google ?? 0);
        return new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime();
      });
  }, [leads, busca, filtroCategoria, filtroStatus, apenasSemSite, filtroFaixaScore, ordenacao]);

  // Exportar para CSV
  const exportarCSV = () => {
    const cabecalho =
      "Nome,Categoria,Bairro,Cidade,Estado,Telefone,Instagram,Avaliação Google,Total Avaliações,Tem Site,Score,Status\n";
    const linhas = leadsFiltrados
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
      `estabelecimentos_prospecta_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exportado com sucesso!");
  };

  const totalSemSite = leads.filter((l) => !l.tem_site).length;
  const totalAltaPrioridade = leads.filter((l) => l.score >= 70).length;

  return (
    <AppShell
      titulo="Base de Estabelecimentos"
      descricao="Listagem consolidada de estabelecimentos comerciais, classificação de oportunidade e gestão de contato"
      acoes={
        <div className="flex items-center gap-2">
          {/* Switcher de Visualização Principal */}
          <div className="flex items-center gap-1 bg-secondary/80 p-0.5 rounded-lg border border-border/80">
            <button
              type="button"
              onClick={() => setModoVisualizacao("tabela")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all",
                modoVisualizacao === "tabela"
                  ? "bg-primary text-primary-foreground shadow-sm"
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
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all",
                modoVisualizacao === "grade"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutGrid className="size-3.5" />
              <span className="hidden sm:inline">Grade</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setModalZerarAberto(true)}
            disabled={leads.length === 0}
            className="h-8 gap-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border-rose-500/30"
          >
            <Trash2 className="size-3.5" />
            Zerar Base
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={exportarCSV}
            className="h-8 gap-1.5 text-xs hidden sm:flex"
          >
            <Download className="size-3.5" />
            CSV
          </Button>

          <Button
            asChild
            size="sm"
            className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground font-semibold shadow-sm"
          >
            <Link to="/nova-busca">
              <Plus className="size-3.5" />
              Detectar Novos
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* RESUMO RÁPIDO EM CARDS SUPERIORES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-card border border-border/70 shadow-sm flex items-center justify-between">
            <div>
              <p className="rotulo text-[10px]">Total de Estabelecimentos</p>
              <p className="text-2xl font-bold font-display dado mt-0.5 text-foreground">
                {leads.length}
              </p>
            </div>
            <div className="size-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Building2 className="size-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border/70 shadow-sm flex items-center justify-between ring-1 ring-[var(--color-alerta)]/30">
            <div>
              <p className="rotulo text-[10px] text-[var(--color-alerta)]">Sem Site Próprio</p>
              <p className="text-2xl font-bold font-display text-[var(--color-alerta)] dado mt-0.5">
                {totalSemSite}
              </p>
            </div>
            <div className="size-9 rounded-xl bg-[var(--color-alerta)]/15 text-[var(--color-alerta)] flex items-center justify-center">
              <Zap className="size-4 fill-current" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border/70 shadow-sm flex items-center justify-between">
            <div>
              <p className="rotulo text-[10px] text-amber-400">Score &ge; 70 pts</p>
              <p className="text-2xl font-bold font-display text-amber-400 dado mt-0.5">
                {totalAltaPrioridade}
              </p>
            </div>
            <div className="size-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Flame className="size-4 fill-current" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border/70 shadow-sm flex items-center justify-between">
            <div>
              <p className="rotulo text-[10px] text-emerald-400">Filtrados em Tela</p>
              <p className="text-2xl font-bold font-display text-emerald-400 dado mt-0.5">
                {leadsFiltrados.length}
              </p>
            </div>
            <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <RefreshCw className={`size-4 ${carregando ? "animate-spin" : ""}`} />
            </div>
          </div>
        </div>

        {/* BARRA DE FILTROS E PESQUISA */}
        <Card className="bg-card border-border shadow-elev">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Busca Textual */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, bairro, telefone..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-8 text-xs h-9 bg-surface/50"
                />
              </div>

              {/* Filtro Categoria */}
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger className="text-xs h-9 bg-surface/50">
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

              {/* Filtro Status */}
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="text-xs h-9 bg-surface/50">
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

              {/* Filtro Faixa de Score */}
              <Select value={filtroFaixaScore} onValueChange={setFiltroFaixaScore}>
                <SelectTrigger className="text-xs h-9 bg-surface/50">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as prioridades</SelectItem>
                  <SelectItem value="alta">Alta (&ge; 70 pts)</SelectItem>
                  <SelectItem value="media">Média (40-69 pts)</SelectItem>
                  <SelectItem value="baixa">Baixa (&lt; 40 pts)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Linha secundária de filtros */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border/60">
              <div className="flex items-center space-x-2">
                <Switch
                  id="apenas-sem-site"
                  checked={apenasSemSite}
                  onCheckedChange={setApenasSemSite}
                />
                <Label
                  htmlFor="apenas-sem-site"
                  className="text-xs font-normal cursor-pointer flex items-center gap-1.5"
                >
                  <span className="size-2 rounded-full bg-[var(--color-alerta)]" />
                  Filtrar apenas estabelecimentos sem site próprio
                </Label>
              </div>

              {/* Ordenação */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
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
                  Avaliação
                </Button>
                <Button
                  variant={ordenacao === "data" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setOrdenacao("data")}
                  className="h-7 text-xs px-2.5"
                >
                  Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ========================================================================= */}
        {/* MODO 1: TABELA DETALHADA */}
        {/* ========================================================================= */}
        {modoVisualizacao === "tabela" && (
          <Card className="bg-card border-border shadow-elev overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface/70 text-muted-foreground uppercase text-[10px] rotulo tracking-wider">
                    <th className="p-3 pl-4">Estabelecimento / Categoria</th>
                    <th className="p-3">Endereço / Cidade</th>
                    <th className="p-3">Avaliação Google</th>
                    <th className="p-3">Presença Web</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 pr-4 text-right">Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leadsFiltrados.map((lead) => (
                    <tr key={lead.id} className="hover:bg-secondary/30 transition-colors group">
                      <td className="p-3 pl-4">
                        <div className="font-semibold text-foreground text-sm line-clamp-1">
                          <Link
                            to="/leads/$id"
                            params={{ id: lead.id }}
                            className="hover:text-primary transition-colors"
                          >
                            {lead.nome}
                          </Link>
                        </div>
                        <span className="text-[11px] text-muted-foreground">{lead.categoria}</span>
                      </td>

                      <td className="p-3 dado text-muted-foreground">
                        <p className="line-clamp-1">{lead.endereco || lead.bairro || "—"}</p>
                        <p className="text-[10px] text-muted-foreground/80 truncate">
                          {lead.bairro ? `${lead.bairro}, ` : ""}
                          {lead.cidade || ""} {lead.estado ? `- ${lead.estado}` : ""}
                        </p>
                      </td>

                      <td className="p-3 dado">
                        {lead.avaliacao_google ? (
                          <div className="flex items-center gap-1 text-amber-400">
                            <Star className="size-3 fill-amber-400" />
                            <span className="font-medium">{lead.avaliacao_google.toFixed(1)}</span>
                            <span className="text-muted-foreground text-[10px]">
                              ({lead.total_avaliacoes})
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">—</span>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="space-y-1">
                          {!lead.tem_site ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-alerta)]">
                              <AlertCircle className="size-3" /> Sem site próprio
                            </span>
                          ) : (
                            <a
                              href={lead.site_url || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                            >
                              <Globe className="size-3" /> Com site
                              <ExternalLink className="size-2.5" />
                            </a>
                          )}

                          {lead.instagram && (
                            <p className="text-[10px] text-pink-400 flex items-center gap-1 dado">
                              <Instagram className="size-2.5" /> @{lead.instagram}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="p-3">
                        <BadgePrioridade score={lead.score} mostrarBarra={true} />
                      </td>

                      <td className="p-3">
                        <Select
                          value={lead.status}
                          onValueChange={(val) => mudarStatus(lead.id, val as LeadItem["status"])}
                        >
                          <SelectTrigger className="h-7 w-28 text-[11px] bg-transparent border-border/80">
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

                      <td className="p-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => {
                              setLeadParaWhatsApp(lead);
                              setModalWhatsAppAberto(true);
                            }}
                            className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] gap-1 font-semibold"
                          >
                            <MessageSquare className="size-3" />
                            WhatsApp
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-7 px-2 text-[11px]"
                          >
                            <Link to="/leads/$id" params={{ id: lead.id }}>
                              <ArrowUpRight className="size-3" />
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {leadsFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-xs text-muted-foreground">
                        Nenhum estabelecimento encontrado com os filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-border bg-surface/50 text-[11px] text-muted-foreground flex items-center justify-between">
              <span className="dado">
                Exibindo {leadsFiltrados.length} de {leads.length} estabelecimentos
              </span>
              <span className="rotulo">Prospecta Hub</span>
            </div>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* MODO 2: GRADE DE CARDS */}
        {/* ========================================================================= */}
        {modoVisualizacao === "grade" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {leadsFiltrados.map((lead) => (
              <div
                key={lead.id}
                className="rounded-2xl border border-border/80 bg-card hover:border-primary/50 transition-all duration-200 p-4 flex flex-col justify-between shadow-elev space-y-3 group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground rotulo tracking-wider truncate">
                      {lead.categoria}
                    </span>
                    <BadgePrioridade score={lead.score} />
                  </div>

                  <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    <Link to="/leads/$id" params={{ id: lead.id }}>
                      {lead.nome}
                    </Link>
                  </h4>

                  <p className="text-xs text-muted-foreground truncate dado flex items-center gap-1">
                    <MapPin className="size-3 text-primary shrink-0" />
                    <span>{lead.bairro || lead.cidade || "Endereço não informado"}</span>
                  </p>

                  <div className="flex items-center justify-between text-xs pt-1">
                    {!lead.tem_site ? (
                      <span className="text-[10px] font-semibold text-[var(--color-alerta)] flex items-center gap-1 bg-[var(--color-alerta)]/10 px-2 py-0.5 rounded-full">
                        <Zap className="size-3 fill-current" /> Sem site próprio
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 bg-secondary px-2 py-0.5 rounded-full">
                        <Globe className="size-3" /> Possui site
                      </span>
                    )}

                    {lead.avaliacao_google != null && (
                      <div className="flex items-center gap-1 text-amber-400 text-xs dado">
                        <Star className="size-3 fill-amber-400" />
                        <span>{lead.avaliacao_google.toFixed(1)}</span>
                        <span className="text-[10px] text-muted-foreground">
                          ({lead.total_avaliacoes})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <Select
                    value={lead.status}
                    onValueChange={(val) => mudarStatus(lead.id, val as LeadItem["status"])}
                  >
                    <SelectTrigger className="h-7 w-28 text-[10px] bg-transparent border-border/80">
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

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1 font-semibold"
                      onClick={() => {
                        setLeadParaWhatsApp(lead);
                        setModalWhatsAppAberto(true);
                      }}
                    >
                      <MessageSquare className="size-3" />
                      WhatsApp
                    </Button>
                    <Button variant="ghost" size="icon" asChild className="size-7">
                      <Link to="/leads/$id" params={{ id: lead.id }}>
                        <ArrowUpRight className="size-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {leadsFiltrados.length === 0 && (
              <div className="col-span-full py-12 text-center text-xs text-muted-foreground">
                Nenhum estabelecimento encontrado com os filtros selecionados.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de envio WhatsApp */}
      <ModalMensagemWhatsApp
        lead={leadParaWhatsApp}
        aberto={modalWhatsAppAberto}
        onOpenChange={setModalWhatsAppAberto}
        onMensagemEnviada={carregarDados}
      />

      {/* Confirmação de Zerar Base */}
      <AlertDialog open={modalZerarAberto} onOpenChange={setModalZerarAberto}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <div className="size-10 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-1">
              <AlertTriangle className="size-5" />
            </div>
            <AlertDialogTitle className="text-base font-bold text-foreground">
              Zerar Base de Estabelecimentos?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Esta ação removerá permanentemente todos os{" "}
              <strong>{leads.length} estabelecimentos</strong> cadastrados na sua base de dados,
              além de seus históricos de interação. Esta operação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2">
            <AlertDialogCancel disabled={zerandoBase} className="text-xs h-9">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void executarZerarBase();
              }}
              disabled={zerandoBase}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs h-9"
            >
              {zerandoBase ? "Zerando..." : "Sim, Zerar Base"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
