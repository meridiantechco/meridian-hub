import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Phone,
  Instagram,
  Globe,
  Star,
  MessageSquare,
  ExternalLink,
  MapPin,
  Save,
  Clock,
  Send,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { BadgePriority } from "./BadgePriority";
import { BadgeStatus } from "./BadgeStatus";
import { leadsService } from "../services/leadsService";
import { auditoriaService } from "@/features/audit";
import type { LeadItem, InteracaoItem } from "../types";

interface LeadDrawerProps {
  lead: LeadItem | null;
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  onStatusChange: (leadId: string, status: LeadItem["status"]) => void;
  onAbordarWhatsApp: (lead: LeadItem) => void;
  onLeadAtualizado?: () => void;
}

export function LeadDrawer({
  lead,
  aberto,
  onOpenChange,
  onStatusChange,
  onAbordarWhatsApp,
  onLeadAtualizado,
}: LeadDrawerProps) {
  const [observacoes, setObservacoes] = useState(lead?.observacoes || "");
  const [salvandoObs, setSalvandoObs] = useState(false);
  const [interacoes, setInteracoes] = useState<InteracaoItem[]>([]);
  const [carregandoInteracoes, setCarregandoInteracoes] = useState(false);
  const [novaInteracaoTexto, setNovaInteracaoTexto] = useState("");
  const [salvandoInteracao, setSalvandoInteracao] = useState(false);

  useEffect(() => {
    if (lead) {
      setObservacoes(lead.observacoes || "");
      setCarregandoInteracoes(true);
      void leadsService.listarInteracoes(lead.id).then((lista) => {
        setInteracoes(lista);
        setCarregandoInteracoes(false);
      });
    }
  }, [lead]);

  if (!lead) return null;

  const salvarObservacoes = async () => {
    setSalvandoObs(true);
    await leadsService.atualizarLead(lead.id, { observacoes });
    setSalvandoObs(false);
    toast.success("Observações salvas!");
    onLeadAtualizado?.();
  };

  const registrarInteracaoRapida = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaInteracaoTexto.trim()) return;

    setSalvandoInteracao(true);
    const nova = await leadsService.registrarInteracao({
      lead_id: lead.id,
      tipo: "whatsapp",
      descricao: novaInteracaoTexto,
    });

    await auditoriaService.registrarAtividade({
      tipo: "interacao",
      titulo: `Anotação rápida: ${lead.nome}`,
      descricao: novaInteracaoTexto,
      lead_id: lead.id,
      lead_nome: lead.nome,
    });

    setInteracoes((prev) => [nova, ...prev]);
    setNovaInteracaoTexto("");
    setSalvandoInteracao(false);
    toast.success("Anotação registrada na linha do tempo!");
    onLeadAtualizado?.();
  };

  return (
    <Sheet open={aberto} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg bg-card/98 backdrop-blur-2xl border-l border-border p-0 flex flex-col justify-between overflow-hidden shadow-2xl"
      >
        {/* HEADER DO DRAWER */}
        <SheetHeader className="p-5 border-b border-border bg-surface/40 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground rotulo">
                {lead.categoria}
              </span>
              <BadgePriority score={lead.score} />
              <BadgeStatus status={lead.status} />
            </div>

            <Button
              size="sm"
              onClick={() => onAbordarWhatsApp(lead)}
              className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1 font-semibold shadow-xs"
            >
              <MessageSquare className="size-3" />
              WhatsApp
            </Button>
          </div>

          <SheetTitle className="text-lg font-bold text-foreground text-left mt-2">
            {lead.nome}
          </SheetTitle>

          <SheetDescription className="text-xs text-muted-foreground text-left flex items-center gap-1">
            <MapPin className="size-3 text-primary shrink-0" />
            <span className="truncate">
              {lead.endereco || `${lead.bairro ? `${lead.bairro}, ` : ""}${lead.cidade || "Brasil"}`}
            </span>
          </SheetDescription>
        </SheetHeader>

        {/* CORPO DO DRAWER COM SCROLL */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* ESTÁGIO NO FUNIL */}
          <div className="p-3 rounded-xl bg-surface/50 border border-border/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Estágio Comercial:</span>
              <Select
                value={lead.status}
                onValueChange={(val) => onStatusChange(lead.id, val as LeadItem["status"])}
              >
                <SelectTrigger className="h-7 text-xs w-32 bg-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="contatado">Contatado</SelectItem>
                  <SelectItem value="proposta">Proposta</SelectItem>
                  <SelectItem value="fechado">Fechado</SelectItem>
                  <SelectItem value="recusado">Recusado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* DADOS DE CONTATO & PRESENÇA DIGITAL */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider rotulo">
              Presença Digital & Contato
            </h4>

            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-surface/40 border border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-2 text-foreground font-mono">
                  <Phone className="size-3.5 text-primary" />
                  <span>{lead.telefone || "Telefone não informado"}</span>
                </div>
                {lead.telefone && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onAbordarWhatsApp(lead)}
                    className="h-6 text-[11px] text-emerald-400 p-1"
                  >
                    Abrir Chat
                  </Button>
                )}
              </div>

              {lead.instagram ? (
                <div className="p-2.5 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-between text-pink-400 font-mono">
                  <a
                    href={`https://instagram.com/${lead.instagram.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 hover:underline"
                  >
                    <Instagram className="size-3.5" />
                    <span>@{lead.instagram}</span>
                  </a>
                  <ExternalLink className="size-3 opacity-70" />
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-surface/30 border border-dashed border-border/70 text-muted-foreground text-[11px] flex items-center justify-between">
                  <span>Sem Instagram cadastrado</span>
                </div>
              )}

              <div className="p-2.5 rounded-lg bg-surface/40 border border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-2 text-foreground">
                  <Globe className="size-3.5 text-primary" />
                  <span>Website Oficial</span>
                </div>
                {!lead.tem_site ? (
                  <span className="text-[10px] font-semibold text-primary bg-primary/15 px-2 py-0.5 rounded border border-primary/25">
                    Sem site próprio
                  </span>
                ) : (
                  <a
                    href={lead.site_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                  >
                    <span>Acessar</span>
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </div>

              {lead.avaliacao_google && (
                <div className="p-2.5 rounded-lg bg-surface/40 border border-border/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="size-3.5 fill-amber-400" />
                    <span className="font-bold dado">{lead.avaliacao_google.toFixed(1)}</span>
                    <span className="text-muted-foreground text-[11px]">
                      ({lead.total_avaliacoes} avaliações no Google)
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground rotulo">Google Places</span>
                </div>
              )}
            </div>
          </div>

          {/* OBSERVAÇÕES COMERCIAIS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider rotulo">
                Observações do Lead
              </h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={salvarObservacoes}
                disabled={salvandoObs}
                className="h-6 text-[10px] gap-1 text-primary"
              >
                <Save className="size-2.5" />
                Salvar
              </Button>
            </div>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Anotações comerciais sobre perfil do tomador de decisão, objeções, etc..."
              className="text-xs min-h-[80px] bg-surface/50 resize-none"
            />
          </div>

          {/* HISTÓRICO RECENTE */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider rotulo flex items-center justify-between">
              <span>Histórico de Contatos</span>
              <span className="text-muted-foreground text-[10px] dado">
                {interacoes.length} registros
              </span>
            </h4>

            {/* Form de Anotação Rápida */}
            <form onSubmit={registrarInteracaoRapida} className="flex gap-1.5">
              <Textarea
                value={novaInteracaoTexto}
                onChange={(e) => setNovaInteracaoTexto(e.target.value)}
                placeholder="Registrar nota rápida de contato..."
                className="text-xs min-h-[50px] flex-1 bg-surface/50 resize-none"
              />
              <Button
                type="submit"
                size="sm"
                disabled={salvandoInteracao || !novaInteracaoTexto.trim()}
                className="h-auto px-3 bg-primary text-primary-foreground text-xs"
              >
                <Send className="size-3.5" />
              </Button>
            </form>

            <div className="space-y-2 pt-1">
              {interacoes.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg bg-surface/30 border border-border/50 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="font-mono uppercase font-bold text-foreground">
                      {item.tipo}
                    </span>
                    <span className="dado flex items-center gap-1">
                      <Clock className="size-2.5" />
                      {new Date(item.criado_em).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">{item.descricao}</p>
                </div>
              ))}

              {interacoes.length === 0 && !carregandoInteracoes && (
                <p className="text-xs text-muted-foreground py-2 text-center">
                  Nenhuma interação registrada ainda.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER DO DRAWER */}
        <div className="p-4 border-t border-border bg-surface/50 flex items-center justify-between gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8"
          >
            Fechar
          </Button>

          <Button
            asChild
            size="sm"
            className="text-xs h-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5"
          >
            <Link to="/leads/$id" params={{ id: lead.id }}>
              <span>Ver Perfil Completo</span>
              <ExternalLink className="size-3" />
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
