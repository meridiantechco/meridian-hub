import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import type { LeadItem } from "@/lib/leads-mock";
import { BadgePrioridade } from "./BadgePrioridade";
import { BadgeStatus } from "./BadgeStatus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModalMensagemWhatsApp } from "./ModalMensagemWhatsApp";
import { calcularDistanciaKm, formatarDistancia } from "@/lib/geo";
import { MotorClustering, type ElementoMapa, type LeadComCoords } from "@/lib/map-clustering";
import { useMapSearch, type BoundingBox } from "@/hooks/useMapSearch";
import {
  obterCoordenadasCidadeBrasil,
  CAPITAIS_BRASIL_RAPIDAS,
  CIDADES_BRASIL,
} from "@/lib/geo-brasil";
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
  Columns2,
  List,
  Map as MapIcon,
  Search,
  Check,
  Phone,
  ArrowUpRight,
  RefreshCw,
  Loader2,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FiltrosMapa {
  categoria?: string;
  status?: string;
  apenasSemSite?: boolean;
  scoreMinimo?: number | null;
  termo?: string;
}

interface MapaLeadsProps {
  leads?: LeadItem[];
  aoSelecionarLead?: (lead: LeadItem) => void;
  leadSelecionadoExterno?: LeadItem | null;
  exibirApenasMapa?: boolean;
  onBoundsChanged?: (bounds: BoundingBox) => void;
  filtrosExternos?: FiltrosMapa;
}

type EstiloMapa = "dark" | "light" | "osm" | "satellite";

const CAMADAS_MAPA: Record<
  EstiloMapa,
  { nome: string; url: string; subdomains?: string; maxZoom: number; attr?: string }
> = {
  dark: {
    nome: "Cartografia Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    subdomains: "abcd",
    maxZoom: 19,
  },
  light: {
    nome: "Cartografia Clara",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    subdomains: "abcd",
    maxZoom: 19,
  },
  osm: {
    nome: "OpenStreetMap Ruas",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    maxZoom: 19,
  },
  satellite: {
    nome: "Satélite de Alta Resolução",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 18,
  },
};

// Resolução universal de coordenadas para qualquer município/bairro do Brasil
function resolverCoordenadasLead(lead: LeadItem, index: number): { lat: number; lng: number } {
  if (
    typeof lead.latitude === "number" &&
    !isNaN(lead.latitude) &&
    lead.latitude !== 0 &&
    typeof lead.longitude === "number" &&
    !isNaN(lead.longitude) &&
    lead.longitude !== 0
  ) {
    return { lat: lead.latitude, lng: lead.longitude };
  }

  // Lookup geográfico inteligente para cidades e bairros do Brasil
  const termoGeografico = `${lead.cidade || ""} ${lead.estado || ""} ${lead.bairro || ""} ${lead.endereco || ""}`.trim();
  const infoCidade = obterCoordenadasCidadeBrasil(termoGeografico || "sao paulo");

  // Espalhamento geográfico determinístico ao redor do centro da cidade
  const angle = (index * (2 * Math.PI)) / Math.max(1, (index % 15) + 3);
  const radius = 0.012 + (index % 6) * 0.005;

  return {
    lat: Number((infoCidade.lat + radius * Math.cos(angle)).toFixed(6)),
    lng: Number((infoCidade.lng + radius * Math.sin(angle)).toFixed(6)),
  };
}

