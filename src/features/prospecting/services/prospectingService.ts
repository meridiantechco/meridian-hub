import { supabase } from "@/integrations/supabase/client";
import {
  extrairLocalizacaoCompleta,
  obterCoordenadasCidadeBrasil,
} from "@/lib/geo-brasil";
import {
  extrairFacebookAvancado,
  extrairOuResolverInstagram,
  ehRedeSocialOuAgregador,
  gerarHandleComercialLimpo,
} from "@/features/leads";
import { calcularScoreLead } from "@/features/leads";
import type { LeadEncontrado } from "../types";

export function formatarPlacesParaLeads(
  places: any[],
  termoCat: string,
  termoRegiao: string,
): LeadEncontrado[] {
  return places.map((p: any) => {
    const rawWebsite = p.websiteUri || null;
    const ehSocial = ehRedeSocialOuAgregador(rawWebsite);
    const tem_site = Boolean(rawWebsite && !ehSocial);

    const nomeTexto = p.displayName?.text || termoCat;
    const descTexto = p.editorialSummary?.text || "";

    const loc = extrairLocalizacaoCompleta(
      p.formattedAddress || p.shortFormattedAddress,
      termoRegiao,
    );

    const instagram = extrairOuResolverInstagram(
      rawWebsite,
      nomeTexto,
      descTexto,
      loc.cidade,
      loc.estado,
    );
    const facebook = extrairFacebookAvancado(rawWebsite, nomeTexto);

    const site_url = tem_site ? rawWebsite : null;
    const tel = p.nationalPhoneNumber || p.internationalPhoneNumber || "";
    const totalAval = p.userRatingCount || 0;
    const nota = p.rating || null;

    const score = calcularScoreLead({
      tem_site,
      instagram,
      facebook,
      total_avaliacoes: totalAval,
      avaliacao_google: nota,
      criado_em: new Date().toISOString(),
    });

    return {
      idTemp: `gp-${p.id}`,
      nome: nomeTexto,
      categoria: p.primaryTypeDisplayName?.text || termoCat,
      endereco: loc.endereco,
      bairro: loc.bairro,
      cidade: loc.cidade,
      estado: loc.estado,
      latitude: typeof p.location?.latitude === "number" ? p.location.latitude : null,
      longitude: typeof p.location?.longitude === "number" ? p.location.longitude : null,
      telefone: tel,
      whatsapp_link: tel ? `https://wa.me/55${tel.replace(/\D/g, "")}` : null,
      instagram,
      facebook,
      site_url,
      tem_site,
      avaliacao_google: nota,
      total_avaliacoes: totalAval,
      place_id: p.id,
      score,
      selecionado: !tem_site,
    };
  });
}

export const prospectingService = {
  async buscarEstabelecimentos(
    categoria: string,
    regiao: string,
    raioKm: number,
  ): Promise<{
    resultados: LeadEncontrado[];
    nextPageToken: string | null;
    origem: string;
  }> {
    const queryTexto = `${categoria.trim()} em ${regiao.trim()}`;
    const apiKey =
      (import.meta.env["VITE_GOOGLE_PLACES_API_KEY"] as string) ||
      (import.meta.env["VITE_GOOGLE_MAPS_API_KEY"] as string) ||
      "AIzaSyDwHq_r-lT6by7IsEVzKZrvVn_et7ds73M";

    // 1. Tentar Edge Function Supabase
    try {
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke(
        "buscar-places",
        {
          body: {
            categoria: categoria.trim(),
            regiao: regiao.trim(),
            raio_km: raioKm,
          },
        },
      );

      if (
        !edgeError &&
        edgeData?.resultados &&
        Array.isArray(edgeData.resultados) &&
        edgeData.resultados.length > 0
      ) {
        return {
          resultados: edgeData.resultados,
          nextPageToken: edgeData.nextPageToken || null,
          origem: "Google Places API (Edge Function)",
        };
      }
    } catch {
      // continua para chamada direta
    }

    // 2. Chamada Direta Google Places API
    try {
      const placesRes = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.internationalPhoneNumber,places.rating,places.userRatingCount,places.location,places.primaryTypeDisplayName,places.shortFormattedAddress,places.editorialSummary,nextPageToken",
        },
        body: JSON.stringify({
          textQuery: queryTexto,
          languageCode: "pt-BR",
          maxResultCount: 20,
        }),
      });

      if (placesRes.ok) {
        const data = await placesRes.json();
        const places = data.places || [];
        if (places.length > 0) {
          const estabelecimentos = formatarPlacesParaLeads(places, categoria, regiao);
          estabelecimentos.sort((a, b) => b.score - a.score);
          return {
            resultados: estabelecimentos,
            nextPageToken: data.nextPageToken || null,
            origem: "Google Places API",
          };
        }
      }
    } catch {
      // fallback
    }

    // Se não encontrar resultados
    return {
      resultados: [],
      nextPageToken: null,
      origem: "Google Places API (0 encontrados)",
    };
  },

  async carregarMaisEstabelecimentos(
    categoria: string,
    regiao: string,
    nextPageToken: string | null,
    offsetSimulacao: number,
  ): Promise<{
    resultados: LeadEncontrado[];
    novoNextPageToken: string | null;
    novoOffset: number;
  }> {
    const queryTexto = `${categoria.trim()} em ${regiao.trim()}`;
    const apiKey =
      (import.meta.env["VITE_GOOGLE_PLACES_API_KEY"] as string) ||
      (import.meta.env["VITE_GOOGLE_MAPS_API_KEY"] as string) ||
      "AIzaSyDwHq_r-lT6by7IsEVzKZrvVn_et7ds73M";

    if (nextPageToken) {
      try {
        const placesRes = await fetch("https://places.googleapis.com/v1/places:searchText", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask":
              "places.id,places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.internationalPhoneNumber,places.rating,places.userRatingCount,places.location,places.primaryTypeDisplayName,places.shortFormattedAddress,places.editorialSummary,nextPageToken",
          },
          body: JSON.stringify({
            textQuery: queryTexto,
            languageCode: "pt-BR",
            maxResultCount: 20,
            pageToken: nextPageToken,
          }),
        });

        if (placesRes.ok) {
          const data = await placesRes.json();
          const novosPlaces = data.places || [];
          if (novosPlaces.length > 0) {
            const novosFormatados = formatarPlacesParaLeads(novosPlaces, categoria, regiao);
            return {
              resultados: novosFormatados,
              novoNextPageToken: data.nextPageToken || null,
              novoOffset: offsetSimulacao,
            };
          }
        }
      } catch {
        // falha na paginação
      }
    }

    return {
      resultados: [],
      novoNextPageToken: null,
      novoOffset: offsetSimulacao,
    };
  },

  async excluirBusca(id: string): Promise<boolean> {
    const { error } = await supabase.from("buscas").delete().eq("id", id);
    if (error) {
      console.error("Erro ao excluir busca:", error);
      return false;
    }
    return true;
  },
};
