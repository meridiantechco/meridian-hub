import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { WhatsAppModal, LeadDrawer, type LeadItem } from "@/features/leads";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { KanbanSkeleton } from "@/components/ui/skeletons";
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
    removerLead,
  } = usePipeline();

  const [leadArrastadoId, setLeadArrastadoId] = useState<string | null>(null);
  const [colunaHover, setColunaHover] = useState<string | null>(null);
  const [leadParaWhatsApp, setLeadParaWhatsApp] = useState<LeadItem | null>(null);
  const [modalWhatsAppAberto, setModalWhatsAppAberto] = useState(false);
  const [modalZerarFunilAberto, setModalZerarFunilAberto] = useState(false);
  const [leadParaExcluir, setLeadParaExcluir] = useState<LeadItem | null>(null);
  const [excluindoLead, setExcluindoLead] = useState(false);

  // Drawer de preview do lead
  const [leadDrawer, setLeadDrawer] = useState<LeadItem | null>(null);
  const [drawerAberto, setDrawerAberto] = useState(false);

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
      titulo="Funil Comercial"
      descricao="Pipeline interativo com movimentação por arrastar e soltar e atualização em tempo real"
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
      {carregando && leads.length === 0 ? (
        <KanbanSkeleton colunas={5} cardsPorColuna={3} />
      ) : (
        <div className="overflow-x-auto pb-4 scroll-smooth animate-fade-in">
          <div className="flex gap-3.5 sm:gap-4 min-w-max lg:min-w-full items-start">
            {COLUNAS_PIPELINE.map((coluna, colIdx) => {
              const leadsDaColuna = leads.filter((l) => l.status === coluna.id);
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
                  onSolicitarExcluir={(lead) => setLeadParaExcluir(lead)}
                  onDragStart={handleDragStart}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO INDIVIDUAL DE LEAD */}
      <ConfirmDeleteDialog
        open={Boolean(leadParaExcluir)}
        onOpenChange={(open) => !open && setLeadParaExcluir(null)}
        titulo="Excluir Estabelecimento do Funil?"
        descricao="Você está prestes a remover este lead permanentemente do seu funil comercial e da base de dados."
        itemNome={leadParaExcluir ? `${leadParaExcluir.nome} (${leadParaExcluir.categoria})` : undefined}
        carregando={excluindoLead}
        onConfirmar={async () => {
          if (!leadParaExcluir) return;
          setExcluindoLead(true);
          try {
            await removerLead(leadParaExcluir.id, leadParaExcluir.nome);
            setLeadParaExcluir(null);
          } finally {
            setExcluindoLead(false);
          }
        }}
      />

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
              Você possui <strong>{leads.length} estabelecimentos</strong> no funil. Escolha a ação desejada:
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
                Mantém todos os estabelecimentos cadastrados na base, mas move todos eles de volta para a primeira coluna ("Novo").
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
