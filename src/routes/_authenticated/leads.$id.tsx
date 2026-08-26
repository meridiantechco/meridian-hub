import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/prospecta/AppShell";
import { BadgePrioridade } from "@/components/prospecta/BadgePrioridade";
import { BadgeStatus } from "@/components/prospecta/BadgeStatus";
import { ModalMensagemWhatsApp } from "@/components/prospecta/ModalMensagemWhatsApp";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prospectaService } from "@/lib/prospecta-service";
import { auditoriaService } from "@/lib/auditoria-service";
import { calcularScoreLead } from "@/lib/score";
import {
  sanitizarHandleInstagram,
  ehRedeSocialOuAgregador,
  gerarUrlBuscaInstagram,
  gerarHandleSugerido,
} from "@/lib/redes-sociais";
import type { InteracaoItem, LeadItem } from "@/lib/leads-mock";
import { useAuth } from "@/hooks/useAuth";
import {
  MapPin,
  Phone,
  Globe,
  AlertCircle,
  Instagram,
  Facebook,
  Star,
  MessageSquare,
  History,
  Send,
  ArrowLeft,
  Calendar,
  Save,
  CheckCircle,
  PhoneCall,
  Mail,
  UserCheck,
  Compass,
  Pencil,
  Plus,
  Search,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/leads/$id")({
  head: () => ({
    meta: [
      { title: "Detalhes do Lead — Prospecta" },
      { name: "description", content: "Ficha comercial detalhada do estabelecimento" },
    ],
  }),
  component: PaginaDetalheLead,
});

const ICONES_INTERACAO = {
  whatsapp: MessageSquare,
  ligacao: PhoneCall,
  email: Mail,
  visita: UserCheck,
  outro: History,
};

