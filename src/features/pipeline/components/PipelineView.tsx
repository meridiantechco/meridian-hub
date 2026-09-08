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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Radio,
  RotateCcw,
  RefreshCw,
  Plus,
  Kanban,
  Trash2,
  Search,
  Filter,
  Building2,
  Clock,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { WhatsAppModal, LeadDrawer, type LeadItem } from "@/features/leads";
import { usePipeline } from "../hooks/usePipeline";
import { COLUNAS_PIPELINE } from "../types";
import { PipelineColumn } from "./PipelineColumn";

export function PipelineView() {
  const {
    leads,
    carregando,
    conectadoRealtime,
    processandoAcaoFunil,
    carregarDados,
    moverStatus,
    reiniciarFunil,
    zerarBase,
  } = usePipeline();

  const [departamentoSelecionado, setDepartamentoSelecionado] = useState<string>("todos");
  const [termoBusca, setTermoBusca] = useState("");
  const [leadArrastadoId, setLeadArrastadoId] = useState<string | null>(null);
  const [colunaHover, setColunaHover] = useState<string | null>(null);
  const [leadParaWhatsApp, setLeadParaWhatsApp] = useState<LeadItem | null>(null);
  const [modalWhatsAppAberto, setModalWhatsAppAberto] = useState(false);
  const [modalZerarFunilAberto, setModalZerarFunilAberto] = useState(false);

  // Drawer de preview do lead
  const [leadDrawer, setLeadDrawer] = useState<LeadItem | null>(null);
  const [drawerAberto, setDrawerAberto] = useState(false);

  // Extrai lista dinâmica de departamentos (categorias) com contagem
  const departamentos = useMemo(() => {
    const mapa = new Map<string, number>();
    leads.forEach((l) => {
      const cat = (l.categoria || "Outros").trim();
      if (cat) {
        mapa.set(cat, (mapa.get(cat) || 0) + 1);
      }
    });
    return Array.from(mapa.entries()).sort((a, b) => b[1] - a[1]);
  }, [leads]);

  // Filtra leads pelo departamento selecionado e termo de busca
  const leadsFiltrados = useMemo(() => {
    return leads.filter((l) => {
      if (departamentoSelecionado !== "todos") {
        const cat = (l.categoria || "Outros").trim();
        if (cat !== departamentoSelecionado) return false;
      }
      if (termoBusca.trim()) {
        const q = termoBusca.toLowerCase().trim();
        const matchNome = l.nome.toLowerCase().includes(q);
        const matchCat = (l.categoria || "").toLowerCase().includes(q);
        const matchLoc = (l.bairro || l.cidade || "").toLowerCase().includes(q);
        return matchNome || matchCat || matchLoc;
      }
      return true;
    });
  }, [leads, departamentoSelecionado, termoBusca]);

  // Contadores por status de contato
  const contagem = useMemo(() => {
    return {
      total: leadsFiltrados.length,
      novos: leadsFiltrados.filter((l) => l.status === "novo").length,
      contatados: leadsFiltrados.filter((l) => l.status === "contatado").length,
      proposta: leadsFiltrados.filter((l) => l.status === "proposta").length,
      fechados: leadsFiltrados.filter((l) => l.status === "fechado").length,
    };
  }, [leadsFiltrados]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setLeadArrastadoId(id);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setColunaHover(colId);
  };

  const handleDragLeave = () => {
    setColunaHover(null);
  };

  const handleDrop = async (e: React.DragEvent, statusDestino: LeadItem["status"]) => {
    e.preventDefault();
    setColunaHover(null);
    const id = e.dataTransfer.getData("text/plain") || leadArrastadoId;
    if (id) {
      await moverStatus(id, statusDestino);
    }
    setLeadArrastadoId(null);
  };

  const handleAbordar = (lead: LeadItem) => {
    setLeadParaWhatsApp(lead);
    setModalWhatsAppAberto(true);
  };

  const handlePreviewLead = (lead: LeadItem) => {
    setLeadDrawer(lead);
    setDrawerAberto(true);
  };

  return (
    <AppShell
      titulo="Quadro Kanban"
      descricao="Acompanhe o status de contato com cada departamento e estabelecimento minerado"
      acoes={
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface/60 border border-border/80 text-[11px] text-muted-foreground dado">
            <Radio
              className={`size-3 ${conectadoRealtime ? "text-emerald-400 animate-pulse" : "text-amber-400"}`}
            />
            <span>{conectadoRealtime ? "Tempo Real Ativo" : "Conectando..."}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setModalZerarFunilAberto(true)}
            disabled={leads.length === 0}
            className="h-8 px-2.5 gap-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border-rose-500/30"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline">Zerar Funil</span>
            <span className="sm:hidden">Zerar</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={carregarDados}
            disabled={carregando}
            className="h-8 px-2.5 gap-1.5 text-xs border-border/80"
          >
            <RefreshCw className={`size-3.5 ${carregando ? "animate-spin text-primary" : ""}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>

          <Button
            asChild
            size="sm"
            className="h-8 px-3 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
          >
            <Link to="/nova-busca">
              <Plus className="size-3.5" />
              <span>Novo Lead</span>
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* KPIS DE STATUS DE CONTATO POR DEPARTAMENTO */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Mapeado
            </p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold font-display text-foreground">
                {contagem.total}
              </span>
              <Building2 className="size-4 text-muted-foreground" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-card border border-purple-500/30 shadow-xs bg-purple-500/5">
            <p className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider">
              A Contatar
            </p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold font-display text-purple-400">
                {contagem.novos}
              </span>
              <Clock className="size-4 text-purple-400" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-card border border-amber-500/30 shadow-xs bg-amber-500/5">
            <p className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider">
              Contatados
            </p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold font-display text-amber-400">
                {contagem.contatados}
              </span>
              <MessageSquare className="size-4 text-amber-400" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-card border border-indigo-500/30 shadow-xs bg-indigo-500/5">
            <p className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">
              Em Proposta
            </p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold font-display text-indigo-400">
                {contagem.proposta}
              </span>
              <TrendingUp className="size-4 text-indigo-400" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-card border border-emerald-500/30 shadow-xs bg-emerald-500/5 col-span-2 sm:col-span-1">
            <p className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
              Fechados (Ganhos)
            </p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold font-display text-emerald-400">
                {contagem.fechados}
              </span>
              <CheckCircle2 className="size-4 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* BARRA DE FILTROS POR DEPARTAMENTO & BUSCA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border/70 shadow-xs">
          <div className="flex flex-1 items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar estabelecimento, bairro ou cidade..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="pl-9 text-xs h-9 bg-surface/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={departamentoSelecionado} onValueChange={setDepartamentoSelecionado}>
              <SelectTrigger className="w-[230px] text-xs h-9 bg-surface/50 border-border/80">
                <div className="flex items-center gap-2 truncate">
                  <Filter className="size-3.5 text-primary shrink-0" />
                  <SelectValue placeholder="Filtrar por Departamento" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="todos" className="text-xs">
                  Todos os Departamentos ({leads.length})
                </SelectItem>
                {departamentos.map(([dep, total]) => (
                  <SelectItem key={dep} value={dep} className="text-xs">
                    {dep} ({total})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(departamentoSelecionado !== "todos" || termoBusca) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDepartamentoSelecionado("todos");
                  setTermoBusca("");
                }}
                className="text-xs h-9 text-muted-foreground hover:text-foreground"
              >
                Limpar
              </Button>
            )}
          </div>
        </div>

        {/* COLUNAS KANBAN */}
        <div className="overflow-x-auto pb-4 scroll-smooth">
          <div className="flex gap-3.5 sm:gap-4 min-w-max lg:min-w-full items-start">
            {COLUNAS_PIPELINE.map((coluna, colIdx) => {
              const leadsDaColuna = leadsFiltrados.filter((l) => l.status === coluna.id);
              const isHover = colunaHover === coluna.id;

              return (
                <PipelineColumn
                  key={coluna.id}
                  coluna={coluna}
                  colIdx={colIdx}
                  todasColunas={COLUNAS_PIPELINE}
                  leads={leadsDaColuna}
                  isHover={isHover}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onMoverStatus={moverStatus}
                  onAbordar={handleAbordar}
                  onPreviewLead={handlePreviewLead}
                  onDragStart={handleDragStart}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* MODAL WHATSAPP */}
      <WhatsAppModal
        lead={leadParaWhatsApp}
        aberto={modalWhatsAppAberto}
        onOpenChange={setModalWhatsAppAberto}
        onMensagemEnviada={carregarDados}
      />

      {/* SLIDE-OVER DRAWER DE PREVIEW DO LEAD */}
      <LeadDrawer
        lead={leadDrawer}
        aberto={drawerAberto}
        onOpenChange={setDrawerAberto}
        onStatusChange={moverStatus}
        onAbordarWhatsApp={(l) => {
          setLeadParaWhatsApp(l);
          setModalWhatsAppAberto(true);
        }}
        onLeadAtualizado={carregarDados}
      />

      {/* DIÁLOGO ZERAR / REINICIAR FUNIL */}
      <Dialog open={modalZerarFunilAberto} onOpenChange={setModalZerarFunilAberto}>
        <DialogContent className="max-w-md bg-card border-border shadow-2xl">
          <DialogHeader>
            <div className="size-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-1">
              <RotateCcw className="size-5" />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              Zerar / Reiniciar Funil de Vendas
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Você possui <strong>{leads.length} estabelecimentos</strong> no funil. Escolha a ação
              desejada:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-xl bg-surface/50 border border-border/80 space-y-2 hover:border-primary/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-xs text-foreground">
                  <Kanban className="size-4 text-primary" />
                  <span>Reiniciar Etapas para "Novo"</span>
                </div>
                <span className="text-[10px] rotulo text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Recomendado
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Mantém todos os estabelecimentos cadastrados na base, mas move todos eles de volta
                para a primeira coluna ("Novo").
              </p>
              <Button
                type="button"
                onClick={async () => {
                  await reiniciarFunil();
                  setModalZerarFunilAberto(false);
                }}
                disabled={processandoAcaoFunil}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5"
              >
                <RotateCcw className="size-3.5" />
                {processandoAcaoFunil ? "Processando..." : "Reiniciar Estágios para 'Novo'"}
              </Button>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-xs text-rose-400">
                <Trash2 className="size-4" />
                <span>Excluir e Limpar Todos os Estabelecimentos</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Remove permanentemente todos os estabelecimentos do funil e da base de dados.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  await zerarBase();
                  setModalZerarFunilAberto(false);
                }}
                disabled={processandoAcaoFunil}
                className="w-full border-rose-500/30 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 font-semibold text-xs h-8 gap-1.5"
              >
                <Trash2 className="size-3.5" />
                {processandoAcaoFunil ? "Excluindo..." : "Zerar e Excluir Estabelecimentos"}
              </Button>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setModalZerarFunilAberto(false)}
              disabled={processandoAcaoFunil}
              className="text-xs h-8 w-full sm:w-auto"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
