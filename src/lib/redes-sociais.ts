/**
 * Utilitários avançados para detecção, extração e busca de Redes Sociais
 * e classificação de presença digital de estabelecimentos comerciais.
 */

// Domínios que NÃO configuram site próprio (são redes sociais, agregadores de bio, cardápios, marketplaces ou diretórios)
export const DOMINIOS_NAO_SITE_PROPRIO = [
  // Instagram
  "instagram.com",
  "instagr.am",
  "ig.me",
  "threads.net",

  // Facebook
  "facebook.com",
  "fb.com",
  "fb.me",
  "m.facebook.com",
  "web.facebook.com",

  // Agregadores de Links / Bio
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

  // WhatsApp
  "wa.me",
  "api.whatsapp.com",
  "chat.whatsapp.com",
  "whatsapp.com",

  // Outras Redes
  "tiktok.com",
  "linkedin.com",
  "twitter.com",
  "x.com",
  "youtube.com",
  "pinterest.com",

  // Cardápios digitais, Agendamentos & Marketplaces de Delivery
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
  "ccardapio.com",
  "yooga.com.br",
  "grandchef.com.br",

  // Diretórios & Guias Locais
  "doctoralia.com.br",
  "guiamais.com.br",
  "telelistas.net",
  "apontador.com.br",
  "tripadvisor.com",
  "tripadvisor.com.br",
  "sympla.com.br",
  "eventbrite.com",

  // Encurtadores de links
  "bit.ly",
  "tinyurl.com",
  "encurtador.com.br",
  "abre.ai",
  "cutt.ly",
  "is.gd",
];

// Termos reservados no Instagram que NÃO são nomes de usuários válidos
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

// Slugs genéricos em Link aggregators que NÃO são o nome da empresa
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
  "me",
]);

export type TipoPresencaDigital =
  | "sem_site"
  | "instagram"
  | "facebook"
  | "link_bio"
  | "whatsapp"
  | "cardapio_delivery"
  | "agendamento"
  | "diretorio"
  | "site_proprio";

/**
 * Verifica se a URL informada não é um site próprio (ou seja, é rede social, bio, marketplace ou diretório)
 */
export function ehRedeSocialOuAgregador(url?: string | null): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return DOMINIOS_NAO_SITE_PROPRIO.some((dom) => lower.includes(dom));
}

/**
 * Identifica a categoria exata da presença digital
 */
export function identificarTipoPresencaDigital(url?: string | null): {
  tipo: TipoPresencaDigital;
  rotulo: string;
  descricao: string;
  badgeClasse: string;
} {
  if (!url || !url.trim()) {
    return {
      tipo: "sem_site",
      rotulo: "Sem site próprio",
      descricao: "Nenhum website ou link cadastrado no Google",
      badgeClasse:
        "bg-[var(--color-alerta)]/15 text-[var(--color-alerta)] border-[var(--color-alerta)]/30",
    };
  }

  const lower = url.toLowerCase();

  if (lower.includes("instagram.com") || lower.includes("instagr.am") || lower.includes("ig.me")) {
    return {
      tipo: "instagram",
      rotulo: "Perfil Instagram",
      descricao: "Usa o Instagram como endereço principal",
      badgeClasse: "bg-pink-500/15 text-pink-400 border-pink-500/30",
    };
  }

  if (lower.includes("facebook.com") || lower.includes("fb.com") || lower.includes("fb.me")) {
    return {
      tipo: "facebook",
      rotulo: "Página Facebook",
      descricao: "Usa o Facebook como endereço principal",
      badgeClasse: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    };
  }

  if (
    lower.includes("linktr.ee") ||
    lower.includes("beacons.ai") ||
    lower.includes("taplink") ||
    lower.includes("bio.site") ||
    lower.includes("instabio") ||
    lower.includes("msha.ke") ||
    lower.includes("heylink") ||
    lower.includes("flow.page") ||
    lower.includes("linkr.bio") ||
    lower.includes("solo.to") ||
    lower.includes("bio.link")
  ) {
    return {
      tipo: "link_bio",
      rotulo: "Link na Bio / Agregador",
      descricao: "Usa página de links rápidos (Linktree/Beacons)",
      badgeClasse: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    };
  }

  if (
    lower.includes("wa.me") ||
    lower.includes("api.whatsapp.com") ||
    lower.includes("whatsapp.com")
  ) {
    return {
      tipo: "whatsapp",
      rotulo: "Link WhatsApp",
      descricao: "Redireciona diretamente para chat do WhatsApp",
      badgeClasse: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    };
  }

  if (
    lower.includes("ifood.com.br") ||
    lower.includes("cardapio") ||
    lower.includes("ola.click") ||
    lower.includes("menudino") ||
    lower.includes("deliverydireto") ||
    lower.includes("anota.ai") ||
    lower.includes("rappi") ||
    lower.includes("pedir.delivery")
  ) {
    return {
      tipo: "cardapio_delivery",
      rotulo: "Cardápio / Delivery",
      descricao: "Usa plataforma de pedidos de terceiros",
      badgeClasse: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    };
  }

  if (
    lower.includes("smartbarbers") ||
    lower.includes("agendamento") ||
    lower.includes("trinks") ||
    lower.includes("avec")
  ) {
    return {
      tipo: "agendamento",
      rotulo: "Agendamento",
      descricao: "Usa aplicativo de agendamento online",
      badgeClasse: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    };
  }

  if (
    lower.includes("doctoralia") ||
    lower.includes("guiamais") ||
    lower.includes("telelistas") ||
    lower.includes("apontador") ||
    lower.includes("tripadvisor")
  ) {
    return {
      tipo: "diretorio",
      rotulo: "Diretório / Guia",
      descricao: "Página em lista telefônica ou guia comercial",
      badgeClasse: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
    };
  }

  return {
    tipo: "site_proprio",
    rotulo: "Site Próprio",
    descricao: "Domínio independente da empresa",
    badgeClasse: "bg-slate-700/40 text-muted-foreground border-border",
  };
}

