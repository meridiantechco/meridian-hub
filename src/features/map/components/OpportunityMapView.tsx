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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  MapPin,
  Search,
  Filter,
  Layers,
  Sparkles,
  Building2,
  Phone,
  MessageSquare,
  Globe,
  ArrowRight,
  TrendingUp,
  Coins,
  RefreshCw,
} from "lucide-react";
import { prospectaService, WhatsAppModal, LeadDrawer, type LeadItem } from "@/features/leads";
import { mapService } from "../services/mapService";
import { OpportunityMap } from "./OpportunityMap";
import type { PontoMapa, ResumoRegiaoMapa } from "../types";

export function OpportunityMapView() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroPresenca, setFiltroPresenca] = useState("todas");
  const [pontoSelecionado, setPontoSelecionado] = useState<PontoMapa | null>(null);

  // Modais
  const [leadParaWhatsApp, setLeadParaWhatsApp] = useState<LeadItem | null>(null);
  const [modalWhatsAppAberto, setModalWhatsAppAberto] = useState(false);

  const [leadDrawer, setLeadDrawer] = useState<LeadItem | null>(null);
  const [drawerAberto, setDrawerAberto] = useState(false);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const lista = await prospectaService.listarLeads();
      setLeads(lista);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    void carregarDados();
  }, []);

  const todosPontos = useMemo(() => {
    return mapService.processarPontosMapa(leads);
  }, [leads]);

  const categoriasDisponiveis = useMemo(() => {
    const s = new Set<string>();
    leads.forEach((l) => {
      if (l.categoria) s.add(l.categoria);
    });
    return Array.from(s).sort();
  }, [leads]);

  const pontosFiltrados = useMemo(() => {
    return todosPontos.filter((p) => {
      if (filtroCategoria !== "todas" && p.lead.categoria !== filtroCategoria) {
        return false;
      }
      if (filtroPresenca === "sem_site" && p.lead.tem_site) {
        return false;
      }
      if (filtroPresenca === "com_site" && !p.lead.tem_site) {
        return false;
      }
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const nome = p.lead.nome.toLowerCase();
        const local = (p.lead.bairro || p.lead.cidade || "").toLowerCase();
        if (!nome.includes(termo) && !local.includes(termo)) {
          return false;
        }
      }
      return true;
    });
  }, [todosPontos, filtroCategoria, filtroPresenca, busca]);

  const resumoRegiao: ResumoRegiaoMapa = useMemo(() => {
    return mapService.calcularResumoRegiao(pontosFiltrados, "Salvador & RMS");
  }, [pontosFiltrados]);

  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <AppShell
      titulo="Mapa de Oportunidades Geolocalizadas"
      descricao="Varredura espacial, clustering de densidade e priorização geográfica de contas comerciais"
      acoes={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={carregarDados}
            disabled={carregando}
            className="h-8 text-xs gap-1.5 border-border/80"
          >
            <RefreshCw className={`size-3.5 ${carregando ? "animate-spin text-primary" : ""}`} />
            <span>Atualizar Mapa</span>
          </Button>

          <Button
            asChild
            size="sm"
            className="h-8 text-xs bg-primary text-primary-foreground font-semibold gap-1.5 shadow-xs"
          >
            <Link to="/nova-busca">
              <Sparkles className="size-3.5" />
              <span>Nova Varredura</span>
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-4 max-w-full">
        {/* BARRA DE FILTROS DO MAPA */}
        <Card className="bg-card border-border/80 shadow-elev">
          <CardContent className="p-3.5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar empresa ou bairro..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-8 text-xs h-8.5 bg-surface/50"
                />
              </div>

              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger className="text-xs h-8.5 bg-surface/50">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as categorias</SelectItem>
                  {categoriasDisponiveis.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filtroPresenca} onValueChange={setFiltroPresenca}>
                <SelectTrigger className="text-xs h-8.5 bg-surface/50">
                  <SelectValue placeholder="Presença Digital" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as empresas</SelectItem>
                  <SelectItem value="sem_site">⚡ Apenas Sem Site (Oportunidades)</SelectItem>
                  <SelectItem value="com_site">🌐 Apenas Com Site</SelectItem>
                </SelectContent>
              </Select>

              {/* LEGENDA RÁPIDA */}
              <div className="flex items-center justify-end gap-3 text-[11px] text-muted-foreground font-medium pr-1">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-purple-500 shadow-[0_0_6px_#a855f7]" />
                  Alta
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                  Qualificado
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]" />
                  Atenção
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LAYOUT DE MAPA EM TELA CHEIA (MAPA + PAINEL LATERAL DE INTELIGÊNCIA) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[640px]">
          {/* ÁREA DO MAPA (COL-8) */}
          <div className="lg:col-span-8 flex flex-col min-h-[500px]">
            <OpportunityMap
              pontos={pontosFiltrados}
              pontoSelecionado={pontoSelecionado}
              onSelecionarPonto={(p) => setPontoSelecionado(p)}
            />
          </div>

          {/* PAINEL LATERAL DE INTELIGÊNCIA REGIONAL (COL-4) */}
          <div className="lg:col-span-4 flex flex-col space-y-4">
            {/* CARD RESUMO DA REGIÃO */}
            <Card className="bg-card border-border/80 shadow-elev p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <div>
                  <span className="rotulo text-[10px] text-primary font-bold">
                    Inteligência Cartográfica
                  </span>
                  <h3 className="font-bold text-sm text-foreground font-display">
                    {resumoRegiao.cidade}
                  </h3>
                </div>
                <div className="size-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                  <MapPin className="size-4" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs dado">
                <div className="p-2 rounded-lg bg-surface/50 border border-border/60">
                  <span className="text-[10px] text-muted-foreground block rotulo">Total Mapeado</span>
                  <strong className="text-foreground text-sm font-display">
                    {resumoRegiao.totalEmpresas} contas
                  </strong>
                </div>

                <div className="p-2 rounded-lg bg-surface/50 border border-border/60">
                  <span className="text-[10px] text-primary block rotulo font-bold">Oportunidades</span>
                  <strong className="text-primary text-sm font-display">
                    {resumoRegiao.totalOportunidades} quentes
                  </strong>
                </div>

                <div className="p-2 rounded-lg bg-surface/50 border border-border/60">
                  <span className="text-[10px] text-muted-foreground block rotulo">Score Médio</span>
                  <strong className="text-amber-400 text-sm font-display">
                    {resumoRegiao.scoreMedio} pts
                  </strong>
                </div>

                <div className="p-2 rounded-lg bg-surface/50 border border-border/60">
                  <span className="text-[10px] text-muted-foreground block rotulo">Carência Web</span>
                  <strong className="text-emerald-400 text-sm font-display">
                    {resumoRegiao.semSitePercentual}% sem site
                  </strong>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Potencial Total Estimado:</span>
                <span className="font-bold font-display text-emerald-400">
                  {formatarMoeda(resumoRegiao.potencialEstimadoTotal)}
                </span>
              </div>
            </Card>

            {/* CARD EMPRESA SELECIONADA OU LISTA RECENTE */}
            {pontoSelecionado ? (
              <Card className="bg-card border-primary/40 shadow-elev p-4 space-y-3 ring-1 ring-primary/25">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase rotulo">
                      {pontoSelecionado.lead.categoria}
                    </span>
                    <h4 className="font-bold text-sm text-foreground">
                      {pontoSelecionado.lead.nome}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      📍 {pontoSelecionado.lead.bairro || pontoSelecionado.lead.cidade || "Brasil"}
                    </p>
                  </div>

                  <span className="text-xs font-mono font-bold text-primary bg-primary/15 px-2 py-0.5 rounded border border-primary/30">
                    Score {pontoSelecionado.score}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-surface/50 border border-border/60 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Presença Digital:</span>
                    <strong className={!pontoSelecionado.lead.tem_site ? "text-primary" : "text-foreground"}>
                      {!pontoSelecionado.lead.tem_site ? "Sem site oficial" : "Possui site"}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Potencial Estimado:</span>
                    <strong className="text-emerald-400 font-display">
                      {formatarMoeda(pontoSelecionado.potencialValor)}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={() => {
                      setLeadParaWhatsApp(pontoSelecionado.lead);
                      setModalWhatsAppAberto(true);
                    }}
                    className="flex-1 h-8 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold gap-1.5 shadow-xs"
                  >
                    <MessageSquare className="size-3.5" />
                    WhatsApp
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    className="h-8 px-3 text-xs border-border/80 hover:border-primary/40 text-foreground"
                  >
                    <Link to="/companies/$id" params={{ id: pontoSelecionado.lead.id }}>
                      <span>Ver Perfil</span>
                      <ArrowRight className="size-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="bg-card border-border/80 shadow-elev p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider rotulo mb-2">
                    Oportunidades em Destaque na Região
                  </h4>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {pontosFiltrados.slice(0, 6).map((p) => (
                      <div
                        key={p.lead.id}
                        onClick={() => setPontoSelecionado(p)}
                        className="p-2 rounded-lg bg-surface/40 border border-border/60 hover:border-primary/50 cursor-pointer transition-colors flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground truncate">{p.lead.nome}</p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {p.lead.categoria} · {p.lead.bairro || "Salvador"}
                          </p>
                        </div>
                        <span className="font-mono font-bold text-xs text-primary ml-2">
                          {p.score} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground text-center pt-2">
                  Clique em qualquer marcador no mapa para ver a ficha completa.
                </p>
              </Card>
            )}
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
    </AppShell>
  );
}