export function PaginaDetalheLead() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { ehAdmin } = useAuth();

  const [lead, setLead] = useState<LeadItem | null>(null);
  const [interacoes, setInteracoes] = useState<InteracaoItem[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Edição de observações
  const [observacoes, setObservacoes] = useState("");
  const [salvandoObs, setSalvandoObs] = useState(false);

  // Nova interação
  const [tipoInteracao, setTipoInteracao] = useState<
    "whatsapp" | "ligacao" | "email" | "visita" | "outro"
  >("whatsapp");
  const [descInteracao, setDescInteracao] = useState("");
  const [resInteracao, setResInteracao] = useState("");
  const [salvandoInteracao, setSalvandoInteracao] = useState(false);

  // Modais
  const [modalWhatsAppAberto, setModalWhatsAppAberto] = useState(false);
  const [modalEditarRedesAberto, setModalEditarRedesAberto] = useState(false);

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    const [leadObtido, listaInteracoes] = await Promise.all([
      prospectaService.obterLeadPorId(id),
      prospectaService.listarInteracoes(id),
    ]);

    if (!leadObtido) {
      toast.error("Lead não encontrado");
      void navigate({ to: "/leads" });
      return;
    }

    setLead(leadObtido);
    setObservacoes(leadObtido.observacoes || "");
    setInteracoes(listaInteracoes);
    setCarregando(false);
  }, [id, navigate]);

  useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  const salvarObservacoes = async () => {
    if (!lead) return;
    setSalvandoObs(true);
    await prospectaService.atualizarLead(lead.id, { observacoes });
    setSalvandoObs(false);
    toast.success("Observações salvas!");
  };

  const mudarStatus = async (novoStatus: LeadItem["status"]) => {
    if (!lead) return;
    await prospectaService.atualizarStatusLead(lead.id, novoStatus);
    setLead((prev) => (prev ? { ...prev, status: novoStatus } : null));

    await auditoriaService.registrarAtividade({
      tipo: "mudanca_status",
      titulo: `Status: ${lead.nome} -> ${novoStatus.toUpperCase()}`,
      descricao: `Status comercial de ${lead.nome} alterado para "${novoStatus.toUpperCase()}"`,
      lead_id: lead.id,
      lead_nome: lead.nome,
      metadados: {
        status_anterior: lead.status,
        novo_status: novoStatus,
      },
    });

    toast.success(`Status alterado para ${novoStatus}`);
  };

  const adicionarInteracao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !descInteracao.trim()) {
      toast.error("Preencha a descrição da interação.");
      return;
    }

    setSalvandoInteracao(true);
    const nova = await prospectaService.registrarInteracao({
      lead_id: lead.id,
      tipo: tipoInteracao,
      descricao: descInteracao,
      resultado: resInteracao || null,
    });

    await auditoriaService.registrarAtividade({
      tipo: "interacao",
      titulo: `Interação (${tipoInteracao}): ${lead.nome}`,
      descricao: `${descInteracao}${resInteracao ? ` · Resultado: ${resInteracao}` : ""}`,
      lead_id: lead.id,
      lead_nome: lead.nome,
      metadados: { tipo: tipoInteracao, resultado: resInteracao },
    });

    setInteracoes((prev) => [nova, ...prev]);
    setDescInteracao("");
    setResInteracao("");
    setSalvandoInteracao(false);
    toast.success("Interação registrada na linha do tempo!");
  };

  if (carregando || !lead) {
    return (
      <AppShell titulo="Carregando detalhes...">
        <div className="flex items-center justify-center p-12 text-muted-foreground text-sm">
          Carregando dados do estabelecimento...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      titulo={lead.nome}
      descricao={`${lead.categoria} · ${lead.bairro || lead.cidade || "Localização de campo"}`}
      acoes={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="h-8 gap-1.5 text-xs">
            <Link to="/leads">
              <ArrowLeft className="size-3.5" />
              Voltar
            </Link>
          </Button>
          <Button
            size="sm"
            onClick={() => setModalWhatsAppAberto(true)}
            className="h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <MessageSquare className="size-3.5" />
            Abordar no WhatsApp
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-w-6xl">
        {/* CABEÇALHO DO LEAD */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-elev">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {lead.categoria}
                </span>
                <BadgePrioridade score={lead.score} />
                <BadgeStatus status={lead.status} />
                {!lead.tem_site ? (
                  <span className="inline-flex items-center gap-1 rounded bg-[var(--color-alerta)]/15 px-2.5 py-0.5 text-xs font-semibold text-[var(--color-alerta)] border border-[var(--color-alerta)]/30">
                    <AlertCircle className="size-3.5" /> Sem site próprio
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
                    <Globe className="size-3.5" /> Possui site
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold font-display text-foreground">{lead.nome}</h2>

              <p className="text-xs text-muted-foreground dado">
                📍 {lead.endereco || "Endereço não informado"} ·{" "}
                {lead.bairro ? `${lead.bairro}, ` : ""}
                {lead.cidade}
                {lead.estado ? ` - ${lead.estado}` : ""}
              </p>
            </div>

            {/* Mudar Status Rápido */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-secondary/30 p-3 rounded-lg border border-border/70">
              <span className="text-xs text-muted-foreground">Alterar estágio:</span>
              <Select
                value={lead.status}
                onValueChange={(val) => mudarStatus(val as LeadItem["status"])}
              >
                <SelectTrigger className="h-8 w-36 text-xs bg-background">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COLUNA ESQUERDA: DADOS DO ESTABELECIMENTO */}
          <div className="space-y-6 lg:col-span-1">
            {/* Contatos e Redes Sociais */}
            <Card className="bg-card border-border shadow-elev">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">Presença & Contatos</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setModalEditarRedesAberto(true)}
                  className="h-6 text-[10px] px-2 text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="size-3 mr-1" /> Editar
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 text-xs dado">
                {/* Telefone & WhatsApp */}
                <div className="flex items-center justify-between p-2.5 rounded bg-secondary/40">
                  <div className="flex items-center gap-2 text-foreground">
                    <Phone className="size-3.5 text-primary" />
                    <span>{lead.telefone || "Telefone não informado"}</span>
                  </div>
                  {lead.telefone && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-[11px] text-emerald-400 hover:text-emerald-300 p-1 font-medium"
                      onClick={() => setModalWhatsAppAberto(true)}
                    >
                      WhatsApp
                    </Button>
                  )}
                </div>

                {/* Instagram */}
                {lead.instagram ? (
                  <div className="flex items-center justify-between p-2.5 rounded bg-pink-500/10 border border-pink-500/20">
                    <a
                      href={`https://instagram.com/${lead.instagram}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-colors font-mono"
                    >
                      <Instagram className="size-3.5" />
                      <span>@{lead.instagram}</span>
                      <ExternalLink className="size-2.5 opacity-70" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setModalEditarRedesAberto(true)}
                      className="text-[10px] text-pink-400/80 hover:text-pink-300"
                    >
                      Alterar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2.5 rounded bg-secondary/30 border border-dashed border-border/80">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <Instagram className="size-3.5 text-muted-foreground" />
                      Sem Instagram cadastrado
                    </span>
                    <div className="flex items-center gap-2">
                      <a
                        href={gerarUrlBuscaInstagram(lead.nome, lead.cidade || lead.bairro)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-pink-400 hover:text-pink-300 hover:underline flex items-center gap-0.5"
                      >
                        <Search className="size-2.5" /> Buscar @
                      </a>
                      <button
                        type="button"
                        onClick={() => setModalEditarRedesAberto(true)}
                        className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                      >
                        <Plus className="size-2.5" /> Inserir
                      </button>
                    </div>
                  </div>
                )}

                {/* Facebook */}
                {lead.facebook && (
                  <a
                    href={`https://facebook.com/${lead.facebook}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Facebook className="size-3.5" />
                    <span>fb.com/{lead.facebook}</span>
                    <ExternalLink className="size-2.5 opacity-70" />
                  </a>
                )}

                {/* Website Oficial */}
                {lead.site_url ? (
                  <a
                    href={lead.site_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2.5 rounded bg-secondary/40 text-muted-foreground hover:text-foreground transition-colors truncate border border-border/50"
                  >
                    <Globe className="size-3.5 text-primary shrink-0" />
                    <span className="truncate">{lead.site_url}</span>
                    <ExternalLink className="size-2.5 opacity-70 shrink-0 ml-auto" />
                  </a>
                ) : (
                  <div className="flex items-center justify-between p-2.5 rounded bg-[var(--color-alerta)]/5 border border-[var(--color-alerta)]/20 text-[11px] text-[var(--color-alerta)] font-medium">
                    <span className="flex items-center gap-1.5">
                      <AlertCircle className="size-3.5" />
                      Sem site próprio cadastrado
                    </span>
                    <button
                      type="button"
                      onClick={() => setModalEditarRedesAberto(true)}
                      className="text-[10px] text-primary hover:underline"
                    >
                      + Adicionar
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Avaliações do Google */}
            <Card className="bg-card border-border shadow-elev">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span>Google Places</span>
                  {lead.avaliacao_google && (
                    <span className="flex items-center gap-1 text-amber-400 dado">
                      <Star className="size-3.5 fill-amber-400" />
                      {lead.avaliacao_google.toFixed(1)}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground dado">
                <div className="flex justify-between border-b border-border/60 pb-1.5">
                  <span>Total de Avaliações:</span>
                  <strong className="text-foreground">{lead.total_avaliacoes} avaliações</strong>
                </div>
                <div className="flex justify-between border-b border-border/60 pb-1.5">
                  <span>Origem:</span>
                  <strong className="text-foreground uppercase">{lead.origem}</strong>
                </div>
                <div className="flex justify-between pb-1">
                  <span>Capturado em:</span>
                  <strong className="text-foreground">
                    {new Date(lead.criado_em).toLocaleDateString("pt-BR")}
                  </strong>
                </div>
              </CardContent>
            </Card>

            {/* Mini Mapa de Localização Cartográfica */}
            <Card className="bg-card border-border shadow-elev overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Compass className="size-4 text-primary" />
                  Coordenadas no Terreno
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-36 bg-[#11171A] malha-mapa relative flex items-center justify-center border-t border-border">
                  <div className="flex flex-col items-center gap-1 text-center p-3">
                    <div className="size-7 rounded-full bg-[var(--color-alerta)]/20 border border-[var(--color-alerta)] flex items-center justify-center text-[var(--color-alerta)] animate-pulse">
                      <MapPin className="size-4" />
                    </div>
                    <span className="text-[10px] rotulo text-muted-foreground">
                      Lat: {lead.latitude?.toFixed(4) ?? "-12.9714"} | Lng:{" "}
                      {lead.longitude?.toFixed(4) ?? "-38.5088"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* COLUNA DIREITA: OBSERVAÇÕES E LINHA DO TEMPO */}
          <div className="space-y-6 lg:col-span-2">
            {/* Observações Livres */}
            <Card className="bg-card border-border shadow-elev">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-sm font-semibold">Observações Comerciais</CardTitle>
                  <CardDescription className="text-xs">
                    Anotações sobre necessidades, objeções e perfil do decisor
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={salvarObservacoes}
                  disabled={salvandoObs}
                  className="h-7 text-xs gap-1"
                >
                  <Save className="size-3" />
                  Salvar
                </Button>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: Proprietário Roberto prefere ser contatado após às 15h. Tem grande interesse em cardápio digital..."
                  className="min-h-[90px] text-xs bg-background/60 leading-relaxed resize-none"
                />
              </CardContent>
            </Card>

            {/* Linha do Tempo de Interações */}
            <Card className="bg-card border-border shadow-elev">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <History className="size-4 text-primary" />
                  Histórico de Contatos ({interacoes.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  Registro cronológico de todas as interações realizadas pela equipe comercial
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* FORMULÁRIO DE NOVA INTERAÇÃO */}
                <form
                  onSubmit={adicionarInteracao}
                  className="p-3.5 rounded-lg border border-border bg-surface/50 space-y-3"
                >
                  <span className="text-xs font-semibold text-foreground block">
                    + Registrar Nova Interação
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="tipo" className="text-[11px]">
                        Tipo de Contato
                      </Label>
                      <Select
                        value={tipoInteracao}
                        onValueChange={(val) => setTipoInteracao(val as any)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="ligacao">Ligação</SelectItem>
                          <SelectItem value="email">E-mail</SelectItem>
                          <SelectItem value="visita">Visita Presencial</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <Label htmlFor="resultado" className="text-[11px]">
                        Resultado / Próximo Passo
                      </Label>
                      <Input
                        id="resultado"
                        value={resInteracao}
                        onChange={(e) => setResInteracao(e.target.value)}
                        placeholder="Ex: Pediu para retornar na sexta às 10h"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="desc" className="text-[11px]">
                      Resumo do que foi conversado
                    </Label>
                    <Textarea
                      id="desc"
                      value={descInteracao}
                      onChange={(e) => setDescInteracao(e.target.value)}
                      placeholder="Descreva os pontos principais da conversa..."
                      className="min-h-[60px] text-xs resize-none bg-background/70"
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      type="submit"
                      disabled={salvandoInteracao}
                      size="sm"
                      className="h-7 text-xs gap-1.5 bg-primary text-primary-foreground"
                    >
                      <Send className="size-3" />
                      Registrar Interação
                    </Button>
                  </div>
                </form>

                {/* LISTAGEM CRONOLÓGICA DAS INTERAÇÕES */}
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {interacoes.map((item) => {
                    const Icone = ICONES_INTERACAO[item.tipo] || History;
                    return (
                      <div key={item.id} className="relative group">
                        {/* Marcador do ponto na linha do tempo */}
                        <div className="absolute -left-6 top-1 size-5 rounded-full bg-secondary border border-border flex items-center justify-center text-primary group-hover:border-primary transition-colors">
                          <Icone className="size-3" />
                        </div>

                        <div className="rounded-lg border border-border bg-card p-3 space-y-1.5 shadow-sm">
                          <div className="flex items-center justify-between text-xs gap-2">
                            <span className="font-semibold text-foreground uppercase text-[10px] tracking-wider font-mono">
                              {item.tipo}
                            </span>
                            <span className="text-[10px] text-muted-foreground dado flex items-center gap-1">
                              <Calendar className="size-3" />
                              {new Date(item.criado_em).toLocaleString("pt-BR")}
                            </span>
                          </div>

                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {item.descricao}
                          </p>

                          {item.resultado && (
                            <div className="text-[11px] text-emerald-400 bg-emerald-500/10 p-1.5 rounded border border-emerald-500/20 font-medium">
                              🎯 {item.resultado}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {interacoes.length === 0 && (
                    <p className="text-xs text-muted-foreground py-4">
                      Nenhuma interação registrada ainda. Use o formulário acima para registrar
                      contatos.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de envio WhatsApp */}
      <ModalMensagemWhatsApp
        lead={lead}
        aberto={modalWhatsAppAberto}
        onOpenChange={setModalWhatsAppAberto}
        onMensagemEnviada={carregarDados}
      />

      {/* Modal de Edição de Redes Sociais */}
      {lead && (
        <ModalEditarRedesLead
          aberto={modalEditarRedesAberto}
          onOpenChange={setModalEditarRedesAberto}
          lead={lead}
          onSalvo={(atualizado) => setLead(atualizado)}
        />
      )}
    </AppShell>
  );
}

function ModalEditarRedesLead({
  aberto,
  onOpenChange,
  lead,
  onSalvo,
}: {
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  lead: LeadItem;
  onSalvo: (leadAtualizado: LeadItem) => void;
}) {
  const [instagram, setInstagram] = useState(lead.instagram || "");
  const [facebook, setFacebook] = useState(lead.facebook || "");
  const [siteUrl, setSiteUrl] = useState(lead.site_url || "");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setInstagram(lead.instagram || "");
    setFacebook(lead.facebook || "");
    setSiteUrl(lead.site_url || "");
  }, [lead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const instaLimpo = sanitizarHandleInstagram(instagram);
      const faceLimpo = facebook.trim() || null;
      const siteLimpo = siteUrl.trim() || null;
      const ehSocial = ehRedeSocialOuAgregador(siteLimpo);
      const tem_site = Boolean(siteLimpo && !ehSocial);

      const novoScore = calcularScoreLead({
        tem_site,
        instagram: instaLimpo,
        facebook: faceLimpo,
        total_avaliacoes: lead.total_avaliacoes,
        avaliacao_google: lead.avaliacao_google,
        criado_em: lead.criado_em,
      });

      const atualizado = await prospectaService.atualizarLead(lead.id, {
        instagram: instaLimpo,
        facebook: faceLimpo,
        site_url: tem_site ? siteLimpo : null,
        tem_site,
        score: novoScore,
      });

      if (atualizado) {
        await auditoriaService.registrarAtividade({
          tipo: "edicao_lead",
          titulo: `Redes sociais atualizadas: ${lead.nome}`,
          descricao: `Instagram (@${instaLimpo || "nenhum"}) e presença web atualizados. Novo score: ${novoScore}.`,
          metadados: { lead_id: lead.id, instagram: instaLimpo, score: novoScore },
        });

        onSalvo(atualizado);
        toast.success("Redes sociais salvas com sucesso!");
        onOpenChange(false);
      }
    } catch {
      toast.error("Erro ao salvar redes sociais.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base flex items-center gap-2">
            <Instagram className="size-4 text-pink-400" />
            Editar Presença Digital & Redes Sociais
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Atualize o perfil do Instagram, Facebook e Website oficial de{" "}
            <strong>{lead.nome}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Instagram */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="lead-insta"
                className="text-xs font-semibold text-foreground flex items-center gap-1.5"
              >
                <Instagram className="size-3.5 text-pink-400" />
                Perfil do Instagram
              </Label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInstagram(gerarHandleSugerido(lead.nome))}
                  className="text-[10px] text-primary hover:underline"
                >
                  Sugerir @
                </button>
                <a
                  href={gerarUrlBuscaInstagram(lead.nome, lead.cidade || lead.bairro)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-pink-400 hover:underline flex items-center gap-0.5"
                >
                  <Search className="size-2.5" /> Buscar no Google
                </a>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">@</span>
              <Input
                id="lead-insta"
                placeholder="ex: perfil_da_empresa"
                value={instagram.replace(/^@/, "")}
                onChange={(e) => setInstagram(e.target.value)}
                className="text-xs h-9 pl-7 bg-surface/50 font-mono"
              />
            </div>
          </div>

          {/* Facebook */}
          <div className="space-y-1.5">
            <Label
              htmlFor="lead-face"
              className="text-xs font-semibold text-foreground flex items-center gap-1.5"
            >
              <Facebook className="size-3.5 text-blue-400" />
              Página do Facebook (Opcional)
            </Label>
            <Input
              id="lead-face"
              placeholder="ex: pagina_da_empresa"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              className="text-xs h-9 bg-surface/50"
            />
          </div>

          {/* Website / Link */}
          <div className="space-y-1.5">
            <Label
              htmlFor="lead-site"
              className="text-xs font-semibold text-foreground flex items-center gap-1.5"
            >
              <Globe className="size-3.5 text-primary" />
              Website / Link na Bio
            </Label>
            <Input
              id="lead-site"
              placeholder="ex: https://linktr.ee/..."
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              className="text-xs h-9 bg-surface/50 font-mono text-[11px]"
            />
          </div>

          <DialogFooter className="pt-2 border-t border-border flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={salvando}
              className="bg-primary text-primary-foreground text-xs h-8 gap-1.5 font-semibold"
            >
              {salvando ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
