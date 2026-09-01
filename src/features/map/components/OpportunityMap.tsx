import { useEffect, useRef } from "react";
import type { PontoMapa } from "../types";

interface OpportunityMapProps {
  pontos: PontoMapa[];
  pontoSelecionado: PontoMapa | null;
  onSelecionarPonto: (ponto: PontoMapa) => void;
}

export function OpportunityMap({
  pontos,
  pontoSelecionado,
  onSelecionarPonto,
}: OpportunityMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    let isMounted = true;

    // Carregar dinamicamente o Leaflet
    import("leaflet").then((L) => {
      if (!isMounted || !containerRef.current) return;

      // Inicializa o mapa caso ainda não exista
      if (!mapInstanceRef.current) {
        const centerLat = pontos[0]?.latitude ?? -12.9714;
        const centerLng = pontos[0]?.longitude ?? -38.5088;

        const map = L.map(containerRef.current, {
          center: [centerLat, centerLng],
          zoom: 13,
          zoomControl: true,
        });

        // CartoDB Dark Matter tiles para estética dark mode ultra premium
        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          {
            attribution:
              '&copy; <a href="https://carto.com/attributions">CARTO</a> · &copy; OpenStreetMap',
            maxZoom: 19,
            subdomains: "abcd",
          },
        ).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;

      // Limpar marcadores anteriores
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Criar ícones SVG customizados por nível
      const criarIconeSvg = (nivel: PontoMapa["nivel"], score: number) => {
        let corBg = "#a855f7";
        let borda = "#d8b4fe";
        if (nivel === "qualificado") {
          corBg = "#10b981";
          borda = "#6ee7b7";
        } else if (nivel === "atencao") {
          corBg = "#f59e0b";
          borda = "#fcd34d";
        } else if (nivel === "risco") {
          corBg = "#ef4444";
          borda = "#fca5a5";
        }

        return L.divIcon({
          className: "custom-map-marker",
          html: `
            <div style="
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: ${corBg};
              border: 2px solid ${borda};
              box-shadow: 0 0 14px ${corBg}99;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-family: monospace;
              font-size: 11px;
              font-weight: bold;
              cursor: pointer;
              transition: transform 0.2s;
            ">
              ${score}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16],
        });
      };

      // Adicionar novos marcadores
      const bounds: [number, number][] = [];

      pontos.forEach((p) => {
        bounds.push([p.latitude, p.longitude]);
        const marker = L.marker([p.latitude, p.longitude], {
          icon: criarIconeSvg(p.nivel, p.score),
        });

        marker.on("click", () => {
          onSelecionarPonto(p);
        });

        marker.bindPopup(`
          <div style="background: #18181b; color: #fafafa; padding: 6px; border-radius: 8px; font-size: 12px; min-width: 180px;">
            <strong style="font-size: 13px; display: block; margin-bottom: 2px;">${p.lead.nome}</strong>
            <span style="color: #a1a1aa; font-size: 11px;">${p.lead.categoria}</span>
            <div style="margin-top: 6px; display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #4ade80; font-weight: bold;">Score ${p.score}</span>
              <span style="color: #a855f7; font-size: 10px;">${!p.lead.tem_site ? "Sem site" : "Com site"}</span>
            </div>
          </div>
        `);

        marker.addTo(map);
        markersRef.current.push(marker);
      });

      if (bounds.length > 0 && !pontoSelecionado) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [pontos]);

  // Centralizar quando um ponto for selecionado
  useEffect(() => {
    if (pontoSelecionado && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [pontoSelecionado.latitude, pontoSelecionado.longitude],
        15,
        { duration: 1.2 },
      );
    }
  }, [pontoSelecionado]);

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-border/80 shadow-2xl bg-[#12141a]">
      {/* MAP CONTAINER */}
      <div ref={containerRef} className="w-full h-full min-h-[500px]" />
    </div>
  );
}
