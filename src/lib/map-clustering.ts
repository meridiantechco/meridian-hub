import Supercluster from "supercluster";
import type { LeadItem } from "@/lib/leads-mock";

export type LeadComCoords = LeadItem & {
  latEfetiva: number;
  lngEfetiva: number;
  distancia?: number;
  dentroDoRaio?: boolean;
  dentroDosBounds?: boolean;
};

export interface LeadGeoFeature {
  type: "Feature";
  properties: {
    cluster: false;
    leadId: string;
    lead: LeadComCoords;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface ClusterFeature {
  type: "Feature";
  properties: {
    cluster: true;
    cluster_id: number;
    point_count: number;
    point_count_abbreviated: string | number;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export type ElementoMapa = LeadGeoFeature | ClusterFeature;

export class MotorClustering {
  private supercluster: Supercluster<{ cluster: false; leadId: string; lead: LeadComCoords }>;

  constructor() {
    this.supercluster = new Supercluster({
      radius: 60,
      maxZoom: 16,
      minPoints: 2,
    });
  }

  carregarLeads(leads: LeadComCoords[]) {
    const features: LeadGeoFeature[] = leads
      .filter((l) => typeof l.latEfetiva === "number" && typeof l.lngEfetiva === "number")
      .map((lead) => ({
        type: "Feature" as const,
        properties: {
          cluster: false as const,
          leadId: lead.id,
          lead,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [lead.lngEfetiva, lead.latEfetiva],
        },
      }));

    this.supercluster.load(features);
  }

  obterElementos(
    bbox: [number, number, number, number], // [west, south, east, north]
    zoom: number
  ): ElementoMapa[] {
    try {
      const zoomInt = Math.floor(Math.max(0, Math.min(18, zoom)));
      return this.supercluster.getClusters(bbox, zoomInt) as ElementoMapa[];
    } catch (err) {
      console.warn("Erro ao obter clusters do supercluster:", err);
      return [];
    }
  }

  obterZoomExpansao(clusterId: number): number {
    try {
      return this.supercluster.getClusterExpansionZoom(clusterId);
    } catch {
      return 15;
    }
  }
}
