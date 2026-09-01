import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Phone,
  Instagram,
  Facebook,
  Globe,
  Star,
  MessageSquare,
  History,
  Calendar,
  Save,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowLeft,
  Mail,
  Plus,
  Send,
  Clock,
  Coins,
  MapPin,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import { BadgePriority, BadgeStatus, WhatsAppModal, leadsService, type InteracaoItem } from "@/features/leads";
import { companiesService } from "../services/companiesService";
import type { EmpresaItem, ResumoInteligencia } from "../types";

interface CompanyProfileViewProps {
  companyId: string;
}

export function CompanyProfileView({ companyId }: CompanyProfileViewProps) {
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState<EmpresaItem | null>(null);
  const [interacoes, setInteracoes] = useState<InteracaoItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [observacoes, setObservacoes] = useState("");
  const [salvandoObs, setSalvandoObs] = useState(false);

  // Nova Interação
  const [descInteracao, setDescInteracao] = useState("");
  const [tipoInteracao, setTipoInteracao] = useState<"whatsapp" | "ligacao" | "email" | "visita" | "outro">("whatsapp");
  const [salvandoInteracao, setSalvandoInteracao] = useState(false);

  // Modais
  const [modalWhatsAppAberto, setModalWhatsAppAberto] = useState(false);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const [emp, listaInt] = await Promise.all([
        companiesService.obterEmpresaPorId(companyId),
        leadsService.listarInteracoes(companyId),
      ]);

      if (!emp) {
        toast.error("Empresa não encontrada");
        void navigate({ to: "/companies" });
        return;
      }

      setEmpresa(emp);
      setObservacoes(emp.observacoes || "");
      setInteracoes(listaInt);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    void carregarDados();
  }, [companyId]);

  const resumoInteligencia: ResumoInteligencia | null = useMemo(() => {
    if (!empresa) return null;
    return companiesService.gerarResumoInteligencia(empresa);
  }, [empresa]);

  const salvarObservacoes = async () => {
    if (!empresa) return;
    setSalvandoObs(true);
    await leadsService.atualizarLead(empresa.id, { observacoes });
    setSalvandoObs(false);
    toast.success("Observações salvas!");
  };

  const mudarStatus = async (novoStatus: EmpresaItem["status"]) => {
    if (!empresa) return;
    await leadsService.atualizarStatusLead(empresa.id, novoStatus);
    setEmpresa((prev) => (prev ? { ...prev, status: novoStatus } : null));
    toast.success(`Status alterado para "${novoStatus}"`);
  };

  const registrarInteracao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa || !descInteracao.trim()) return;

    setSalvandoInteracao(true);
    const nova = await leadsService.registrarInteracao({
      lead_id: empresa.id,
      tipo: tipoInteracao,
      descricao: descInteracao,
    });

    setInteracoes((prev) => [nova, ...prev]);
    setDescInteracao("");
    setSalvandoInteracao(false);
    toast.success("Interação registrada na timeline!");
  };

  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  if (carregando || !empresa) {
    return (
      <AppShell titulo="Carregando Empresa...">
        <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
          Carregando perfil 360° da empresa...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      titulo={empresa.nome}
      descricao={`${empresa.categoria} · ${empresa.bairro || empresa.cidade || "Brasil"}`}
      acoes={
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" asChild className="h-8 gap-1.5 text-xs">
            <Link to="/companies">
              <ArrowLeft className="size-3.5" />
              <span>Voltar</span>
            </Link>
          </Button>

          <Button
            size="sm"
            onClick={() => setModalWhatsAppAberto(true)}
            className="h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-xs"
          >
            <MessageSquare className="size-3.5" />
            <span>Abordar no WhatsApp</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-w-6xl">
        {/* HEADER DO PERFIL 360° */}
        <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border/80 shadow-elev space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground rotulo">
                  {empresa.categoria}
                </span>
                <BadgePriority score={empresa.score} />
                <BadgeStatus status={empresa.status} />
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Potencial: {formatarMoeda(empresa.valor_potencial || 2000)}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold font-display text-foreground">
                {empresa.nome}
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 dado">
                <MapPin className="size-3.5 text-primary shrink-0" />
                <span>
                  {empresa.endereco || `${empresa.bairro ? `${empresa.bairro}, ` : ""}${empresa.cidade || "Brasil"}`}
                </span>
              </p>
            </div>

            {/* SELETOR DE STATUS COMERCIAL */}
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface/50 border border-border/70 shrink-0">
              <span className="text-xs text-muted-foreground">Estágio:</span>
              <Select
                value={empresa.status}
                onValueChange={(val) => mudarStatus(val as EmpresaItem["status"])}
              >
                <SelectTrigger className="h-8 w-36 text-xs bg-card border-border">
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

        {/* ABAS DO PERFIL 360° */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-surface/80 p-1 flex flex-wrap h-auto gap-1 border border-border/70 rounded-xl">
            <TabsTrigger value="overview" className="text-xs font-semibold gap-1.5">
              <Building2 className="size-3.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="inteligencia" className="text-xs font-semibold gap-1.5">
              <Sparkles className="size-3.5 text-primary" />
              Inteligência & Insights
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs font-semibold gap-1.5">
              <History className="size-3.5" />
              Timeline & Contatos ({interacoes.length})
            </TabsTrigger>
            <TabsTrigger value="notas" className="text-xs font-semibold gap-1.5">
              <Save className="size-3.5" />
              Notas Comerciais
            </TabsTrigger>
          </TabsList>

          {/* ABA 1: OVERVIEW */}
          <TabsContent value="overview" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <Card className="bg-card border-border/80 shadow-elev space-y-3 p-4">
                <CardHeader className="p-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Canais de Contato & Presença
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-surface/50 border border-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-foreground">
                      <Phone className="size-3.5 text-primary" />
                      <span>{empresa.telefone || "Telefone não informado"}</span>
                    </div>
                    {empresa.telefone && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setModalWhatsAppAberto(true)}
                        className="h-6 text-[10px] text-emerald-400 p-1"
                      >
                        Abrir WhatsApp
                      </Button>
                    )}
                  </div>

                  {empresa.instagram ? (
                    <a
                      href={`https://instagram.com/${empresa.instagram.replace(/^@/, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 font-mono flex items-center justify-between hover:underline"
                    >
                      <span className="flex items-center gap-2">
                        <Instagram className="size-3.5" />
                        <span>@{empresa.instagram}</span>
                      </span>
                    </a>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-surface/30 border border-dashed border-border/70 text-muted-foreground text-[11px]">
                      Sem Instagram cadastrado
                    </div>
                  )}

                  <div className="p-2.5 rounded-lg bg-surface/50 border border-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-foreground">
                      <Globe className="size-3.5 text-primary" />
                      <span>Website Oficial</span>
                    </div>
                    {!empresa.tem_site ? (
                      <span className="text-[10px] font-semibold text-primary bg-primary/15 px-2 py-0.5 rounded border border-primary/25">
                        Sem site próprio
                      </span>
                    ) : (
                      <a
                        href={empresa.site_url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary"
                      >
                        Acessar Site
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/80 shadow-elev space-y-3 p-4">
                <CardHeader className="p-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Google Places & Reputação
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-2 text-xs text-muted-foreground dado">
                  <div className="flex justify-between border-b border-border/50 pb-1.5">
                    <span>Avaliação Média:</span>
                    <strong className="text-amber-400 font-bold flex items-center gap-1">
                      <Star className="size-3 fill-amber-400" />
                      {empresa.avaliacao_google?.toFixed(1) || "N/A"}
                    </strong>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1.5">
                    <span>Total de Avaliações:</span>
                    <strong className="text-foreground">{empresa.total_avaliacoes} avaliações</strong>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1.5">
                    <span>Origem da Captura:</span>
                    <strong className="text-foreground uppercase">{empresa.origem}</strong>
                  </div>
                  <div className="flex justify-between pt-0.5">
                    <span>Mapeado em:</span>
                    <strong className="text-foreground">
                      {new Date(empresa.criado_em).toLocaleDateString("pt-BR")}
                    </strong>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/80 shadow-elev overflow-hidden p-0">
                <div className="p-3 border-b border-border/60 bg-surface/30">
                  <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Compass className="size-3.5 text-primary" />
                    Geolocalização
                  </h4>
                </div>
                <div className="h-32 bg-[#101318] flex items-center justify-center p-4 text-center">
                  <div className="space-y-1">
                    <div className="size-7 rounded-full bg-primary/20 text-primary border border-primary/40 flex items-center justify-center mx-auto animate-pulse">
                      <MapPin className="size-3.5" />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      Lat: {empresa.latitude?.toFixed(4) ?? "-12.9714"} | Lng: {empresa.longitude?.toFixed(4) ?? "-38.5088"}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* ABA 2: INTELIGÊNCIA */}
          <TabsContent value="inteligencia" className="space-y-4 pt-4">
            {resumoInteligencia && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card className="bg-card border-border/80 shadow-elev p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                      <Sparkles className="size-4" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground font-display">
                      Diagnóstico Comercial Automatizado
                    </h3>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {resumoInteligencia.sumario}
                  </p>

                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 space-y-1">
                    <span className="text-[10.5px] font-bold text-primary block rotulo">
                      Recomendação Estratégica:
                    </span>
                    <p className="text-xs font-semibold text-foreground">
                      {resumoInteligencia.recomendacaoAcao}
                    </p>
                  </div>
                </Card>

                <Card className="bg-card border-border/80 shadow-elev p-5 space-y-4">
                  <h3 className="text-sm font-bold text-foreground">Fatores de Análise</h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[10.5px] font-bold text-emerald-400 block rotulo mb-1.5">
                        Pontos Favoráveis para Fechamento:
                      </span>
                      <ul className="space-y-1">
                        {resumoInteligencia.pontosFortes.map((pf, i) => (
                          <li key={i} className="flex items-center gap-1.5 text-foreground">
                            <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
                            <span>{pf}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {resumoInteligencia.riscos.length > 0 && (
                      <div className="pt-2 border-t border-border/50">
                        <span className="text-[10.5px] font-bold text-amber-400 block rotulo mb-1.5">
                          Atenção & Objeções Prováveis:
                        </span>
                        <ul className="space-y-1">
                          {resumoInteligencia.riscos.map((r, i) => (
                            <li key={i} className="flex items-center gap-1.5 text-muted-foreground">
                              <AlertTriangle className="size-3 text-amber-400 shrink-0" />
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* ABA 3: TIMELINE & INTERAÇÕES */}
          <TabsContent value="timeline" className="space-y-4 pt-4">
            <Card className="bg-card border-border/80 shadow-elev p-5 space-y-5">
              <form onSubmit={registrarInteracao} className="p-3.5 rounded-xl bg-surface/50 border border-border/70 space-y-3">
                <span className="text-xs font-bold text-foreground block">
                  + Registrar Nova Interação / Contato
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <Select value={tipoInteracao} onValueChange={(val) => setTipoInteracao(val as any)}>
                    <SelectTrigger className="h-8 text-xs bg-card border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="ligacao">Ligação Telefônica</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="visita">Reunião Presencial</SelectItem>
                      <SelectItem value="outro">Anotação Geral</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="sm:col-span-3 flex gap-2">
                    <Textarea
                      value={descInteracao}
                      onChange={(e) => setDescInteracao(e.target.value)}
                      placeholder="Descreva o que foi conversado ou o próximo passo..."
                      className="text-xs min-h-[40px] flex-1 bg-card resize-none"
                      required
                    />
                    <Button
                      type="submit"
                      disabled={salvandoInteracao || !descInteracao.trim()}
                      className="h-auto bg-primary text-primary-foreground text-xs px-4"
                    >
                      <Send className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </form>

              {/* TIMELINE DE EVENTOS */}
              <div className="space-y-3 pt-2">
                {interacoes.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-surface/40 border border-border/60 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="font-mono font-bold text-foreground uppercase">
                        {item.tipo}
                      </span>
                      <span className="dado flex items-center gap-1">
                        <Clock className="size-2.5" />
                        {new Date(item.criado_em).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">{item.descricao}</p>
                  </div>
                ))}

                {interacoes.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground py-6">
                    Nenhuma interação registrada ainda.
                  </p>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* ABA 4: NOTAS */}
          <TabsContent value="notas" className="space-y-4 pt-4">
            <Card className="bg-card border-border/80 shadow-elev p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Observações Comerciais da Conta</h3>
                  <p className="text-xs text-muted-foreground">
                    Anotações sobre necessidades, objeções e tomadores de decisão
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={salvarObservacoes}
                  disabled={salvandoObs}
                  className="h-7 text-xs gap-1 bg-primary text-primary-foreground font-semibold"
                >
                  <Save className="size-3" />
                  Salvar Notas
                </Button>
              </div>

              <Textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Insira detalhes sobre o perfil do cliente, preferências de horário, objeções, etc..."
                className="min-h-[140px] text-xs bg-surface/50 leading-relaxed"
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* WHATSAPP MODAL */}
      <WhatsAppModal
        lead={empresa}
        aberto={modalWhatsAppAberto}
        onOpenChange={setModalWhatsAppAberto}
        onMensagemEnviada={carregarDados}
      />
    </AppShell>
  );
}
