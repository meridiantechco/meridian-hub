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

const DOMINIOS_NAO_SITE = [
  "instagram.com",
  "instagr.am",
  "ig.me",
  "threads.net",
  "facebook.com",
  "fb.com",
  "fb.me",
  "m.facebook.com",
  "web.facebook.com",
  "linktr.ee",
  "beacons.ai",
  "taplink.cc",
  "taplink.bio",
  "bio.site",
  "instabio.cc",
  "msha.ke",
  "heylink.me",
  "flow.page",
  "linkr.bio",
  "solo.to",
  "campsite.bio",
  "myslink.app",
  "hub.me",
  "vlink.bio",
  "linklist.bio",
  "meulink.app",
  "bio.link",
  "wa.me",
  "api.whatsapp.com",
  "chat.whatsapp.com",
  "whatsapp.com",
  "tiktok.com",
  "linkedin.com",
  "twitter.com",
  "x.com",
  "smartbarbers.com.br",
  "agendamento",
  "trinks.com.br",
  "avec.app",
  "ifood.com.br",
  "rappi.com.br",
  "ubereats.com",
  "pedir.delivery",
  "cardapio.to",
  "ola.click",
  "cardapiodigital.io",
  "menudino.com",
  "deliverydireto.com.br",
  "anota.ai",
  "doctoralia.com.br",
  "guiamais.com.br",
  "telelistas.net",
  "apontador.com.br",
  "tripadvisor.com",
  "tripadvisor.com.br",
  "sympla.com.br",
  "eventbrite.com",
  "bit.ly",
  "tinyurl.com",
  "encurtador.com.br",
];

const INSTAGRAM_ROTAS_RESERVADAS = new Set([
  "p",
  "reel",
  "reels",
  "stories",
  "explore",
  "accounts",
  "direct",
  "tv",
  "about",
  "legal",
  "developer",
  "privacy",
  "terms",
  "home",
  "login",
  "signup",
  "help",
  "press",
  "api",
  "directory",
  "locations",
  "tags",
  "channel",
  "share",
  "settings",
]);

const AGREGADORES_SLUGS_RESERVADOS = new Set([
  "home",
  "login",
  "register",
  "app",
  "pricing",
  "blog",
  "terms",
  "privacy",
  "help",
  "dashboard",
  "admin",
  "signup",
  "about",
  "contact",
  "support",
  "auth",
  "link",
  "bio",
  "redirect",
]);

function ehRedeSocial(url?: string | null): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return DOMINIOS_NAO_SITE.some((dom) => lower.includes(dom));
}

