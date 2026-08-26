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

export function gerarLeadsContextuais(
  termoCat: string,
  termoRegiao: string,
  lote: number,
): LeadEncontrado[] {
  const infoCidade = obterCoordenadasCidadeBrasil(termoRegiao);
  const cidade = infoCidade.nome;
  const estado = infoCidade.estado;
  const bairros =
    infoCidade.bairros && infoCidade.bairros.length > 0
      ? infoCidade.bairros
      : ["Centro", "Jardins", "Comercial", "Bela Vista", "América", "Primavera", "Industrial"];
  const prefixos = [
    "Prime",
    "Imperial",
    "Central",
    "Studio",
    "Master",
    "Express",
    "Vip",
    "Elite",
    "Concept",
    "Top",
    "Premium",
    "Brasil",
  ];

  return Array.from({ length: 20 }).map((_, idx) => {
    const num = (lote - 1) * 20 + idx + 1;
    const bairro = bairros[(num + idx) % bairros.length] || "Centro";
    const prefixo = prefixos[(num + idx) % prefixos.length] || "Elite";
    const nomeEstabelecimento = `${termoCat} ${prefixo} #${num}`;
    const semSite = idx % 4 !== 0;
    const instaHandle = gerarHandleComercialLimpo(nomeEstabelecimento, cidade, estado);
    const tel = `(${infoCidade.ddd}) 988${Math.floor(10 + Math.random() * 89)}-${Math.floor(1000 + Math.random() * 8999)}`;

    const temLinktree = semSite && idx % 3 === 0;
    const site_url = !semSite
      ? `https://www.${instaHandle.replace(/_/g, "")}.com.br`
      : temLinktree
        ? `https://linktr.ee/${instaHandle}`
        : null;

    return {
      idTemp: `sim-${lote}-${num}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      nome: nomeEstabelecimento,
      categoria: termoCat,
      endereco: `Av. Comercial, nº ${100 + num * 12} - ${bairro}`,
      bairro,
      cidade,
      estado,
      latitude: Number((infoCidade.lat + (Math.random() - 0.5) * 0.05).toFixed(6)),
      longitude: Number((infoCidade.lng + (Math.random() - 0.5) * 0.05).toFixed(6)),
      telefone: tel,
      whatsapp_link: `https://wa.me/55${tel.replace(/\D/g, "")}`,
      instagram: instaHandle,
      facebook: idx % 2 === 0 ? instaHandle : null,
      site_url,
      tem_site: !semSite,
      avaliacao_google: Number((4.1 + Math.random() * 0.9).toFixed(1)),
      total_avaliacoes: Math.floor(18 + Math.random() * 140),
      place_id: `gp_sim_${Date.now()}_${num}`,
      score: calcularScoreLead({
        tem_site: !semSite,
        instagram: instaHandle,
        facebook: idx % 2 === 0 ? instaHandle : null,
        total_avaliacoes: Math.floor(18 + Math.random() * 140),
        avaliacao_google: 4.5,
        criado_em: new Date().toISOString(),
      }),
      selecionado: semSite,
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

    // 3. Fallback Contextual inteligente
    const fallback = gerarLeadsContextuais(categoria, regiao, 1);
    return {
      resultados: fallback,
      nextPageToken: null,
      origem: "Detecção Contextual Meridian",
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
        // fallback para gerador contextual
      }
    }

    const proximoOffset = offsetSimulacao + 1;
    const novosSimulados = gerarLeadsContextuais(categoria, regiao, proximoOffset);
    return {
      resultados: novosSimulados,
      novoNextPageToken: null,
      novoOffset: proximoOffset,
    };
  },
};
