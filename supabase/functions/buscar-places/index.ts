import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  categoria: string;
  regiao: string;
  raio_km?: number;
}

const REDES_SOCIAIS_DOMINIOS = [
  "instagram.com",
  "facebook.com",
  "fb.com",
  "linktr.ee",
  "wa.me",
  "api.whatsapp.com",
  "tiktok.com",
  "linkedin.com",
  "twitter.com",
  "x.com",
  "smartbarbers.com.br",
  "agendamento",
  "hub.me",
];

function ehRedeSocial(url?: string | null): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return REDES_SOCIAIS_DOMINIOS.some((dom) => lower.includes(dom));
}

function extrairInstagram(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/instagram\.com\/([a-zA-Z0-9_.-]+)/i);
  return match ? match[1].replace(/\/$/, "") : null;
}

function extrairFacebook(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/facebook\.com\/([a-zA-Z0-9_.-]+)/i);
  return match ? match[1].replace(/\/$/, "") : null;
}

function calcularScoreLead(dados: {
  tem_site: boolean;
  instagram?: string | null;
  facebook?: string | null;
  total_avaliacoes?: number | null;
  avaliacao_google?: number | null;
}): number {
  let score = 0;

  // 1. Sem site próprio (peso alto: 45 pontos)
  if (!dados.tem_site) {
    score += 45;
  }

  // 2. Tem rede social mas não tem site (15 pontos)
  const temRede = Boolean(dados.instagram || dados.facebook);
  if (!dados.tem_site && temRede) {
    score += 15;
  }

  // 3. Número de avaliações no Google (máximo 20 pontos)
  const avaliacoes = dados.total_avaliacoes ?? 0;
  if (avaliacoes > 0) {
    score += Math.min(20, Math.round((avaliacoes / 50) * 20));
  }

  // 4. Nota média no Google (máximo 15 pontos)
  const nota = dados.avaliacao_google ?? 0;
  if (nota > 0) {
    score += Math.round((Math.min(5, nota) / 5) * 15);
  }

  // 5. Recência (5 pontos)
  score += 5;

  return Math.min(100, Math.max(0, score));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { categoria, regiao, raio_km = 5 }: RequestBody = await req.json();

    if (!categoria || !regiao) {
      return new Response(
        JSON.stringify({ error: "Parâmetros 'categoria' e 'regiao' são obrigatórios." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey =
      Deno.env.get("GOOGLE_PLACES_API_KEY") ||
      Deno.env.get("GOOGLE_MAPS_API_KEY") ||
      "AIzaSyDwHq_r-lT6by7IsEVzKZrvVn_et7ds73M";

    let estabelecimentos: any[] = [];

    // Chamada real para Google Places API (New Text Search)
    const query = `${categoria} em ${regiao}`;
    const url = "https://places.googleapis.com/v1/places:searchText";

    const placesRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.internationalPhoneNumber,places.rating,places.userRatingCount,places.location,places.primaryTypeDisplayName,places.shortFormattedAddress",
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: "pt-BR",
        maxResultCount: 20,
      }),
    });

    if (placesRes.ok) {
      const data = await placesRes.json();
      const places = data.places || [];

      estabelecimentos = places.map((p: any) => {
        const rawWebsite = p.websiteUri || null;
        const ehSocial = ehRedeSocial(rawWebsite);
        const tem_site = Boolean(rawWebsite && !ehSocial);

        const instagram =
          ehSocial && rawWebsite?.includes("instagram.com")
            ? extrairInstagram(rawWebsite)
            : rawWebsite?.includes("instagram")
            ? rawWebsite
            : null;

        const facebook =
          ehSocial && (rawWebsite?.includes("facebook.com") || rawWebsite?.includes("fb.com"))
            ? extrairFacebook(rawWebsite)
            : null;

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
        });

        const endereco = p.formattedAddress || p.shortFormattedAddress || regiao;
        const partes = endereco.split("-");
        const bairro = partes.length > 1 ? partes[1].split(",")[0].trim() : regiao;
        const cidade = regiao.split(",")[0].trim();

        return {
          idTemp: `gp-${p.id}`,
          nome: p.displayName?.text || categoria,
          categoria: p.primaryTypeDisplayName?.text || categoria,
          endereco,
          bairro,
          cidade,
          estado: "BA",
          latitude: p.location?.latitude ?? null,
          longitude: p.location?.longitude ?? null,
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
          origem: "google_places",
          selecionado: !tem_site, // Seleciona por padrão as empresas SEM site próprio
        };
      });
    }

    // Ordenar por score de prioridade decrescente
    estabelecimentos.sort((a, b) => b.score - a.score);

    return new Response(
      JSON.stringify({
        termo_busca: `${categoria} ${regiao}`.trim(),
        total: estabelecimentos.length,
        total_sem_site: estabelecimentos.filter((e) => !e.tem_site).length,
        resultados: estabelecimentos,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao processar busca de leads" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