export function MapaLeads({
  leads: leadsProp,
  aoSelecionarLead,
  leadSelecionadoExterno,
  exibirApenasMapa = false,
  onBoundsChanged,
  filtrosExternos,
}: MapaLeadsProps) {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const radarCircleRef = useRef<any>(null);
  const radarPulseCircleRef = useRef<any>(null);
  const centerMarkerRef = useRef<any>(null);
  const markersMapRef = useRef<Map<string, any>>(new Map());
  const markersLayerRef = useRef<any>(null);
  const leafletModuleRef = useRef<any>(null);
  const motorClusteringRef = useRef<MotorClustering>(new MotorClustering());
  const jaEnquadrouInicialRef = useRef<boolean>(false);

  const [mapaPronto, setMapaPronto] = useState(false);
  const [zoomAtual, setZoomAtual] = useState<number>(12);
  const [regiaoAtualNome, setRegiaoAtualNome] = useState<string>("São Paulo, SP");

  // Layout View Mode (Airbnb style: Split View, Full Map, Full List)
  const [modoVisualizacao, setModoVisualizacao] = useState<"split" | "map" | "list">(
    exibirApenasMapa ? "map" : "split"
  );
  const [mobileAba, setMobileAba] = useState<"mapa" | "lista">("mapa");

  // Camada de Estilo
  const [estiloMapa, setEstiloMapa] = useState<EstiloMapa>("dark");

  // Centro do radar (Padrão: São Paulo ou URL Params)
  const [centroRadar, setCentroRadar] = useState<{ lat: number; lng: number }>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const lat = parseFloat(params.get("lat") || "");
      const lng = parseFloat(params.get("lng") || "");
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }
    return { lat: -23.5505, lng: -46.6333 };
  });

  // Raio em KM (Padrão: 10 km)
  const [raioKm, setRaioKm] = useState<number>(15);

  // Airbnb Feature: "Buscar ao mover o mapa"
  const [buscarAoMover, setBuscarAoMover] = useState<boolean>(true);
  const [mapaFoiMovidoManualmente, setMapaFoiMovidoManualmente] = useState<boolean>(false);
  const [boundsVisiveis, setBoundsVisiveis] = useState<BoundingBox | null>(null);

  // Filtros locais do mapa
  const [filtroSemSite, setFiltroSemSite] = useState<boolean | null>(
    filtrosExternos?.apenasSemSite ? true : null
  );
  const [filtroScoreMinimo, setFiltroScoreMinimo] = useState<number | null>(
    filtrosExternos?.scoreMinimo ?? null
  );
  const [termoBuscaMapa, setTermoBuscaMapa] = useState<string>(filtrosExternos?.termo || "");
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(
    filtrosExternos?.categoria && filtrosExternos.categoria !== "todas"
      ? filtrosExternos.categoria
      : null
  );

  // Lead ativo / em foco
  const [leadAtivo, setLeadAtivo] = useState<LeadComCoords | null>(null);
  const [leadHovered, setLeadHovered] = useState<string | null>(null);

  // Modal WhatsApp
  const [modalWhatsAppAberto, setModalWhatsAppAberto] = useState(false);
  const [leadParaWhatsApp, setLeadParaWhatsApp] = useState<LeadItem | null>(null);

  // Hook de Busca por Viewport com Debounce e AbortController (Airbnb Style)
  const filtrosConsolidados = useMemo(
    () => ({
      categoria: categoriaAtiva || filtrosExternos?.categoria,
      status: filtrosExternos?.status,
      apenasSemSite: filtroSemSite === true || filtrosExternos?.apenasSemSite,
      scoreMinimo: filtroScoreMinimo ?? filtrosExternos?.scoreMinimo,
      termo: termoBuscaMapa || filtrosExternos?.termo,
    }),
    [categoriaAtiva, filtroSemSite, filtroScoreMinimo, termoBuscaMapa, filtrosExternos]
  );

  const {
    leads: leadsBbox,
    carregando: carregandoBusca,
    buscarNestaArea,
  } = useMapSearch({
    bounds: boundsVisiveis,
    filtros: filtrosConsolidados,
    buscarAoMover,
    debounceMs: 450,
    leadsIniciais: leadsProp || [],
  });

  // Conjunto de leads a utilizar: props ou retorno da busca por bounding box
  const leadsBrutos = useMemo(() => {
    if (leadsProp && leadsProp.length > 0 && !buscarAoMover) {
      return leadsProp;
    }
    return leadsBbox.length > 0 ? leadsBbox : leadsProp || [];
  }, [leadsProp, leadsBbox, buscarAoMover]);

  // Sincronizar com seleção externa se fornecida
  useEffect(() => {
    if (leadSelecionadoExterno) {
      const coords = resolverCoordenadasLead(leadSelecionadoExterno, 0);
      setLeadAtivo({
        ...leadSelecionadoExterno,
        latEfetiva: coords.lat,
        lngEfetiva: coords.lng,
      });
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo([coords.lat, coords.lng]);
      }
    }
  }, [leadSelecionadoExterno]);

  // Lista de categorias únicas para chips de filtro rápido no mapa
  const categoriasPrincipais = useMemo(() => {
    const contagem: Record<string, number> = {};
    leadsBrutos.forEach((l) => {
      if (l.categoria) {
        contagem[l.categoria] = (contagem[l.categoria] || 0) + 1;
      }
    });
    return Object.entries(contagem)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nome]) => nome);
  }, [leadsBrutos]);

  // 1. Processar coordenadas efetivas e distâncias para todos os leads em escala nacional
  const leadsProcessados = useMemo<LeadComCoords[]>(() => {
    return leadsBrutos.map((lead, idx) => {
      const coords = resolverCoordenadasLead(lead, idx);
      const distancia = calcularDistanciaKm(
        centroRadar.lat,
        centroRadar.lng,
        coords.lat,
        coords.lng
      );
      const dentroDoRaio = distancia <= raioKm;

      let dentroDosBounds = true;
      if (boundsVisiveis) {
        dentroDosBounds =
          coords.lat >= boundsVisiveis.swLat &&
          coords.lat <= boundsVisiveis.neLat &&
          coords.lng >= boundsVisiveis.swLng &&
          coords.lng <= boundsVisiveis.neLng;
      }

      return {
        ...lead,
        latEfetiva: coords.lat,
        lngEfetiva: coords.lng,
        distancia,
        dentroDoRaio,
        dentroDosBounds,
      };
    });
  }, [leadsBrutos, centroRadar, raioKm, boundsVisiveis]);

  // 2. Filtragem de leads locais
  const leadsFiltrados = useMemo(() => {
    return leadsProcessados.filter((l) => {
      if (filtroSemSite !== null && l.tem_site === filtroSemSite) return false;
      if (filtroScoreMinimo !== null && l.score < filtroScoreMinimo) return false;
      if (categoriaAtiva && l.categoria !== categoriaAtiva) return false;

      if (termoBuscaMapa.trim()) {
        const termo = termoBuscaMapa.toLowerCase();
        const matchNome = l.nome.toLowerCase().includes(termo);
        const matchCat = (l.categoria || "").toLowerCase().includes(termo);
        const matchBairro = (l.bairro || "").toLowerCase().includes(termo);
        const matchCidade = (l.cidade || "").toLowerCase().includes(termo);
        const matchEstado = (l.estado || "").toLowerCase().includes(termo);
        if (!matchNome && !matchCat && !matchBairro && !matchCidade && !matchEstado) return false;
      }

      return true;
    });
  }, [leadsProcessados, filtroSemSite, filtroScoreMinimo, categoriaAtiva, termoBuscaMapa]);

  // 3. Leads visíveis na área / sonar ordenados por proximidade ao centro do radar
  const leadsVisiveis = useMemo(() => {
    return leadsFiltrados
      .filter((l) => (buscarAoMover ? l.dentroDosBounds : l.dentroDoRaio))
      .sort((a, b) => (a.distancia ?? 0) - (b.distancia ?? 0));
  }, [leadsFiltrados, buscarAoMover]);

  const semSiteVisiveis = leadsVisiveis.filter((l) => !l.tem_site).length;

  // Navegar para qualquer capital/região do Brasil com 1 clique
  const navegarParaRegiao = (lat: number, lng: number, zoom: number, label: string) => {
    setCentroRadar({ lat, lng });
    setRegiaoAtualNome(label);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 1.2 });
    }
    toast.success(`Mapa posicionado em ${label}`);
  };

  // 4. Inicializar Leaflet dinamicamente no Browser
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

          // Camada inicial
          const layerConfig = CAMADAS_MAPA[estiloMapa];
          const tileLayer = L.tileLayer(layerConfig.url, {
            maxZoom: layerConfig.maxZoom,
            subdomains: layerConfig.subdomains || "abc",
          }).addTo(map);
          tileLayerRef.current = tileLayer;

          L.control.zoom({ position: "topright" }).addTo(map);

          const markersLayer = L.layerGroup().addTo(map);
          markersLayerRef.current = markersLayer;

          // Clique no mapa para posicionar o radar
          map.on("click", (e: any) => {
            if (e.latlng) {
              const novaCoord = {
                lat: Number(e.latlng.lat.toFixed(5)),
                lng: Number(e.latlng.lng.toFixed(5)),
              };
              setCentroRadar(novaCoord);
            }
          });

          // Evento de movimento do mapa com Airbnb URL sync e bounds update
          const atualizarBoundsEUrl = () => {
            const center = map.getCenter();
            const zoom = map.getZoom();
            setZoomAtual(zoom);

            const b = map.getBounds();
            const sw = b.getSouthWest();
            const ne = b.getNorthEast();

            const novosBounds: BoundingBox = {
              swLat: sw.lat,
              swLng: sw.lng,
              neLat: ne.lat,
              neLng: ne.lng,
            };

            setBoundsVisiveis(novosBounds);
            onBoundsChanged?.(novosBounds);
            setMapaFoiMovidoManualmente(true);

            // Sincronizar parâmetros na URL
            if (typeof window !== "undefined") {
              const url = new URL(window.location.href);
              url.searchParams.set("lat", center.lat.toFixed(4));
              url.searchParams.set("lng", center.lng.toFixed(4));
              url.searchParams.set("zoom", zoom.toString());
              window.history.replaceState(null, "", url.toString());
            }
          };

          map.on("moveend", atualizarBoundsEUrl);
          map.on("zoomend", atualizarBoundsEUrl);

          mapInstanceRef.current = map;
          setMapaPronto(true);
          atualizarBoundsEUrl();
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

  // Forçar recálculo de dimensões do Leaflet (Invalidate Size)
  useEffect(() => {
    if (mapInstanceRef.current && mapaPronto) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 100);
    }
  }, [mapaPronto, modoVisualizacao, mobileAba]);

  // 5. Trocar camada de estilo cartográfico
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = leafletModuleRef.current;
    if (!map || !L || !mapaPronto) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const layerConfig = CAMADAS_MAPA[estiloMapa];
    const novoTile = L.tileLayer(layerConfig.url, {
      maxZoom: layerConfig.maxZoom,
      subdomains: layerConfig.subdomains || "abc",
    }).addTo(map);

    tileLayerRef.current = novoTile;
  }, [estiloMapa, mapaPronto]);

  // 6. Atualizar Círculo do Sonar e Retículo Tático Arrastável
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = leafletModuleRef.current;
    if (!map || !L || !mapaPronto) return;

    const centerLatLng = [centroRadar.lat, centroRadar.lng];
    const raioMetros = raioKm * 1000;

    // Círculo Sonar Principal
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
        fillOpacity: 0.08,
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

    // Retículo Central Tático Arrastável
    const miraIcon = L.divIcon({
      className: "mira-radar-center",
      html: `
        <div class="relative flex items-center justify-center size-12 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing group select-none">
          <div class="absolute size-12 rounded-full border-2 border-primary/60 animate-ping pointer-events-none"></div>
          <div class="size-7 rounded-full bg-[#11171A]/90 border-2 border-primary flex items-center justify-center shadow-[0_0_20px_#FF6B35] backdrop-blur-md group-hover:scale-125 transition-transform">
            <div class="size-2 rounded-full bg-white animate-pulse"></div>
          </div>
          <div class="absolute top-8 px-2 py-0.5 rounded-full bg-[#11171A]/95 text-[9px] font-mono text-primary font-bold border border-primary/50 whitespace-nowrap pointer-events-none shadow-xl flex items-center gap-1">
            <span class="size-1.5 rounded-full bg-primary animate-ping"></span>
            Arrastar Radar
          </div>
        </div>
      `,
      iconSize: [0, 0],
    });

    if (centerMarkerRef.current) {
      centerMarkerRef.current.setLatLng(centerLatLng);
    } else {
      const marker = L.marker(centerLatLng, {
        icon: miraIcon,
        draggable: true,
        zIndexOffset: 3000,
      }).addTo(map);

      marker.on("drag", (e: any) => {
        const pos = e.target.getLatLng();
        if (radarCircleRef.current) radarCircleRef.current.setLatLng(pos);
        if (radarPulseCircleRef.current) radarPulseCircleRef.current.setLatLng(pos);
      });

      marker.on("dragend", (e: any) => {
        const pos = e.target.getLatLng();
        setCentroRadar({
          lat: Number(pos.lat.toFixed(5)),
          lng: Number(pos.lng.toFixed(5)),
        });
        toast.success(`Radar posicionado em N ${pos.lat.toFixed(3)}° / W ${pos.lng.toFixed(3)}°`);
      });

      centerMarkerRef.current = marker;
    }
  }, [centroRadar, raioKm, mapaPronto]);

  // 7. Auto Enquadrar Todos os Leads no Mapa (apenas na carga inicial)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = leafletModuleRef.current;
    if (
      !map ||
      !L ||
      !mapaPronto ||
      leadsProcessados.length === 0 ||
      jaEnquadrouInicialRef.current
    )
      return;

    const pontosComCoord = leadsProcessados.map((l) => [l.latEfetiva, l.lngEfetiva]);
    if (pontosComCoord.length > 0) {
      const bounds = L.latLngBounds(pontosComCoord);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      jaEnquadrouInicialRef.current = true;
    }
  }, [mapaPronto, leadsProcessados.length]);

  // 8. Supercluster & Renderização de Marcadores / Clusters Estilo Airbnb
  useEffect(() => {
    const markersLayer = markersLayerRef.current;
    const L = leafletModuleRef.current;
    const map = mapInstanceRef.current;
    if (!markersLayer || !L || !map || !mapaPronto) return;

    markersLayer.clearLayers();
    markersMapRef.current.clear();

    // Carregar dados no Supercluster
    motorClusteringRef.current.carregarLeads(leadsFiltrados);

    const b = map.getBounds();
    const bbox: [number, number, number, number] = [
      b.getWest(),
      b.getSouth(),
      b.getEast(),
      b.getNorth(),
    ];
    const zoom = map.getZoom();
    const elementos = motorClusteringRef.current.obterElementos(bbox, zoom);

    elementos.forEach((elem: ElementoMapa) => {
      const [lng, lat] = elem.geometry.coordinates;

      // 8.1. Se for CLUSTER (Grupo de múltiplos estabelecimentos próximos)
      if (elem.properties.cluster) {
        const clusterId = elem.properties.cluster_id;
        const count = elem.properties.point_count;

        const clusterHtml = `
          <div class="airbnb-cluster-pin relative cursor-pointer -translate-x-1/2 -translate-y-1/2 font-sans select-none">
            <div class="size-10 rounded-full bg-gradient-to-br from-primary via-[#FF6B35] to-[#E85D04] text-white font-bold font-mono text-xs flex items-center justify-center shadow-[0_0_20px_rgba(255,107,53,0.65)] border-2 border-white transition-transform duration-200 hover:scale-125">
              ${count}
            </div>
          </div>
        `;

        const clusterIcon = L.divIcon({
          className: "airbnb-cluster-icon",
          html: clusterHtml,
          iconSize: [0, 0],
        });

        const clusterMarker = L.marker([lat, lng], {
          icon: clusterIcon,
          zIndexOffset: 1000,
        });

        clusterMarker.on("click", () => {
          const zoomExpansao = motorClusteringRef.current.obterZoomExpansao(clusterId);
          map.setView([lat, lng], Math.min(zoomExpansao, 17), { animate: true });
        });

        markersLayer.addLayer(clusterMarker);
        return;
      }

      // 8.2. Se for PONTO INDIVIDUAL (Lead)
      const lead = elem.properties.lead;
      const noRaio = lead.dentroDoRaio;
      const semSite = !lead.tem_site;
      const isAtivo = leadAtivo?.id === lead.id;
      const isHovered = leadHovered === lead.id;

      let bgStyle = "";
      let borderStyle = "";
      let shadowStyle = "";

      if (isAtivo) {
        bgStyle = "background: #FF6B35; color: #FFFFFF;";
        borderStyle = "border: 2px solid #FFFFFF;";
        shadowStyle =
          "box-shadow: 0 0 20px rgba(255, 107, 53, 0.9), 0 4px 15px rgba(0,0,0,0.5);";
      } else if (isHovered) {
        bgStyle = "background: #FFFFFF; color: #11171A;";
        borderStyle = "border: 2px solid #FF6B35;";
        shadowStyle = "box-shadow: 0 0 16px rgba(255, 107, 53, 0.7);";
      } else if (semSite) {
        bgStyle = noRaio
          ? "background: rgba(17, 23, 26, 0.95); color: #FF8C42;"
          : "background: rgba(17, 23, 26, 0.7); color: #FF8C42; opacity: 0.55;";
        borderStyle = noRaio
          ? "border: 1.5px solid #FF6B35;"
          : "border: 1px dashed rgba(255, 107, 53, 0.5);";
        shadowStyle = noRaio
          ? "box-shadow: 0 0 12px rgba(255, 107, 53, 0.4);"
          : "box-shadow: none;";
      } else {
        bgStyle = noRaio
          ? "background: rgba(17, 23, 26, 0.92); color: #3ECF8E;"
          : "background: rgba(17, 23, 26, 0.7); color: #3ECF8E; opacity: 0.55;";
        borderStyle = noRaio
          ? "border: 1.5px solid #3ECF8E;"
          : "border: 1px dashed rgba(62, 207, 142, 0.4);";
        shadowStyle = noRaio
          ? "box-shadow: 0 0 10px rgba(62, 207, 142, 0.3);"
          : "box-shadow: none;";
      }

      const zIndexOffset = isAtivo ? 2000 : isHovered ? 1500 : noRaio ? 500 : 0;

      const badgeHtml = `
        <div class="airbnb-badge-pin relative cursor-pointer -translate-x-1/2 -translate-y-1/2 font-sans select-none" style="${zIndexOffset ? `z-index: ${zIndexOffset};` : ""}">
          ${
            semSite && (isAtivo || isHovered)
              ? '<span class="absolute -inset-2 rounded-full bg-[#FF6B35]/40 animate-ping pointer-events-none"></span>'
              : ""
          }
          <div
            style="${bgStyle} ${borderStyle} ${shadowStyle}"
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold font-mono tracking-tight backdrop-blur-md transition-all duration-200 hover:scale-110 whitespace-nowrap"
          >
            ${
              semSite
                ? '<svg xmlns="http://www.w3.org/2000/svg" class="size-3 shrink-0 fill-current" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>'
                : '<svg xmlns="http://www.w3.org/2000/svg" class="size-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>'
            }
            <span>${lead.score} pts</span>
          </div>

          <!-- Tooltip flutuante rápido no hover do pin -->
          <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
            <div class="rounded-lg bg-[#11171A]/95 border border-[#2B363B] px-2.5 py-1 shadow-2xl backdrop-blur-xl text-center whitespace-nowrap">
              <p class="text-[11px] font-bold text-foreground truncate max-w-[180px]">${lead.nome}</p>
              <p class="text-[10px] text-muted-foreground">${lead.categoria} · 📍 ${lead.bairro || lead.cidade} (~${formatarDistancia(lead.distancia)})</p>
            </div>
            <div class="size-1.5 bg-[#11171A] rotate-45 border-r border-b border-[#2B363B] -mt-1"></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "airbnb-marker-pin",
        html: badgeHtml,
        iconSize: [0, 0],
      });

      const marker = L.marker([lat, lng], {
        icon: customIcon,
        zIndexOffset,
      });

      marker.on("click", () => {
        setLeadAtivo(lead);
        aoSelecionarLead?.(lead);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo([lat, lng]);
        }
        // Rolagem suave até o card na lista lateral
        const cardElem = document.getElementById(`lead-card-${lead.id}`);
        if (cardElem) {
          cardElem.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });

      markersLayer.addLayer(marker);
      markersMapRef.current.set(lead.id, marker);
    });
  }, [
    leadsFiltrados,
    leadAtivo,
    leadHovered,
    aoSelecionarLead,
    mapaPronto,
    boundsVisiveis,
    zoomAtual,
  ]);

  // Centralizar em todas as empresas (Fit Bounds)
  const enquadrarTodosOsLeads = () => {
    const map = mapInstanceRef.current;
    const L = leafletModuleRef.current;
    if (!map || !L) return;

    const pontosComCoord = leadsFiltrados.map((l) => [l.latEfetiva, l.lngEfetiva]);

    if (pontosComCoord.length > 0) {
      const bounds = L.latLngBounds(pontosComCoord);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      toast.success(`${pontosComCoord.length} estabelecimentos enquadrados no mapa.`);
    } else {
      toast.info("Nenhum estabelecimento encontrado.");
    }
  };

  // Centralizar na localização atual GPS do usuário
  const obterMinhaLocalizacao = () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCentroRadar({ lat, lng });
          setRegiaoAtualNome("Minha Localização");
          mapInstanceRef.current?.setView([lat, lng], 13);
          toast.success("Radar centralizado na sua localização atual!");
        },
        () => {
          toast.error("Não foi possível obter sua localização geográfica.");
        }
      );
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-border/80 bg-card overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.5)] ring-1 ring-white/5 relative">
      {/* ========================================================================= */}
      {/* 1. BARRA SUPERIOR DE CONTROLE (AIRBNB STYLE SEARCH & FILTERS HEADER) */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-surface/90 px-4 py-3 backdrop-blur-xl z-20">
        {/* Esquerda: Identidade do Sonar + Coordenadas e Região Atual */}
        <div className="flex items-center gap-3">
          <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary border border-primary/30 shadow-[0_0_15px_rgba(255,107,53,0.25)]">
            <Radar className="size-5 animate-radar-sweep" />
            <span className="absolute top-1 right-1 size-2 rounded-full bg-[var(--color-alerta)] animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-foreground tracking-tight">
                Mapa de Oportunidades Brasil
              </h3>
              <span className="text-[10px] font-mono uppercase font-semibold text-[var(--color-alerta)] bg-[var(--color-alerta)]/15 px-2 py-0.5 rounded-full border border-[var(--color-alerta)]/30">
                {leadsVisiveis.length} empresas na área
              </span>
              {carregandoBusca && (
                <Loader2 className="size-3.5 text-primary animate-spin" />
              )}
            </div>
            <p className="text-[11px] text-muted-foreground dado flex items-center gap-1.5 flex-wrap">
              <span className="text-primary font-semibold">📍 {regiaoAtualNome}</span>
              <span className="text-border">·</span>
              <span>
                N {centroRadar.lat.toFixed(4)}° / W {centroRadar.lng.toFixed(4)}°
              </span>
              <span className="text-border">·</span>
              <span className="text-muted-foreground/80">Alcance de {raioKm} km</span>
            </p>
          </div>
        </div>

        {/* Direita: Controles Táticos, Camadas e Switcher de Layout */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Dropdown de Navegação Rápida por Capitais e Brasil */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs px-2.5 gap-1.5 border-border/80 hover:border-primary/40 text-foreground font-semibold"
              >
                <Compass className="size-3.5 text-primary" />
                <span className="hidden sm:inline">Região:</span>
                <span className="text-primary truncate max-w-[85px]">{regiaoAtualNome}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border p-1 max-h-80 overflow-y-auto">
              <DropdownMenuLabel className="text-xs">Navegar pelo Brasil</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {CAPITAIS_BRASIL_RAPIDAS.map((cap) => (
                <DropdownMenuItem
                  key={cap.label}
                  onClick={() => navegarParaRegiao(cap.lat, cap.lng, cap.zoom, cap.label)}
                  className="text-xs flex items-center justify-between cursor-pointer"
                >
                  <span>{cap.label}</span>
                  {regiaoAtualNome === cap.label && <Check className="size-3.5 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Campo de Busca Rápida no Mapa */}
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar cidade, bairro..."
              value={termoBuscaMapa}
              onChange={(e) => setTermoBuscaMapa(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && termoBuscaMapa.trim()) {
                  const info = obterCoordenadasCidadeBrasil(termoBuscaMapa);
                  navegarParaRegiao(info.lat, info.lng, 12, `${info.nome}, ${info.estado}`);
                }
              }}
              className="pl-8 h-8 text-xs w-36 lg:w-48 bg-secondary/60 border-border/70"
            />
          </div>

          {/* Seletor de Raio */}
          <div className="flex items-center gap-1 bg-secondary/70 p-1 rounded-lg border border-border/70 backdrop-blur">
            <span className="text-[9px] uppercase font-mono text-muted-foreground px-1 font-bold hidden sm:inline">
              Raio:
            </span>
            {[5, 10, 15, 25, 50].map((km) => (
              <button
                key={km}
                type="button"
                onClick={() => setRaioKm(km)}
                className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold transition-all ${
                  raioKm === km
                    ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(255,107,53,0.4)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface/80"
                }`}
              >
                {km}k
              </button>
            ))}
          </div>

          {/* Filtro Rápido "Sem Site" */}
          <Button
            variant={filtroSemSite === true ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltroSemSite(filtroSemSite === true ? null : true)}
            className={cn(
              "h-8 text-xs px-2.5 gap-1 font-semibold",
              filtroSemSite === true
                ? "bg-primary text-primary-foreground"
                : "border-border text-[var(--color-alerta)] hover:bg-[var(--color-alerta)]/10"
            )}
          >
            <Zap className="size-3 fill-current" />
            Sem Site ({semSiteVisiveis})
          </Button>

          {/* Dropdown de Estilos de Camada do Mapa */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs px-2.5 gap-1 border-border/80 hover:border-primary/40"
              >
                <Layers className="size-3.5 text-primary" />
                <span className="hidden sm:inline">Camada</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-card border-border p-1">
              <DropdownMenuLabel className="text-xs">Estilo Cartográfico</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(CAMADAS_MAPA) as EstiloMapa[]).map((key) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setEstiloMapa(key)}
                  className="text-xs flex items-center justify-between cursor-pointer"
                >
                  <span>{CAMADAS_MAPA[key].nome}</span>
                  {estiloMapa === key && <Check className="size-3.5 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Botões de Ação GPS e Enquadrar */}
          <Button
            variant="outline"
            size="icon"
            onClick={obterMinhaLocalizacao}
            className="size-8 border-border/80 hover:border-primary/40 hover:bg-primary/5"
            title="Localização GPS"
          >
            <Crosshair className="size-3.5 text-primary" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={enquadrarTodosOsLeads}
            className="size-8 border-border/80 hover:border-primary/40 hover:bg-primary/5"
            title="Enquadrar todas as empresas"
          >
            <Target className="size-3.5 text-primary" />
          </Button>

          {/* Switcher de Visualização no Desktop (Divisão / Mapa / Lista) */}
          <div className="hidden sm:flex items-center gap-0.5 bg-secondary/80 p-0.5 rounded-lg border border-border/70">
            <button
              type="button"
              onClick={() => setModoVisualizacao("split")}
              className={cn(
                "p-1.5 rounded-md text-xs transition-colors",
                modoVisualizacao === "split"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Visão Dividida (Lista e Mapa)"
            >
              <Columns2 className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setModoVisualizacao("map")}
              className={cn(
                "p-1.5 rounded-md text-xs transition-colors",
                modoVisualizacao === "map"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Apenas Mapa"
            >
              <MapIcon className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setModoVisualizacao("list")}
              className={cn(
                "p-1.5 rounded-md text-xs transition-colors",
                modoVisualizacao === "list"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Apenas Lista"
            >
              <List className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. BARRA DE CHIPS DE CATEGORIAS RÁPIDAS NO TOPO DO MAPA */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border/60 bg-surface/50 overflow-x-auto text-xs scrollbar-none">
        <span className="text-[10px] uppercase font-bold text-muted-foreground/70 shrink-0 rotulo">
          Filtrar:
        </span>
        <button
          type="button"
          onClick={() => setCategoriaAtiva(null)}
          className={cn(
            "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all shrink-0",
            categoriaAtiva === null
              ? "bg-primary/20 text-primary border border-primary/40 font-bold"
              : "bg-secondary/60 text-muted-foreground hover:text-foreground border border-border/50"
          )}
        >
          Todas as Categorias ({leadsProcessados.length})
        </button>
        {categoriasPrincipais.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoriaAtiva(categoriaAtiva === cat ? null : cat)}
            className={cn(
              "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all shrink-0",
              categoriaAtiva === cat
                ? "bg-primary text-primary-foreground font-bold shadow-sm"
                : "bg-secondary/60 text-muted-foreground hover:text-foreground border border-border/50"
            )}
          >
            {cat}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setFiltroScoreMinimo(filtroScoreMinimo === 75 ? null : 75)}
          className={cn(
            "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 ml-auto flex items-center gap-1",
            filtroScoreMinimo === 75
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
              : "bg-secondary/60 text-muted-foreground hover:text-foreground border border-border/50"
          )}
        >
          <Flame className="size-3 text-amber-400 fill-amber-400" />
          Score &gt; 75 pts
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. ÁREA PRINCIPAL: MAPA CARTOGRÁFICO + PAINEL DE CARDS (SPLIT / FULL) */}
      {/* ========================================================================= */}
      <div
        className={cn(
          "grid min-h-[540px] transition-all duration-300",
          modoVisualizacao === "split"
            ? "grid-cols-1 lg:grid-cols-12"
            : modoVisualizacao === "map"
            ? "grid-cols-1"
            : "grid-cols-1"
        )}
      >
        {/* CONTAINER DO MAPA INTERATIVO LEAFLET */}
        <div
          className={cn(
            "relative h-[540px] lg:h-[600px] w-full bg-[#0D1214] overflow-hidden",
            modoVisualizacao === "split"
              ? "lg:col-span-7 xl:col-span-8 order-1 lg:order-2"
              : modoVisualizacao === "map"
              ? "block"
              : "hidden",
            mobileAba === "lista" ? "hidden md:block" : "block"
          )}
        >
          <div ref={mapContainerRef} className="h-full w-full select-none" />

          {/* OVERLAY AIRBNB: TOGGLE FLUTUANTE "BUSCAR AO MOVER O MAPA" */}
          <div className="absolute top-4 left-4 z-[400] flex items-center gap-2 rounded-xl bg-[#11171A]/95 border border-white/10 px-3.5 py-2 shadow-2xl backdrop-blur-xl">
            <Switch
              id="buscar-ao-mover"
              checked={buscarAoMover}
              onCheckedChange={setBuscarAoMover}
              className="data-[state=checked]:bg-primary"
            />
            <Label
              htmlFor="buscar-ao-mover"
              className="text-xs font-semibold text-foreground cursor-pointer select-none flex items-center gap-1.5"
            >
              <span>Buscar ao mover o mapa</span>
              {carregandoBusca && <Loader2 className="size-3 text-primary animate-spin" />}
            </Label>
          </div>

          {/* BOTÃO FLUTUANTE "BUSCAR NESTA ÁREA" (AIRBNB STYLE MANUAL BUTTON) */}
          {!buscarAoMover && mapaFoiMovidoManualmente && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] animate-in fade-in slide-in-from-top-3">
              <Button
                size="sm"
                onClick={() => void buscarNestaArea()}
                disabled={carregandoBusca}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_4px_20px_rgba(255,107,53,0.5)] h-9 px-4 rounded-full gap-2 text-xs"
              >
                {carregandoBusca ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="size-3.5" />
                )}
                Buscar nesta área do mapa
              </Button>
            </div>
          )}

          {/* BADGE DE CONTAGEM FLUTUANTE INFERIOR */}
          <div className="absolute bottom-4 left-4 z-[400] hidden sm:flex items-center gap-2 rounded-lg bg-[#11171A]/90 border border-border/70 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-md">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
            </span>
            <span className="dado font-medium text-foreground">
              {leadsVisiveis.length} empresas mapeadas
            </span>
            <span className="text-border">·</span>
            <span className="text-[var(--color-alerta)] font-semibold dado">
              {semSiteVisiveis} sem site
            </span>
          </div>

          {/* ===================================================================== */}
          {/* 4. AIRBNB-STYLE FLOATING PREVIEW CARD ON MARKER CLICK */}
          {/* ===================================================================== */}
          {leadAtivo && (
            <div className="absolute bottom-4 right-4 max-w-sm w-[calc(100%-2rem)] sm:w-84 rounded-2xl border border-primary/50 bg-[#141B1F]/95 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-2xl z-[500] animate-in fade-in slide-in-from-bottom-4">
              {/* Header do Card com Categoria e Botão Fechar */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider rotulo truncate">
                      {leadAtivo.categoria}
                    </span>
                    {!leadAtivo.tem_site ? (
                      <span className="text-[9px] font-mono uppercase bg-[var(--color-alerta)]/15 text-[var(--color-alerta)] px-1.5 py-0.2 rounded font-bold">
                        Sem Site
                      </span>
                    ) : null}
                  </div>
                  <h4 className="font-bold text-sm text-foreground truncate mt-0.5">
                    {leadAtivo.nome}
                  </h4>
                </div>
                <button
                  onClick={() => setLeadAtivo(null)}
                  className="text-xs text-muted-foreground hover:text-foreground size-6 rounded-md hover:bg-secondary/50 flex items-center justify-center transition-colors shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Badges de Score e Status */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <BadgePrioridade score={leadAtivo.score} mostrarBarra={true} />
                <BadgeStatus status={leadAtivo.status} />
              </div>

              {/* Bloco de Informações */}
              <div className="space-y-1.5 text-xs text-muted-foreground mb-3 dado bg-secondary/40 p-2.5 rounded-xl border border-border/60">
                <p className="truncate text-foreground/90 flex items-center gap-1.5">
                  <MapPin className="size-3 text-primary shrink-0" />
                  <span className="truncate">
                    {leadAtivo.endereco || leadAtivo.bairro || leadAtivo.cidade || "Endereço não informado"}
                  </span>
                </p>
                {leadAtivo.avaliacao_google != null && (
                  <p className="flex items-center gap-1.5 text-amber-400 font-semibold">
                    <Star className="size-3 fill-amber-400 shrink-0" />
                    <span>{leadAtivo.avaliacao_google.toFixed(1)}</span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      ({leadAtivo.total_avaliacoes} avaliações no Google)
                    </span>
                  </p>
                )}
                <p className="flex items-center gap-1.5">
                  <Phone className="size-3 text-emerald-400 shrink-0" />
                  <span>{leadAtivo.telefone || "Telefone não informado"}</span>
                </p>
              </div>

              {/* Ações Rápidas */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white h-8 text-xs gap-1.5 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.35)]"
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

        {/* ========================================================================= */}
        {/* 5. PAINEL LATERAL TÁTICO COM LISTAGEM DE LEADS (AIRBNB STYLE CARDS) */}
        {/* ========================================================================= */}
        <div
          className={cn(
            "border-t lg:border-t-0 lg:border-r border-border/80 bg-surface/30 flex flex-col h-[540px] lg:h-[600px]",
            modoVisualizacao === "split"
              ? "lg:col-span-5 xl:col-span-4 order-2 lg:order-1"
              : modoVisualizacao === "list"
              ? "block"
              : "hidden",
            mobileAba === "mapa" ? "hidden md:flex" : "flex"
          )}
        >
          {/* Header da Lista Lateral */}
          <div className="p-3.5 border-b border-border/80 bg-surface/80 flex items-center justify-between backdrop-blur-md">
            <div>
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Flame className="size-4 text-[var(--color-alerta)] fill-[var(--color-alerta)]" />
                Oportunidades na Área ({leadsVisiveis.length})
              </h4>
              <p className="text-[10px] text-muted-foreground dado">
                <strong className="text-[var(--color-alerta)]">{semSiteVisiveis}</strong> empresas sem
                site próprio
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => void navigate({ to: "/nova-busca" })}
              className="h-7 text-[11px] gap-1 text-primary border-primary/30 hover:bg-primary/10 shadow-sm"
            >
              <Sparkles className="size-3" />
              Varredura
            </Button>
          </div>

          {/* Lista com Scroll e Sincronização no Hover */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y-0">
            {carregandoBusca && (
              <div className="space-y-2.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-border/50 bg-card/40 animate-pulse space-y-2"
                  >
                    <div className="h-4 bg-muted/30 rounded w-3/4" />
                    <div className="h-3 bg-muted/20 rounded w-1/2" />
                    <div className="h-6 bg-muted/20 rounded w-full" />
                  </div>
                ))}
              </div>
            )}

            {!carregandoBusca &&
              leadsVisiveis.map((lead) => (
                <div
                  key={lead.id}
                  id={`lead-card-${lead.id}`}
                  onMouseEnter={() => setLeadHovered(lead.id)}
                  onMouseLeave={() => setLeadHovered(null)}
                  onClick={() => {
                    setLeadAtivo(lead);
                    aoSelecionarLead?.(lead);
                    if (lead.latEfetiva && lead.lngEfetiva) {
                      mapInstanceRef.current?.panTo([lead.latEfetiva, lead.lngEfetiva]);
                    }
                  }}
                  className={cn(
                    "p-3 rounded-xl border transition-all duration-150 cursor-pointer space-y-2 group",
                    leadAtivo?.id === lead.id
                      ? "bg-primary/15 border-primary/80 ring-2 ring-primary/30 shadow-[0_0_15px_rgba(255,107,53,0.15)]"
                      : leadHovered === lead.id
                      ? "bg-secondary/70 border-primary/50 -translate-y-0.5 shadow-sm"
                      : "bg-card/85 border-border/70 hover:border-primary/40 hover:bg-card shadow-sm"
                  )}
                >
                  {/* Nome, Categoria e Distância */}
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="min-w-0 flex-1">
                      <h5 className="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors">
                        {lead.nome}
                      </h5>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {lead.categoria} · 📍 {lead.bairro || lead.cidade} {lead.estado ? `(${lead.estado})` : ""}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-primary dado bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 shrink-0">
                      ~{formatarDistancia(lead.distancia)}
                    </span>
                  </div>

                  {/* Score e Situação do Site */}
                  <div className="flex items-center justify-between text-[11px] gap-1 flex-wrap">
                    <BadgePrioridade score={lead.score} mostrarBarra={false} />
                    {!lead.tem_site ? (
                      <span className="text-[10px] font-semibold text-[var(--color-alerta)] flex items-center gap-1 bg-[var(--color-alerta)]/10 px-1.5 py-0.5 rounded">
                        <Zap className="size-3 fill-current" /> Sem site
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Globe className="size-2.5" /> Com site
                      </span>
                    )}
                  </div>

                  {/* Avaliação Google e Botão WhatsApp */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-border/50">
                    <div className="flex items-center gap-1 text-[11px] text-amber-400 dado">
                      {lead.avaliacao_google != null ? (
                        <>
                          <Star className="size-3 fill-amber-400" />
                          <span>{lead.avaliacao_google.toFixed(1)}</span>
                          <span className="text-[10px] text-muted-foreground font-normal">
                            ({lead.total_avaliacoes})
                          </span>
                        </>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">
                          {lead.telefone || "Sem telefone"}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        className="h-6 px-2 text-[10px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white gap-1 shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLeadParaWhatsApp(lead);
                          setModalWhatsAppAberto(true);
                        }}
                      >
                        <MessageSquare className="size-2.5" />
                        Abordar
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="size-6 text-muted-foreground hover:text-foreground"
                      >
                        <Link to="/leads/$id" params={{ id: lead.id }}>
                          <ArrowUpRight className="size-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

            {!carregandoBusca && leadsVisiveis.length === 0 && (
              <div className="h-64 flex flex-col items-center justify-center text-center p-4 text-xs text-muted-foreground space-y-3 bg-secondary/20 rounded-2xl border border-dashed border-border/80 m-2">
                <div className="relative flex size-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                  <Radar className="size-5 animate-spin" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">
                    Nenhum estabelecimento nesta área
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1 max-w-[220px]">
                    Navegue para outra capital ou amplie o raio de varredura.
                  </p>
                </div>
                <div className="flex flex-col w-full gap-1.5 pt-1 max-w-[220px]">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRaioKm((prev) => (prev < 50 ? prev + 10 : 50))}
                    className="h-8 text-xs font-semibold gap-1.5 text-primary border-primary/30 hover:bg-primary/10"
                  >
                    <Radar className="size-3.5" />
                    Expandir Raio (+10 km)
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={enquadrarTodosOsLeads}
                    className="h-7 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    🎯 Enquadrar Onde Há Empresas
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. BOTÃO FLUTUANTE MOBILE AIRBNB ("MOSTRAR MAPA" / "MOSTRAR LISTA") */}
      {/* ========================================================================= */}
      <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-[450]">
        <Button
          onClick={() => setMobileAba((prev) => (prev === "mapa" ? "lista" : "mapa"))}
          className="rounded-full bg-[#11171A] hover:bg-[#1A2226] text-white border border-white/20 shadow-2xl px-5 h-10 text-xs font-bold gap-2 flex items-center backdrop-blur-xl"
        >
          {mobileAba === "mapa" ? (
            <>
              <List className="size-4 text-primary" />
              <span>Mostrar Lista ({leadsVisiveis.length})</span>
            </>
          ) : (
            <>
              <MapIcon className="size-4 text-primary" />
              <span>Mostrar Mapa</span>
            </>
          )}
        </Button>
      </div>

      {/* Modal de Envio WhatsApp */}
      <ModalMensagemWhatsApp
        lead={leadParaWhatsApp}
        aberto={modalWhatsAppAberto}
        onOpenChange={setModalWhatsAppAberto}
      />
    </div>
  );
}
