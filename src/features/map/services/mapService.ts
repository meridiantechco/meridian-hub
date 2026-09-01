import type { LeadItem } from "@/features/leads";
import type { PontoMapa, NivelOportunidadeMapa, ResumoRegiaoMapa } from "../types";

export const mapService = {
  processarPontosMapa(leads: LeadItem[]): PontoMapa[] {
    // Coordenadas base padrão (Salvador / Região Metropolitana)
    const BASE_LAT = -12.9714;
    const BASE_LNG = -38.5088;

    return leads.map((l, index) => {
      // Se não tiver coordenadas gravadas, gera distribuição realista em volta da base
      const lat = l.latitude ?? BASE_LAT + ((index % 7) - 3) * 0.015 + Math.sin(index) * 0.008;
      const lng = l.longitude ?? BASE_LNG + (((index * 3) % 7) - 3) * 0.015 + Math.cos(index) * 0.008;

      let nivel: NivelOportunidadeMapa = "atencao";
      if (l.score >= 75) nivel = "alta";
      else if (l.score >= 50) nivel = "qualificado";
      else if (l.score >= 30) nivel = "atencao";
      else nivel = "risco";

      const cat = (l.categoria || "").toLowerCase();
      let potencialValor = 2000;
      if (cat.includes("clinica") || cat.includes("advocacia")) potencialValor = 3500;
      else if (cat.includes("restaurante") || cat.includes("estetica")) potencialValor = 2500;

      return {
        lead: l,
        latitude: lat,
        longitude: lng,
        score: l.score,
        nivel,
        potencialValor,
      };
    });
  },

  calcularResumoRegiao(pontos: PontoMapa[], cidadeNome = "Região Mapeada"): ResumoRegiaoMapa {
    if (pontos.length === 0) {
      return {
        cidade: cidadeNome,
        totalEmpresas: 0,
        totalOportunidades: 0,
        scoreMedio: 0,
        potencialEstimadoTotal: 0,
        semSitePercentual: 0,
      };
    }

    const totalEmpresas = pontos.length;
    const totalOportunidades = pontos.filter((p) => p.nivel === "alta" || p.nivel === "qualificado").length;
    const somaScore = pontos.reduce((acc, p) => acc + p.score, 0);
    const scoreMedio = Math.round(somaScore / totalEmpresas);
    const potencialEstimadoTotal = pontos.reduce((acc, p) => acc + p.potencialValor, 0);
    const semSiteCount = pontos.filter((p) => !p.lead.tem_site).length;
    const semSitePercentual = Math.round((semSiteCount / totalEmpresas) * 100);

    return {
      cidade: cidadeNome,
      totalEmpresas,
      totalOportunidades,
      scoreMedio,
      potencialEstimadoTotal,
      semSitePercentual,
    };
  },
};
