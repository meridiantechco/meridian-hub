import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/prospecta/AppShell";
import { MapaLeads } from "@/components/prospecta/MapaLeads";
import { BadgePrioridade } from "@/components/prospecta/BadgePrioridade";
import { BadgeStatus } from "@/components/prospecta/BadgeStatus";
import { ModalMensagemWhatsApp } from "@/components/prospecta/ModalMensagemWhatsApp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { prospectaService } from "@/lib/prospecta-service";
import type { LeadItem } from "@/lib/leads-mock";
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
  Columns2,
  Table as TableIcon,
  LayoutGrid,
  MapPin,
  Flame,
  Zap,
  Phone,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/leads")({
  head: () => ({
    meta: [
      { title: "Base de Leads — Prospecta" },
      { name: "description", content: "Gerenciamento e prospecção de estabelecimentos" },
    ],
  }),
  component: PaginaLeads,
});

export function PaginaLeads() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modoVisualizacao, setModoVisualizacao] = useState<"mapa" | "tabela" | "grade">("mapa");

  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroFaixaScore, setFiltroFaixaScore] = useState<string>("todos");
  const [apenasSemSite, setApenasSemSite] = useState(false);
  const [ordenacao, setOrdenacao] = useState<"score" | "avaliacao" | "data">("score");

  const [leadSelecionado, setLeadSelecionado] = useState<LeadItem | null>(null);
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
    await prospectaService.atualizarStatusLead(leadId, novoStatus);
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: novoStatus } : l))
    );
    toast.success("Status atualizado!");
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
          const matchTel = (l.telefone || "").includes(termo);
          if (!matchNome && !matchBairro && !matchTel) return false;
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
      "Nome,Categoria,Bairro,Cidade,Telefone,Instagram,Avaliação Google,Total Avaliações,Tem Site,Score,Status\n";
    const linhas = leadsFiltrados
      .map(
        (l) =>
          `"${l.nome}","${l.categoria}","${l.bairro || ""}","${l.cidade || ""}","${l.telefone || ""}","${l.instagram || ""}",${l.avaliacao_google || ""},${l.total_avaliacoes},${l.tem_site ? "Sim" : "Não"},${l.score},"${l.status}"`
      )
      .join("\n");

    const blob = new Blob([cabecalho + linhas], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_prospecta_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exportado com sucesso!");
  };

  const totalSemSite = leads.filter((l) => !l.tem_site).length;
  const totalAltaPrioridade = leads.filter((l) => l.score >= 80).length;

  return (
    <AppShell
      titulo="Base de Leads"
      descricao="Lista consolidada com visualização em mapa interativo (estilo Airbnb), grade e tabela"
      acoes={
        <div className="flex items-center gap-2">
          {/* Switcher de Visualização Principal */}
          <div className="flex items-center gap-1 bg-secondary/80 p-0.5 rounded-lg border border-border/80">
            <button
              type="button"
              onClick={() => setModoVisualizacao("mapa")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all",
                modoVisualizacao === "mapa"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Columns2 className="size-3.5" />
              <span className="hidden sm:inline">Mapa & Lista</span>
            </button>
            <button
              type="button"
              onClick={() => setModoVisualizacao("grade")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all",
                modoVisualizacao === "grade"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="size-3.5" />
              <span className="hidden sm:inline">Grade</span>
            </button>
            <button
              type="button"
              onClick={() => setModoVisualizacao("tabela")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all",
                modoVisualizacao === "tabela"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <TableIcon className="size-3.5" />
              <span className="hidden sm:inline">Tabela</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={exportarCSV}
            className="h-8 gap-1.5 text-xs hidden sm:flex"
          >
            <Download className="size-3.5" />
            CSV
          </Button>

          <Button asChild size="sm" className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground">
            <Link to="/nova-busca">
              <Plus className="size-3.5" />
              Capturar
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* RESUMO RÁPIDO EM BADGES / CARDS SUPERIORES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-card border border-border/70 shadow-sm flex items-center justify-between">
            <div>
              <p className="rotulo text-[10px]">Total de Leads</p>
              <p className="text-xl font-bold font-display dado mt-0.5">{leads.length}</p>
            </div>
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ListFilter className="size-4" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/70 shadow-sm flex items-center justify-between">
            <div>
              <p className="rotulo text-[10px] text-[var(--color-alerta)]">Sem Site Próprio</p>
              <p className="text-xl font-bold font-display text-[var(--color-alerta)] dado mt-0.5">
                {totalSemSite}
              </p>
            </div>
            <div className="size-8 rounded-lg bg-[var(--color-alerta)]/15 text-[var(--color-alerta)] flex items-center justify-center">
              <Zap className="size-4 fill-current" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/70 shadow-sm flex items-center justify-between">
            <div>
              <p className="rotulo text-[10px] text-amber-400">Score &ge; 80 pts</p>
              <p className="text-xl font-bold font-display text-amber-400 dado mt-0.5">
                {totalAltaPrioridade}
              </p>
            </div>
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Flame className="size-4 fill-current" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/70 shadow-sm flex items-center justify-between">
            <div>
              <p className="rotulo text-[10px] text-emerald-400">Filtrados</p>
              <p className="text-xl font-bold font-display text-emerald-400 dado mt-0.5">
                {leadsFiltrados.length}
              </p>
            </div>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <RefreshCw className="size-4" />
            </div>
          </div>
        </div>

        {/* BARRA DE FILTROS */}
        <Card className="bg-card border-border shadow-elev">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Busca Textual */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, bairro, tel..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-8 text-xs h-9"
                />
              </div>

              {/* Filtro Categoria */}
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger className="text-xs h-9">
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
                <SelectTrigger className="text-xs h-9">
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
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as prioridades</SelectItem>
                  <SelectItem value="alta">Alta (&gt; 70 pts)</SelectItem>
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
                  Filtrar apenas sem site próprio
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
        {/* MODO 1: MAPA & LISTA AIRBNB STYLE */}
        {/* ========================================================================= */}
        {modoVisualizacao === "mapa" && (
          <MapaLeads
            leads={leadsFiltrados}
            aoSelecionarLead={(l) => setLeadSelecionado(l)}
            leadSelecionadoExterno={leadSelecionado}
            filtrosExternos={{
              categoria: filtroCategoria,
              status: filtroStatus,
              apenasSemSite: apenasSemSite,
              scoreMinimo:
                filtroFaixaScore === "alta" ? 70 : filtroFaixaScore === "media" ? 40 : null,
              termo: busca,
            }}
          />
        )}

        {/* ========================================================================= */}
        {/* MODO 2: GRADE DE CARDS (ESTILO VETRA / HOMLU LISTINGS) */}
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
                        <span className="text-[10px] text-muted-foreground">({lead.total_avaliacoes})</span>
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
                Nenhum lead encontrado com os filtros selecionados.
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODO 3: TABELA DETALHADA */}
        {/* ========================================================================= */}
        {modoVisualizacao === "tabela" && (
          <Card className="bg-card border-border shadow-elev overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface/70 text-muted-foreground uppercase text-[10px] rotulo tracking-wider">
                    <th className="p-3 pl-4">Empresa / Categoria</th>
                    <th className="p-3">Localização</th>
                    <th className="p-3">Google Places</th>
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
                        <p className="line-clamp-1">{lead.bairro || lead.cidade || "—"}</p>
                        <p className="text-[10px] text-muted-foreground/80 truncate">
                          {lead.cidade ? `${lead.cidade} - ${lead.estado || "BA"}` : ""}
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
                              <AlertCircle className="size-3" /> Sem site
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Globe className="size-3" /> Com site
                            </span>
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
                            className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] gap-1"
                          >
                            <MessageSquare className="size-3" />
                            WhatsApp
                          </Button>
                          <Button variant="outline" size="sm" asChild className="h-7 px-2 text-[11px]">
                            <Link to="/leads/$id" params={{ id: lead.id }}>
                              <ExternalLink className="size-3" />
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {leadsFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-xs text-muted-foreground">
                        Nenhum lead encontrado com os filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-border bg-surface/50 text-[11px] text-muted-foreground flex items-center justify-between">
              <span className="dado">
                Exibindo {leadsFiltrados.length} de {leads.length} leads
              </span>
              <span className="rotulo">Prospecta Cartografia</span>
            </div>
          </Card>
        )}
      </div>

      {/* Modal de envio WhatsApp */}
      <ModalMensagemWhatsApp
        lead={leadParaWhatsApp}
        aberto={modalWhatsAppAberto}
        onOpenChange={setModalWhatsAppAberto}
        onMensagemEnviada={carregarDados}
      />
    </AppShell>
  );
}

