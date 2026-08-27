import { Link } from "@tanstack/react-router";
import { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLeads } from "../hooks/useLeads";
import { BadgePriority } from "./BadgePriority";
import { BadgeStatus } from "./BadgeStatus";
import { WhatsAppModal } from "./WhatsAppModal";
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
      `estabelecimentos_meridian_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exportado com sucesso!");
  };

  const totalSemSite = leads.filter((l) => !l.tem_site).length;
  const totalComInstagram = leads.filter((l) => Boolean(l.instagram)).length;
  const totalAltaPrioridade = leads.filter((l) => l.score >= 70).length;

  return (
    <AppShell
      titulo="Base de Estabelecimentos"
      descricao="Listagem consolidada de estabelecimentos comerciais, classificação de oportunidade e gestão de contato da Meridian Tech"
      acoes={
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
          {/* Switcher de Visualização */}
          <div className="flex items-center gap-1 bg-secondary/80 p-0.5 rounded-lg border border-border/80">
            <button
              type="button"
              onClick={() => setModoVisualizacao("tabela")}
              className={cn(
                "flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
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
                "flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
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
            onClick={exportarCSV}
            className="h-8 px-2.5 gap-1.5 text-xs border-border/80 text-foreground"
          >
            <Download className="size-3.5" />
            <span className="hidden md:inline">Exportar </span>CSV
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setModalZerarAberto(true)}
            className="h-8 px-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-1.5"
            title="Limpar todos os estabelecimentos da base de dados"
          >
            <Trash2 className="size-3.5" />
            <span className="hidden sm:inline">Zerar Base</span>
            <span className="sm:hidden">Zerar</span>
          </Button>

          <Button
            size="sm"
            asChild
            className="h-8 px-2.5 gap-1.5 text-xs bg-primary text-primary-foreground font-semibold"
          >
            <Link to="/nova-busca">
              <Plus className="size-3.5" />
              <span>Detectar<span className="hidden sm:inline"> Novos</span></span>
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* RESUMO RÁPIDO EM CARDS SUPERIORES */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-card border border-border/70 shadow-sm flex items-center justify-between">
            <div>
              <p className="rotulo text-[10px]">Total Estabelecimentos</p>
              <p className="text-xl sm:text-2xl font-bold font-display dado mt-0.5 text-foreground">
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
              <p className="text-xl sm:text-2xl font-bold font-display text-[var(--color-alerta)] dado mt-0.5">
                {totalSemSite}
              </p>
            </div>
            <div className="size-9 rounded-xl bg-[var(--color-alerta)]/15 text-[var(--color-alerta)] flex items-center justify-center">
              <Zap className="size-4 fill-current" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border/70 shadow-sm flex items-center justify-between">
            <div>
              <p className="rotulo text-[10px] text-pink-400">Com Instagram</p>
              <p className="text-xl sm:text-2xl font-bold font-display text-pink-400 dado mt-0.5">
                {totalComInstagram}
              </p>
            </div>
            <div className="size-9 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
              <Instagram className="size-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border/70 shadow-sm flex items-center justify-between">
            <div>
              <p className="rotulo text-[10px] text-amber-400">Score &ge; 70 pts</p>
              <p className="text-xl sm:text-2xl font-bold font-display text-amber-400 dado mt-0.5">
                {totalAltaPrioridade}
              </p>
            </div>
            <div className="size-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Flame className="size-4 fill-current" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border/70 shadow-sm flex items-center justify-between col-span-2 sm:col-span-1 lg:col-span-1">
            <div>
              <p className="rotulo text-[10px] text-emerald-400">Filtrados em Tela</p>
              <p className="text-xl sm:text-2xl font-bold font-display text-emerald-400 dado mt-0.5">
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
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, bairro, @insta..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-8 text-xs h-9 bg-surface/50"
                />
              </div>

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

              <Select
                value={filtroInstagram}
                onValueChange={(val) => setFiltroInstagram(val as "todos" | "com" | "sem")}
              >
                <SelectTrigger className="text-xs h-9 bg-surface/50">
                  <SelectValue placeholder="Rede Social" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as redes</SelectItem>
                  <SelectItem value="com">Com Instagram ({totalComInstagram})</SelectItem>
                  <SelectItem value="sem">Sem Instagram</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MODO TABELA */}
        {modoVisualizacao === "tabela" ? (
          <Card className="bg-card border-border shadow-elev overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-surface/70 text-muted-foreground uppercase text-[10px] rotulo tracking-wider">
                      <th className="p-3 pl-4">Empresa</th>
                      <th className="p-3">Categoria</th>
                      <th className="p-3">Localização</th>
                      <th className="p-3">Contato & Redes</th>
                      <th className="p-3">Presença Web</th>
                      <th className="p-3">Avaliação</th>
                      <th className="p-3">Score & Prioridade</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 pr-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {leadsFiltrados.map((lead) => (
                      <tr key={lead.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="p-3 pl-4">
                          <Link
                            to="/leads/$id"
                            params={{ id: lead.id }}
                            className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1 block text-sm"
                          >
                            {lead.nome}
                          </Link>
                          {lead.endereco && (
                            <p className="text-[10px] text-muted-foreground line-clamp-1">
                              {lead.endereco}
                            </p>
                          )}
                        </td>

                        <td className="p-3 text-muted-foreground">{lead.categoria}</td>

                        <td className="p-3 dado text-muted-foreground">
                          {lead.bairro || lead.cidade || "—"}
                        </td>

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
                                <Search className="size-2" /> Buscar no Insta
                              </a>
                            )}
                          </div>
                        </td>

                        <td className="p-3">
                          {!lead.tem_site ? (
                            <span className="inline-flex items-center gap-1 rounded bg-[var(--color-alerta)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-alerta)] border border-[var(--color-alerta)]/30">
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

                        <td className="p-3">
                          <BadgePriority score={lead.score} />
                        </td>

                        <td className="p-3">
                          <Select
                            value={lead.status}
                            onValueChange={(val) => mudarStatus(lead.id, val as LeadItem["status"])}
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

                        <td className="p-3 pr-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => {
                                setLeadParaWhatsApp(lead);
                                setModalWhatsAppAberto(true);
                              }}
                              className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] gap-1 font-semibold"
                            >
                              <MessageSquare className="size-3" />
                              Abordar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="h-7 text-xs px-2 border-border/80"
                            >
                              <Link to="/leads/$id" params={{ id: lead.id }}>
                                Detalhes
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
                    <Link
                      to="/leads/$id"
                      params={{ id: lead.id }}
                      className="font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-1"
                    >
                      {lead.nome}
                    </Link>
                    <p className="text-xs text-muted-foreground truncate dado mt-0.5">
                      📍 {lead.bairro || lead.cidade || "Local não informado"}
                    </p>
                  </div>

                  <div className="space-y-1 py-1 border-y border-border/60 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-[11px]">Presença:</span>
                      {!lead.tem_site ? (
                        <span className="text-[10px] font-semibold text-[var(--color-alerta)]">
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <WhatsAppModal
        lead={leadParaWhatsApp}
        aberto={modalWhatsAppAberto}
        onOpenChange={setModalWhatsAppAberto}
        onMensagemEnviada={recarregar}
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
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs"
            >
              Sim, Zerar Base
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