function sanitizarHandleInstagram(handle?: string | null): string | null {
  if (!handle) return null;
  let limpo = handle
    .replace(/^https?:\/\/(?:www\.)?(?:instagram\.com|instagr\.am|ig\.me\/m)\//i, "")
    .replace(/^[#@]/, "")
    .trim();

  limpo = limpo.split(/[?#&/]/)[0] ?? "";
  limpo = limpo.replace(/[^a-zA-Z0-9_.-]/g, "").toLowerCase();
  limpo = limpo.replace(/^[._-]+|[._-]+$/g, "");

  if (limpo.length < 2 || limpo.length > 30) return null;
  if (INSTAGRAM_ROTAS_RESERVADAS.has(limpo)) return null;
  if (AGREGADORES_SLUGS_RESERVADOS.has(limpo)) return null;

  const invalidos = [
    "gmail",
    "hotmail",
    "yahoo",
    "outlook",
    "facebook",
    "whatsapp",
    "contato",
    "atendimento",
  ];
  if (invalidos.includes(limpo)) return null;

  return limpo;
}

function extrairInstagram(
  url?: string | null,
  nomeEmpresa?: string | null,
  textoExtra?: string | null,
): string | null {
  if (url) {
    const rawUrl = url.trim();

    // A) URL direta do Instagram
    const matchInstagram = rawUrl.match(
      /(?:instagram\.com|instagr\.am|ig\.me\/m)\/(?:@)?([a-zA-Z0-9_.-]{2,35})/i,
    );
    if (matchInstagram?.[1]) {
      const handle = sanitizarHandleInstagram(matchInstagram[1]);
      if (handle) return handle;
    }

    // B) URL de agregador (Linktree, Beacons, Taplink, etc.)
    const matchAgregador = rawUrl.match(
      /(?:linktr\.ee|beacons\.ai|taplink\.cc|taplink\.bio|bio\.site|instabio\.cc|msha\.ke|heylink\.me|flow\.page|linkr\.bio|solo\.to|campsite\.bio|myslink\.app|bio\.link)\/([a-zA-Z0-9_.-]{2,35})/i,
    );
    if (matchAgregador?.[1]) {
      const handle = sanitizarHandleInstagram(matchAgregador[1]);
      if (handle) return handle;
    }

    // C) Parâmetro codificado
    const matchParam = rawUrl.match(/(?:instagram|ig|insta)=(?:@)?([a-zA-Z0-9_.-]{2,35})/i);
    if (matchParam?.[1]) {
      const handle = sanitizarHandleInstagram(matchParam[1]);
      if (handle) return handle;
    }
  }

  if (nomeEmpresa) {
    const matchNomeArroba = nomeEmpresa.match(
      /(?:^|\s|\(|\[)@([a-zA-Z0-9_.-]{3,30})(?:\)|\]|\s|$)/i,
    );
    if (matchNomeArroba?.[1]) {
      const handle = sanitizarHandleInstagram(matchNomeArroba[1]);
      if (handle) return handle;
    }

    const matchNomeTexto = nomeEmpresa.match(/(?:insta(?:gram)?|ig):\s*@?([a-zA-Z0-9_.-]{3,30})/i);
    if (matchNomeTexto?.[1]) {
      const handle = sanitizarHandleInstagram(matchNomeTexto[1]);
      if (handle) return handle;
    }
  }

  if (textoExtra) {
    const matchTextoUrl = textoExtra.match(
      /(?:instagram\.com\/|instagr\.am\/)(?:@)?([a-zA-Z0-9_.-]{2,35})/i,
    );
    if (matchTextoUrl?.[1]) {
      const handle = sanitizarHandleInstagram(matchTextoUrl[1]);
      if (handle) return handle;
    }

    const matchTextoArroba = textoExtra.match(
      /(?:insta(?:gram)?|ig|siga(?:-nos)?):\s*@?([a-zA-Z0-9_.-]{3,30})/i,
    );
    if (matchTextoArroba?.[1]) {
      const handle = sanitizarHandleInstagram(matchTextoArroba[1]);
      if (handle) return handle;
    }
  }

  return null;
}

function gerarHandleComercialLimpo(nome: string): string {
  if (!nome || !nome.trim()) return "perfil_comercial";

  const limpo = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(ltda|epp|me|s\/a|sa|eireli|mei|cnpj|unidade|filial|matriz)\b/gi, "")
    .replace(/&/g, "e")
    .replace(/[@#]/g, "")
    .replace(/[-–—/\\|:,.()]/g, " ")
    .trim();

  const stopWords = new Set([
    "de",
    "do",
    "da",
    "dos",
    "das",
    "em",
    "no",
    "na",
    "nos",
    "nas",
    "para",
    "por",
    "com",
    "e",
  ]);
  const todasPalavras = limpo.split(/\s+/).filter(Boolean);

  const palavrasSignificativas = todasPalavras.filter(
    (p) => !stopWords.has(p) || todasPalavras.length <= 2,
  );
  const palavras = palavrasSignificativas.length > 0 ? palavrasSignificativas : todasPalavras;

  if (palavras.length === 0) return "perfil_comercial";

  let handle = "";
  if (palavras.length === 1) {
    handle = `${palavras[0]}_oficial`;
  } else if (palavras.length === 2) {
    handle = `${palavras[0]}_${palavras[1]}`;
  } else {
    handle = `${palavras[0]}_${palavras[1]}_${palavras[2]}`;
  }

  if (handle.length > 26) {
    handle = palavras.slice(0, 3).join("");
  }

  handle = handle.replace(/[^a-z0-9_.]/g, "").replace(/^[._-]+|[._-]+$/g, "");

  if (handle.length > 28) {
    handle = handle.slice(0, 28);
  }

  return handle || "perfil_comercial";
}

function extrairOuResolverInstagram(
  url?: string | null,
  nomeEmpresa?: string | null,
  textoExtra?: string | null,
): string {
  const extraido = extrairInstagram(url, nomeEmpresa, textoExtra);
  if (extraido) return extraido;

  if (nomeEmpresa) {
    return gerarHandleComercialLimpo(nomeEmpresa);
  }

  return "perfil_comercial";
}

function extrairFacebook(url?: string | null, nomeEmpresa?: string | null): string | null {
  if (url) {
    const rawUrl = url.trim();
    const match = rawUrl.match(
      /(?:facebook\.com|fb\.com|fb\.me)\/(?:pages\/[^/]+\/)?([a-zA-Z0-9_.-]{3,50})/i,
    );
    if (match?.[1]) {
      const slug =
        match[1]
          .split(/[?#&/]/)[0]
          ?.replace(/^@/, "")
          .trim() || "";
      const invalidosFb = [
        "sharer",
        "share",
        "login",
        "dialog",
        "events",
        "groups",
        "help",
        "policies",
        "settings",
        "marketplace",
        "watch",
      ];
      if (slug.length >= 3 && !invalidosFb.includes(slug.toLowerCase())) {
        return slug;
      }
    }
  }

  if (nomeEmpresa) {
    const matchFaceTexto = nomeEmpresa.match(/(?:face(?:book)?|fb):\s*([a-zA-Z0-9_.-]{3,40})/i);
    if (matchFaceTexto?.[1]) {
      return matchFaceTexto[1].replace(/^@/, "").trim();
    }
  }

  return null;
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
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
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
          "places.id,places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.internationalPhoneNumber,places.rating,places.userRatingCount,places.location,places.primaryTypeDisplayName,places.shortFormattedAddress,places.editorialSummary",
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

        const nomeTexto = p.displayName?.text || "";
        const descTexto = p.editorialSummary?.text || "";

        // Automaticamente extrai ou resolve o Instagram diretamente na busca
        const instagram = extrairOuResolverInstagram(rawWebsite, nomeTexto, descTexto);
        const facebook = extrairFacebook(rawWebsite, nomeTexto);

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
        const ufs = [
          "AC",
          "AL",
          "AP",
          "AM",
          "BA",
          "CE",
          "DF",
          "ES",
          "GO",
          "MA",
          "MT",
          "MS",
          "MG",
          "PA",
          "PB",
          "PR",
          "PE",
          "PI",
          "RJ",
          "RN",
          "RS",
          "RO",
          "RR",
          "SC",
          "SP",
          "SE",
          "TO",
        ];

        let estadoDetectado = "SP";
        for (const uf of ufs) {
          const re = new RegExp(`(?:[,-/\\s]|^)\\s*(${uf})(?:[,-/\\s]|$|\\d)`, "i");
          if (re.test(endereco) || re.test(regiao)) {
            estadoDetectado = uf;
            break;
          }
        }

        const partes = endereco.split("-");
        const bairro = partes.length > 1 ? partes[1].split(",")[0].trim() : regiao;
        const cidade = regiao.split(/[,-]/)[0].trim();

        return {
          idTemp: `gp-${p.id}`,
          nome: nomeTexto || categoria,
          categoria: p.primaryTypeDisplayName?.text || categoria,
          endereco,
          bairro,
          cidade,
          estado: estadoDetectado,
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
          selecionado: !tem_site,
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
      },
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao processar busca de leads" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