/**
 * Sanitiza e valida um handle de Instagram
 */
export function sanitizarHandleInstagram(handle?: string | null): string | null {
  if (!handle) return null;

  // Remove protocolo, domínio e tags se vier como URL
  let limpo = handle
    .replace(/^https?:\/\/(?:www\.)?(?:instagram\.com|instagr\.am|ig\.me\/m)\//i, "")
    .replace(/^[#@]/, "")
    .trim();

  // Remove parâmetros de consulta e hash
  limpo = limpo.split(/[?#&/]/)[0] ?? "";
  limpo = limpo.replace(/[^a-zA-Z0-9_.-]/g, "").toLowerCase();

  // Remove pontos e traços no final
  limpo = limpo.replace(/^[._-]+|[._-]+$/g, "");

  if (limpo.length < 2 || limpo.length > 30) return null;
  if (INSTAGRAM_ROTAS_RESERVADAS.has(limpo)) return null;
  if (AGREGADORES_SLUGS_RESERVADOS.has(limpo)) return null;

  // Ignorar palavras comuns de e-mail ou redes incompatíveis
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

/**
 * Extrai o Instagram a partir de múltiplas fontes explícitas:
 * 1. URL do site (Instagram direto, Linktree, Beacons, Taplink, etc.)
 * 2. Nome do estabelecimento (ex: "Studio Bella (@studiobellahair)")
 * 3. Descrição editorial ou texto adicional
 */
export function extrairInstagramAvancado(
  url?: string | null,
  nomeEmpresa?: string | null,
  textoExtra?: string | null,
): string | null {
  // 1. Extração via URL
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

    // B) URL de Bio Aggregator (Linktree, Beacons, Taplink, Bio.site, etc.)
    const matchAgregador = rawUrl.match(
      /(?:linktr\.ee|beacons\.ai|taplink\.cc|taplink\.bio|bio\.site|instabio\.cc|msha\.ke|heylink\.me|flow\.page|linkr\.bio|solo\.to|campsite\.bio|myslink\.app|bio\.link)\/([a-zA-Z0-9_.-]{2,35})/i,
    );
    if (matchAgregador?.[1]) {
      const handle = sanitizarHandleInstagram(matchAgregador[1]);
      if (handle) return handle;
    }

    // C) URL com parâmetro codificado do Instagram
    const matchParam = rawUrl.match(/(?:instagram|ig|insta)=(?:@)?([a-zA-Z0-9_.-]{2,35})/i);
    if (matchParam?.[1]) {
      const handle = sanitizarHandleInstagram(matchParam[1]);
      if (handle) return handle;
    }
  }

  // 2. Extração via Nome do Estabelecimento (ex: "Barbearia Dom @dombarber", "Salão (@salaobella)")
  if (nomeEmpresa) {
    // Padrão com arroba explícito: @handle ou (@handle) ou [@handle]
    const matchNomeArroba = nomeEmpresa.match(
      /(?:^|\s|\(|\[)@([a-zA-Z0-9_.-]{3,30})(?:\)|\]|\s|$)/i,
    );
    if (matchNomeArroba?.[1]) {
      const handle = sanitizarHandleInstagram(matchNomeArroba[1]);
      if (handle) return handle;
    }

    // Padrão textual: "Insta: handle" ou "Instagram: handle"
    const matchNomeTexto = nomeEmpresa.match(/(?:insta(?:gram)?|ig):\s*@?([a-zA-Z0-9_.-]{3,30})/i);
    if (matchNomeTexto?.[1]) {
      const handle = sanitizarHandleInstagram(matchNomeTexto[1]);
      if (handle) return handle;
    }
  }

  // 3. Extração via Texto Extra (editorialSummary, descrições do Google)
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

    const matchArrobaGeral = textoExtra.match(/@([a-zA-Z0-9_.-]{3,30})/i);
    if (matchArrobaGeral?.[1]) {
      const handle = sanitizarHandleInstagram(matchArrobaGeral[1]);
      if (handle) return handle;
    }
  }

  return null;
}

/**
 * Gera automaticamente um handle de Instagram comercial natural e autêntico
 * baseado no nome fantasia do estabelecimento e localização.
 */
export function gerarHandleComercialLimpo(
  nome: string,
  cidade?: string | null,
  estado?: string | null,
): string {
  if (!nome || !nome.trim()) return "perfil_comercial";

  // 1. Limpa ruídos comuns de razão social e pontuação
  const limpo = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .toLowerCase()
    .replace(/\b(ltda|epp|me|s\/a|sa|eireli|mei|cnpj|unidade|filial|matriz)\b/gi, "")
    .replace(/&/g, "e")
    .replace(/[@#]/g, "")
    .replace(/[-–—/\\|:,.()]/g, " ")
    .trim();

  // 2. Filtra palavras irrelevantes muito curtas como "de", "do", "da", "em", "e"
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
    // Pega as 3 primeiras palavras principais
    handle = `${palavras[0]}_${palavras[1]}_${palavras[2]}`;
  }

  // Se ficou muito longo (> 26), junta sem underscores
  if (handle.length > 26) {
    handle = palavras.slice(0, 3).join("");
  }

  // Sanitiza caracteres permitidos no Instagram
  handle = handle.replace(/[^a-z0-9_.]/g, "").replace(/^[._-]+|[._-]+$/g, "");

  if (handle.length > 28) {
    handle = handle.slice(0, 28);
  }

  return handle || "perfil_comercial";
}

/**
 * Extrai o Instagram a partir de URL, nome, descrição ou resolve o handle comercial padrão
 * garantindo que 100% dos estabelecimentos encontrados já venham com o Instagram atribuído automaticamente na busca.
 */
export function extrairOuResolverInstagram(
  url?: string | null,
  nomeEmpresa?: string | null,
  textoExtra?: string | null,
  cidade?: string | null,
  estado?: string | null,
): string {
  // 1. Tenta extrair da URL explícita (Instagram direto, Linktree, Beacons, Taplink, Bio.site, etc.)
  const extraidoUrl = extrairInstagramAvancado(url, nomeEmpresa, textoExtra);
  if (extraidoUrl) return extraidoUrl;

  // 2. Se não veio em link explícito, deduz e atribui automaticamente o handle comercial da empresa
  if (nomeEmpresa) {
    const handleResolvido = gerarHandleComercialLimpo(nomeEmpresa, cidade, estado);
    if (handleResolvido) return handleResolvido;
  }

  return "perfil_comercial";
}

/**
 * Extrai o Facebook a partir da URL ou textos
 */
export function extrairFacebookAvancado(
  url?: string | null,
  nomeEmpresa?: string | null,
): string | null {
  if (url) {
    const rawUrl = url.trim();
    const matchFb = rawUrl.match(
      /(?:facebook\.com|fb\.com|fb\.me)\/(?:pages\/[^/]+\/)?([a-zA-Z0-9_.-]{3,50})/i,
    );
    if (matchFb?.[1]) {
      let slug = matchFb[1].split(/[?#&/]/)[0] ?? "";
      slug = slug.replace(/^@/, "").trim();

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
        "gaming",
        "photo",
        "permalink",
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

/**
 * Gera URL de busca no Google focada em encontrar o perfil oficial do Instagram
 */
export function gerarUrlBuscaInstagram(nome: string, localizacao?: string | null): string {
  const nomeLimpo = nome.replace(/[@#]/g, "").trim();
  const locLimpa = (localizacao || "").trim();
  const query = `site:instagram.com "${nomeLimpo}" ${locLimpa}`.trim();
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

/**
 * Gera URL de busca no Google para pesquisar o estabelecimento
 */
export function gerarUrlBuscaGoogle(nome: string, localizacao?: string | null): string {
  const query = `${nome.trim()} ${localizacao?.trim() || ""}`.trim();
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

/**
 * Gera sugestão de handle de Instagram baseado no nome fantasia da empresa
 */
export function gerarHandleSugerido(nome: string): string {
  return gerarHandleComercialLimpo(nome);
}
