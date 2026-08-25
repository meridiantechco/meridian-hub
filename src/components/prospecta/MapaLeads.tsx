import { useState, useMemo, useEffect, useRef } from "react";
import type { LeadItem } from "@/lib/leads-mock";
import { BadgePrioridade } from "./BadgePrioridade";
import { BadgeStatus } from "./BadgeStatus";
import { Button } from "@/components/ui/button";
import { ModalMensagemWhatsApp } from "./ModalMensagemWhatsApp";
import { calcularDistanciaKm, formatarDistancia } from "@/lib/geo";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Compass,
  MapPin,
  Globe,
  AlertCircle,
  MessageSquare,
  ExternalLink,
  Star,
  Radar,
  Crosshair,
  Sparkles,
  Flame,
  Layers,
  Zap,
  Target,
  Maximize2,
} from "lucide-react";

interface MapaLeadsProps {
  leads: LeadItem[];
  aoSelecionarLead?: (lead: LeadItem) => void;
}

export function MapaLeads({ leads, aoSelecionarLead }: MapaLeadsProps) {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const radarCircleRef = useRef<any>(null);
  const radarPulseCircleRef = useRef<any>(null);
  const centerMarkerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const leafletModuleRef = useRef<any>(null);

  const [mapaPronto, setMapaPronto] = useState(false);

  // Centro do radar (Padrão: Salvador - BA)
  const [centroRadar, setCentroRadar] = useState<{ lat: number; lng: number }>({
    lat: -12.9785,
    lng: -38.4552,
  });

  // Raio em KM
  const [raioKm, setRaioKm] = useState<number>(10);
  const [filtroSemSite, setFiltroSemSite] = useState<boolean | null>(null);
  const [leadAtivo, setLeadAtivo] = useState<LeadItem | null>(null);

  // Modal WhatsApp
  const [modalWhatsAppAberto, setModalWhatsAppAberto] = useState(false);
  const [leadParaWhatsApp, setLeadParaWhatsApp] = useState<LeadItem | null>(null);

  // Calcular distância de cada lead em relação ao centro do radar
  const leadsComDistancia = useMemo(() => {
    return leads.map((lead) => {
      const lat = lead.latitude ?? -12.9785;
      const lng = lead.longitude ?? -38.4552;
      const distancia = calcularDistanciaKm(centroRadar.lat, centroRadar.lng, lat, lng);
      const dentroDoRaio = distancia <= raioKm;

      return {
        ...lead,
        distancia,
        dentroDoRaio,
      };
    });
  }, [leads, centroRadar, raioKm]);

  // Filtragem conforme "Sem site"
  const leadsFiltrados = useMemo(() => {
    return leadsComDistancia.filter((l) => {
      if (filtroSemSite !== null && l.tem_site === filtroSemSite) return false;
      return true;
    });
  }, [leadsComDistancia, filtroSemSite]);

  // Leads dentro do raio ordenados por Score de prioridade
  const leadsNoRaio = useMemo(() => {
    return leadsFiltrados
      .filter((l) => l.dentroDoRaio)
      .sort((a, b) => b.score - a.score);
  }, [leadsFiltrados]);

  const semSiteNoRaio = leadsNoRaio.filter((l) => !l.tem_site).length;

  // 1. Inicializar Leaflet dinamicamente apenas no Browser (SSR-safe)
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let ativo = true;

    void (async () => {
      try {
        if (!document.getElementById("leaflet-css")) {
          const link = document.createElement("link");
          link.id = "leaflet-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        const leaflet = await import("leaflet");
        const L = leaflet.default || leaflet;
        leafletModuleRef.current = L;

        if (!ativo || !mapContainerRef.current) return;

        if (!mapInstanceRef.current) {
          const map = L.map(mapContainerRef.current, {
            center: [centroRadar.lat, centroRadar.lng],
            zoom: 12,
            zoomControl: false,
            attributionControl: false,
          });

          // Camada Cartográfica Dark Matter de Alta Definição
          L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
            maxZoom: 19,
            subdomains: "abcd",
          }).addTo(map);

          L.control.zoom({ position: "topright" }).addTo(map);

          const markersLayer = L.layerGroup().addTo(map);
          markersLayerRef.current = markersLayer;

          map.on("moveend", () => {
            const center = map.getCenter();
            setCentroRadar({
              lat: Number(center.lat.toFixed(4)),
              lng: Number(center.lng.toFixed(4)),
            });
          });

          map.on("click", (e: any) => {
            map.panTo(e.latlng);
            setCentroRadar({
              lat: Number(e.latlng.lat.toFixed(4)),
              lng: Number(e.latlng.lng.toFixed(4)),
            });
          });

          mapInstanceRef.current = map;
          setMapaPronto(true);
        }
      } catch (err) {
        console.error("Erro ao inicializar mapa Leaflet:", err);
      }
    })();

    return () => {
      ativo = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Atualizar Círculo do Radar com Efeito Sonar e Retículo Tático
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = leafletModuleRef.current;
    if (!map || !L || !mapaPronto) return;

    const centerLatLng = [centroRadar.lat, centroRadar.lng];
    const raioMetros = raioKm * 1000;

    // Círculo Principal com Borda Neon e Gradiente
    if (radarCircleRef.current) {
      radarCircleRef.current.setLatLng(centerLatLng);
      radarCircleRef.current.setRadius(raioMetros);
    } else {
      radarCircleRef.current = L.circle(centerLatLng, {
        radius: raioMetros,
        color: "#FF6B35",
        weight: 2,
        dashArray: "6, 8",
        fillColor: "#FF6B35",
        fillOpacity: 0.09,
      }).addTo(map);
    }

    // Círculo de Pulso Interno
    if (radarPulseCircleRef.current) {
      radarPulseCircleRef.current.setLatLng(centerLatLng);
      radarPulseCircleRef.current.setRadius(raioMetros * 0.4);
    } else {
      radarPulseCircleRef.current = L.circle(centerLatLng, {
        radius: raioMetros * 0.4,
        color: "#FF6B35",
        weight: 1,
        dashArray: "3, 6",
        fillColor: "#FF6B35",
        fillOpacity: 0.04,
      }).addTo(map);
    }

    // Retículo Tático Central com Anel de Satélite
    const miraIcon = L.divIcon({
      className: "mira-radar-center",
      html: `
        <div class="relative flex items-center justify-center size-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div class="absolute size-10 rounded-full border border-[var(--color-alerta)]/40 animate-ping"></div>
          <div class="absolute size-6 rounded-full border border-dashed border-[var(--color-alerta)]/80"></div>
          <div class="size-4 rounded-full bg-[var(--color-alerta)]/40 border-2 border-[var(--color-alerta)] flex items-center justify-center shadow-[0_0_12px_#FF6B35]">
            <div class="size-1.5 rounded-full bg-white animate-pulse"></div>
          </div>
        </div>
      `,
      iconSize: [0, 0],
    });

    if (centerMarkerRef.current) {
      centerMarkerRef.current.setLatLng(centerLatLng);
    } else {
      centerMarkerRef.current = L.marker(centerLatLng, {
        icon: miraIcon,
        interactive: false,
      }).addTo(map);
    }
  }, [centroRadar, raioKm, mapaPronto]);

  // 3. Atualizar Marcadores Estilizados no Mapa com Efeito Cristal
  useEffect(() => {
    const markersLayer = markersLayerRef.current;
    const L = leafletModuleRef.current;
    if (!markersLayer || !L || !mapaPronto) return;

    markersLayer.clearLayers();

    leadsFiltrados.forEach((lead) => {
      if (lead.latitude == null || lead.longitude == null) return;

      const semSite = !lead.tem_site;
      const dentro = lead.dentroDoRaio;

      const corFundo = semSite
        ? "linear-gradient(135deg, rgba(255, 107, 53, 0.4), rgba(255, 140, 66, 0.2))"
        : "linear-gradient(135deg, rgba(62, 207, 142, 0.35), rgba(46, 157, 108, 0.15))";
      const corBorda = semSite ? "#FF6B35" : "#3ECF8E";
      const corTexto = semSite ? "#FF8C42" : "#3ECF8E";
      const glowSombra = semSite ? "0 0 16px rgba(255, 107, 53, 0.55)" : "0 0 12px rgba(62, 207, 142, 0.35)";
      const opacidade = dentro ? "1" : "0.30";

      const pinHtml = `
        <div class="group relative cursor-pointer -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 hover:scale-130" style="opacity: ${opacidade};">
          ${
            semSite && dentro
              ? '<span class="absolute -inset-2 rounded-full bg-[#FF6B35]/35 animate-ping"></span>'
              : ""
          }
          <div style="background: ${corFundo}; border: 2px solid ${corBorda}; color: ${corTexto}; box-shadow: ${glowSombra};" class="relative flex size-8 items-center justify-center rounded-full backdrop-blur-md transition-all group-hover:ring-4 group-hover:ring-primary/40">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div class="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover:flex items-center gap-1.5 rounded-md bg-[#161D21]/95 border border-[#2B363B] px-2 py-1 shadow-2xl backdrop-blur-md whitespace-nowrap z-50 animate-in fade-in">
            <span class="text-[11px] font-semibold text-[#EDF1F2]">${lead.nome}</span>
            <span class="text-[10px] font-mono text-amber-400 font-bold">(${lead.score} pts)</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-lead-pin",
        html: pinHtml,
        iconSize: [0, 0],
      });

      const marker = L.marker([lead.latitude, lead.longitude], {
        icon: customIcon,
      });

      marker.on("click", () => {
        setLeadAtivo(lead);
        aoSelecionarLead?.(lead);
      });

      markersLayer.addLayer(marker);
    });
  }, [leadsFiltrados, aoSelecionarLead, mapaPronto]);

  // Centralizar na localização atual do usuário
  const obterMinhaLocalizacao = () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCentroRadar({ lat, lng });
          mapInstanceRef.current?.setView([lat, lng], 13);
          toast.success("Radar tático centralizado na sua localização atual!");
        },
        () => {
          toast.error("Não foi possível obter sua localização geográfica.");
        }
      );
    }
  };

  const executarVarreduraNoPonto = () => {
    toast.info("Iniciando varredura tática nas coordenadas selecionadas...");
    void navigate({ to: "/nova-busca" });
  };

  return (
    <div className="flex flex-col rounded-2xl border border-border/80 bg-card overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.4)] ring-1 ring-white/5">
      {/* BARRA SUPERIOR DE CONTROLE DO RADAR (ESTILO COCKPIT) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-surface/90 px-4 py-3 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <div className="relative flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 text-primary border border-primary/30 shadow-[0_0_15px_rgba(255,107,53,0.2)]">
            <Radar className="size-5 animate-spin" style={{ animationDuration: "12s" }} />
            <span className="absolute top-1 right-1 size-2 rounded-full bg-[var(--color-alerta)] animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground tracking-tight">
                Radar Tático Geográfico
              </h3>
              <span className="text-[10px] font-mono uppercase font-semibold text-[var(--color-alerta)] bg-[var(--color-alerta)]/15 px-2 py-0.5 rounded-full border border-[var(--color-alerta)]/30">
                Raio de {raioKm} km
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground dado flex items-center gap-1.5">
              <span>N {centroRadar.lat.toFixed(4)}° / W {centroRadar.lng.toFixed(4)}°</span>
              <span className="text-border">·</span>
              <span className="text-muted-foreground/80">Arraste para mover o sonar</span>
            </p>
          </div>
        </div>

        {/* CONTROLES TÁTICOS */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Seletor de Raio */}
          <div className="flex items-center gap-1 bg-secondary/70 p-1 rounded-lg border border-border/70 backdrop-blur">
            <span className="text-[9px] uppercase font-mono text-muted-foreground px-1.5 font-bold">
              Alcance:
            </span>
            {[2, 5, 10, 15, 25].map((km) => (
              <button
                key={km}
                type="button"
                onClick={() => setRaioKm(km)}
                className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold transition-all ${
                  raioKm === km
                    ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(255,107,53,0.4)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface/80"
                }`}
              >
                {km}k
              </button>
            ))}
          </div>

          <Button
            variant={filtroSemSite === true ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltroSemSite(filtroSemSite === true ? null : true)}
            className="h-8 text-xs px-3 gap-1.5 border-border text-[var(--color-alerta)] hover:text-[var(--color-alerta)] hover:bg-[var(--color-alerta)]/10 font-medium"
          >
            <Zap className="size-3 text-[var(--color-alerta)] fill-[var(--color-alerta)]" />
            Sem Site ({semSiteNoRaio})
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={obterMinhaLocalizacao}
            className="h-8 text-xs px-2.5 gap-1 border-border/80 hover:border-primary/40 hover:bg-primary/5"
            title="Localização GPS"
          >
            <Crosshair className="size-3.5 text-primary" />
            <span className="hidden sm:inline">Meu GPS</span>
          </Button>
        </div>
      </div>

      {/* ÁREA PRINCIPAL: MAPA CARTOGRÁFICO + PAINEL DE OPORTUNIDADES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[480px]">
        {/* MAPA INTERATIVO LEAFLET COM ESTILO DARK GLOW */}
        <div className="relative lg:col-span-2 h-[480px] w-full bg-[#0D1214] overflow-hidden">
          <div ref={mapContainerRef} className="h-full w-full select-none" />

          {/* Radar Sweep Visual Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(255,107,53,0.15),transparent_70%)]" />

          {/* Badge Flutuante Glassmorphism de Status */}
          <div className="absolute top-4 left-4 z-[400] flex items-center gap-2.5 rounded-xl bg-[#11171A]/90 border border-white/10 px-3.5 py-2 shadow-2xl backdrop-blur-xl">
            <span className="relative flex size-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500" />
            </span>
            <div className="text-xs font-semibold text-foreground dado flex items-center gap-1.5">
              <span className="text-primary font-bold">{leadsNoRaio.length}</span>
              <span>empresas dentro do sonar ({raioKm} km)</span>
            </div>
          </div>

          {/* Dica de Navegação no Canto */}
          <div className="absolute bottom-4 left-4 z-[400] hidden sm:flex items-center gap-1.5 rounded-lg bg-[#11171A]/85 border border-border/60 px-2.5 py-1 text-[10px] text-muted-foreground rotulo backdrop-blur-md">
            <Compass className="size-3 text-primary animate-spin" style={{ animationDuration: "8s" }} />
            <span>Mova o mapa para escanear novas regiões</span>
          </div>

          {/* POPUP FLUTUANTE DE DETALHES DO LEAD SELECIONADO */}
          {leadAtivo && (
            <div className="absolute bottom-4 right-4 max-w-sm w-full rounded-2xl border border-primary/40 bg-[#141B1F]/95 p-4 shadow-[0_10px_35px_rgba(0,0,0,0.6)] backdrop-blur-2xl z-[500] animate-in fade-in slide-in-from-bottom-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    {leadAtivo.categoria}
                  </span>
                  <h4 className="font-bold text-sm text-foreground truncate">
                    {leadAtivo.nome}
                  </h4>
                </div>
                <button
                  onClick={() => setLeadAtivo(null)}
                  className="text-xs text-muted-foreground hover:text-foreground size-6 rounded-md hover:bg-secondary/50 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <BadgePrioridade score={leadAtivo.score} mostrarBarra={true} />
                <BadgeStatus status={leadAtivo.status} />
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground mb-3 dado bg-secondary/30 p-2.5 rounded-lg border border-border/50">
                <p className="truncate text-foreground/90">📍 {leadAtivo.endereco || leadAtivo.bairro || "Endereço não informado"}</p>
                {leadAtivo.avaliacao_google != null && (
                  <p className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Star className="size-3 fill-amber-400" />
                    <span>{leadAtivo.avaliacao_google.toFixed(1)}</span>
                    <span className="text-[10px] text-muted-foreground font-normal">({leadAtivo.total_avaliacoes} avaliações no Google)</span>
                  </p>
                )}
                <p>📞 {leadAtivo.telefone || "Telefone não informado"}</p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white h-8 text-xs gap-1.5 font-semibold shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                  onClick={() => {
                    setLeadParaWhatsApp(leadAtivo);
                    setModalWhatsAppAberto(true);
                  }}
                >
                  <MessageSquare className="size-3.5" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-8 text-xs gap-1 border-border/80 hover:border-primary/40"
                >
                  <Link to="/leads/$id" params={{ id: leadAtivo.id }}>
                    Detalhes
                    <ExternalLink className="size-3" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* PAINEL LATERAL TÁTICO: OPORTUNIDADES NO RAIO */}
        <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-border/80 bg-surface/40 flex flex-col h-[480px]">
          <div className="p-3.5 border-b border-border/80 bg-surface/80 flex items-center justify-between backdrop-blur-md">
            <div>
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Flame className="size-4 text-[var(--color-alerta)] fill-[var(--color-alerta)]" />
                Oportunidades no Sonar ({leadsNoRaio.length})
              </h4>
              <p className="text-[10px] text-muted-foreground dado">
                <strong className="text-[var(--color-alerta)]">{semSiteNoRaio}</strong> empresas sem site próprio
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={executarVarreduraNoPonto}
              className="h-7 text-[11px] gap-1 text-primary border-primary/30 hover:bg-primary/10 shadow-sm"
            >
              <Sparkles className="size-3" />
              Varredura Aqui
            </Button>
          </div>

          {/* LISTAGEM DE CARDS ILUMINADOS */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 divide-y-0">
            {leadsNoRaio.map((lead) => (
              <div
                key={lead.id}
                onClick={() => {
                  setLeadAtivo(lead);
                  if (lead.latitude && lead.longitude) {
                    mapInstanceRef.current?.panTo([lead.latitude, lead.longitude]);
                  }
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  leadAtivo?.id === lead.id
                    ? "bg-primary/15 border-primary/80 ring-2 ring-primary/30 shadow-[0_0_15px_rgba(255,107,53,0.15)]"
                    : "bg-card/85 border-border/70 hover:border-primary/50 hover:bg-card hover:-translate-y-0.5 shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="min-w-0 flex-1">
                    <h5 className="font-semibold text-xs text-foreground truncate">
                      {lead.nome}
                    </h5>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {lead.categoria} · 📍 {lead.bairro || lead.cidade}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-primary dado bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 shrink-0">
                    ~{formatarDistancia(lead.distancia)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] gap-1 flex-wrap">
                  <BadgePrioridade score={lead.score} mostrarBarra={false} />
                  {!lead.tem_site ? (
                    <span className="text-[10px] font-semibold text-[var(--color-alerta)] flex items-center gap-1 bg-[var(--color-alerta)]/10 px-1.5 py-0.5 rounded">
                      <AlertCircle className="size-3" /> Sem site
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Globe className="size-2.5" /> Com site
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-border/50">
                  <span className="text-[10px] text-muted-foreground dado truncate max-w-[120px]">
                    {lead.telefone || "Sem telefone"}
                  </span>
                  <Button
                    size="sm"
                    className="h-6 px-2.5 text-[10px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white gap-1 shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLeadParaWhatsApp(lead);
                      setModalWhatsAppAberto(true);
                    }}
                  >
                    <MessageSquare className="size-2.5" />
                    Abordar
                  </Button>
                </div>
              </div>
            ))}

            {leadsNoRaio.length === 0 && (
              <div className="h-56 flex flex-col items-center justify-center text-center p-4 text-xs text-muted-foreground space-y-2">
                <Target className="size-8 text-muted-foreground/30 animate-pulse" />
                <p className="font-semibold text-foreground/80">Nenhuma empresa neste raio de {raioKm} km</p>
                <p className="text-[10px] leading-relaxed">Arraste o mapa para outras coordenadas ou aumente o alcance do sonar.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de envio WhatsApp */}
      <ModalMensagemWhatsApp
        lead={leadParaWhatsApp}
        aberto={modalWhatsAppAberto}
        onOpenChange={setModalWhatsAppAberto}
      />
    </div>
  );
}
