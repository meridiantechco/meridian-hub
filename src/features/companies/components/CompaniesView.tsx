import { Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
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
import {
  Building2,
  Search,
  Download,
  Plus,
  ArrowRight,
  MessageSquare,
  Globe,
  AlertCircle,
  Instagram,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { BadgePriority, BadgeStatus, WhatsAppModal, LeadDrawer, leadsService, type LeadItem } from "@/features/leads";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { TableSkeleton } from "@/components/ui/skeletons";
import { companiesService } from "../services/companiesService";
import type { EmpresaItem } from "../types";

export function CompaniesView() {
  const [empresas, setEmpresas] = useState<EmpresaItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  // Modais
  const [leadParaWhatsApp, setLeadParaWhatsApp] = useState<LeadItem | null>(null);
  const [modalWhatsAppAberto, setModalWhatsAppAberto] = useState(false);
  const [empresaParaExcluir, setEmpresaParaExcluir] = useState<EmpresaItem | null>(null);
  const [excluindoEmpresa, setExcluindoEmpresa] = useState(false);

  const [empresaDrawer, setEmpresaDrawer] = useState<LeadItem | null>(null);
  const [drawerAberto, setDrawerAberto] = useState(false);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const lista = await companiesService.listarEmpresas();
      setEmpresas(lista);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    void carregarDados();
  }, []);

  const categoriasDisponiveis = useMemo(() => {
    const setCats = new Set<string>();
    empresas.forEach((e) => {
      if (e.categoria) setCats.add(e.categoria);
    });
    return Array.from(setCats).sort();
  }, [empresas]);

  const empresasFiltradas = useMemo(() => {
    return empresas.filter((emp) => {
      if (filtroCategoria !== "todas" && emp.categoria !== filtroCategoria) {
        return false;
      }
      if (filtroStatus !== "todos" && emp.status !== filtroStatus) {
        return false;
      }
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const nome = emp.nome.toLowerCase();
        const local = (emp.bairro || emp.cidade || "").toLowerCase();
        if (!nome.includes(termo) && !local.includes(termo)) {
          return false;
        }
      }
      return true;
    });
  }, [empresas, filtroCategoria, filtroStatus, busca]);

  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const exportarCSV = () => {
    if (empresasFiltradas.length === 0) {
      toast.error("Nenhuma empresa para exportar.");
      return;
    }

    const cabecalho = "Nome,Categoria,Bairro,Cidade,Score,Potencial,Status,Telefone,Instagram\n";
    const linhas = empresasFiltradas
      .map(
        (e) =>
          `"${e.nome}","${e.categoria}","${e.bairro || ""}","${e.cidade || ""}",${e.score},${e.valor_potencial || 0},"${e.status}","${e.telefone || ""}","${e.instagram || ""}"`,
      )
      .join("\n");

    const blob = new Blob([cabecalho + linhas], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `empresas_crm_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${empresasFiltradas.length} empresas exportadas com sucesso!`);
  };

  return (
    <AppShell
      titulo="CRM de Empresas"
      descricao="Gestão corporativa de contas, histórico comercial, potencial estimado e relacionamento"
      acoes={
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={exportarCSV}
            className="h-8 px-2.5 gap-1.5 text-xs border-border/80"
          >
            <Download className="size-3.5" />
            <span>Exportar CSV</span>
          </Button>

          <Button
            asChild
            size="sm"
            className="h-8 px-3.5 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
          >
            <Link to="/nova-busca">
              <Plus className="size-3.5" />
              <span>Adicionar Empresa</span>
            </Link>
          </Button>
        </div>
      }
    >
      {carregando && empresas.length === 0 ? (
        <TableSkeleton colunas={8} linhas={7} mostrarFiltros={true} />
      ) : (
        <div className="space-y-4 max-w-6xl animate-fade-in">
          {/* TABELA DE EMPRESAS CRM COM TOOLBAR INTEGRADA */}
          <Card className="bg-card border-border/80 shadow-elev overflow-hidden">
            {/* TOOLBAR INTEGRADA */}
            <div className="p-3.5 border-b border-border/60 bg-surface/30">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar empresa por nome ou bairro..."
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
                    <SelectValue placeholder="Status comercial" />
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
              </div>
            </div>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-surface/70 text-muted-foreground uppercase text-[10px] rotulo tracking-wider whitespace-nowrap">
                      <th className="p-3 pl-4">Empresa / Conta</th>
                      <th className="p-3">Categoria</th>
                      <th className="p-3">Localização</th>
                      <th className="p-3">Presença Digital</th>
                      <th className="p-3">Potencial Estimado</th>
                      <th className="p-3">Score</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 pr-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {empresasFiltradas.map((emp) => (
                      <tr key={emp.id} className="hover:bg-secondary/30 transition-colors group">
                        <td className="p-3 pl-4">
                          <Link
                            to="/companies/$id"
                            params={{ id: emp.id }}
                            className="font-bold text-foreground group-hover:text-primary transition-colors text-xs line-clamp-1 flex items-center gap-1.5"
                          >
                            <Building2 className="size-3.5 text-primary shrink-0" />
                            <span>{emp.nome}</span>
                          </Link>
                          {emp.endereco && (
                            <p className="text-[10.5px] text-muted-foreground line-clamp-1 pl-5">
                              {emp.endereco}
                            </p>
                          )}
                        </td>

                        <td className="p-3 text-muted-foreground">{emp.categoria}</td>

                        <td className="p-3 dado text-muted-foreground">
                          📍 {emp.bairro || emp.cidade || "—"}
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {!emp.tem_site ? (
                              <span className="inline-flex items-center gap-1 rounded bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/25">
                                <AlertCircle className="size-2.5" /> Sem site
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                                <Globe className="size-2.5" /> Com site
                              </span>
                            )}

                            {emp.instagram && (
                              <span className="text-[10px] text-pink-400 font-mono hidden md:inline-flex items-center gap-0.5">
                                <Instagram className="size-2.5" /> @{emp.instagram}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-3">
                          <span className="font-bold font-display text-emerald-400 dado text-xs">
                            {formatarMoeda(emp.valor_potencial || 2000)}
                          </span>
                        </td>

                        <td className="p-3">
                          <BadgePriority score={emp.score} />
                        </td>

                        <td className="p-3">
                          <BadgeStatus status={emp.status} />
                        </td>

                        <td className="p-3 pr-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => {
                                setLeadParaWhatsApp(emp);
                                setModalWhatsAppAberto(true);
                              }}
                              className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] gap-1 font-semibold shadow-xs"
                            >
                              <MessageSquare className="size-3" />
                              WhatsApp
                            </Button>

                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs border-border/80 hover:border-primary/40 text-foreground"
                              title="Ver Perfil 360°"
                            >
                              <Link to="/companies/$id" params={{ id: emp.id }}>
                                <ArrowRight className="size-3" />
                              </Link>
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setEmpresaParaExcluir(emp)}
                              className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              title="Excluir empresa"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {empresasFiltradas.length === 0 && !carregando && (
                      <tr>
                        <td colSpan={8} className="py-12 text-center space-y-2">
                          <Building2 className="size-8 text-muted-foreground/40 mx-auto" />
                          <p className="text-sm font-semibold text-foreground">
                            Nenhuma empresa encontrada
                          </p>
                          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                            Ajuste os termos de busca ou filtros aplicados.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* DIÁLOGO EXCLUSÃO DE EMPRESA */}
      <ConfirmDeleteDialog
        open={Boolean(empresaParaExcluir)}
        onOpenChange={(open) => !open && setEmpresaParaExcluir(null)}
        titulo="Excluir Empresa / Estabelecimento?"
        descricao="Esta ação removerá esta empresa permanentemente da sua carteira."
        itemNome={empresaParaExcluir ? `${empresaParaExcluir.nome} (${empresaParaExcluir.categoria})` : undefined}
        carregando={excluindoEmpresa}
        onConfirmar={async () => {
          if (!empresaParaExcluir) return;
          setExcluindoEmpresa(true);
          try {
            await leadsService.removerLead(empresaParaExcluir.id);
            toast.success(`Empresa "${empresaParaExcluir.nome}" excluída com sucesso!`);
            await carregarDados();
            setEmpresaParaExcluir(null);
          } finally {
            setExcluindoEmpresa(false);
          }
        }}
      />

      {/* WHATSAPP MODAL */}
      <WhatsAppModal
        lead={leadParaWhatsApp}
        aberto={modalWhatsAppAberto}
        onOpenChange={setModalWhatsAppAberto}
        onMensagemEnviada={carregarDados}
      />

      {/* LEAD DRAWER */}
      <LeadDrawer
        lead={empresaDrawer}
        aberto={drawerAberto}
        onOpenChange={setDrawerAberto}
        onStatusChange={async (leadId, status) => {
          await companiesService.obterEmpresaPorId(leadId);
          await carregarDados();
        }}
        onAbordarWhatsApp={(l) => {
          setLeadParaWhatsApp(l);
          setModalWhatsAppAberto(true);
        }}
        onLeadAtualizado={carregarDados}
      />
    </AppShell>
  );
}
