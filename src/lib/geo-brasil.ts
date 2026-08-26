export interface InfoCidadeBrasil {
  nome: string;
  estado: string;
  lat: number;
  lng: number;
  ddd: string;
  bairros?: string[];
}

export const ESTADOS_BRASIL: Record<string, { nome: string; dddPadrao: string; capital: string }> =
  {
    AC: { nome: "Acre", dddPadrao: "68", capital: "Rio Branco" },
    AL: { nome: "Alagoas", dddPadrao: "82", capital: "Maceió" },
    AP: { nome: "Amapá", dddPadrao: "96", capital: "Macapá" },
    AM: { nome: "Amazonas", dddPadrao: "92", capital: "Manaus" },
    BA: { nome: "Bahia", dddPadrao: "71", capital: "Salvador" },
    CE: { nome: "Ceará", dddPadrao: "85", capital: "Fortaleza" },
    DF: { nome: "Distrito Federal", dddPadrao: "61", capital: "Brasília" },
    ES: { nome: "Espírito Santo", dddPadrao: "27", capital: "Vitória" },
    GO: { nome: "Goiás", dddPadrao: "62", capital: "Goiânia" },
    MA: { nome: "Maranhão", dddPadrao: "98", capital: "São Luís" },
    MT: { nome: "Mato Grosso", dddPadrao: "65", capital: "Cuiabá" },
    MS: { nome: "Mato Grosso do Sul", dddPadrao: "67", capital: "Campo Grande" },
    MG: { nome: "Minas Gerais", dddPadrao: "31", capital: "Belo Horizonte" },
    PA: { nome: "Pará", dddPadrao: "91", capital: "Belém" },
    PB: { nome: "Paraíba", dddPadrao: "83", capital: "João Pessoa" },
    PR: { nome: "Paraná", dddPadrao: "41", capital: "Curitiba" },
    PE: { nome: "Pernambuco", dddPadrao: "81", capital: "Recife" },
    PI: { nome: "Piauí", dddPadrao: "86", capital: "Teresina" },
    RJ: { nome: "Rio de Janeiro", dddPadrao: "21", capital: "Rio de Janeiro" },
    RN: { nome: "Rio Grande do Norte", dddPadrao: "84", capital: "Natal" },
    RS: { nome: "Rio Grande do Sul", dddPadrao: "51", capital: "Porto Alegre" },
    RO: { nome: "Rondônia", dddPadrao: "69", capital: "Porto Velho" },
    RR: { nome: "Roraima", dddPadrao: "95", capital: "Boa Vista" },
    SC: { nome: "Santa Catarina", dddPadrao: "48", capital: "Florianópolis" },
    SP: { nome: "São Paulo", dddPadrao: "11", capital: "São Paulo" },
    SE: { nome: "Sergipe", dddPadrao: "79", capital: "Aracaju" },
    TO: { nome: "Tocantins", dddPadrao: "63", capital: "Palmas" },
  };

export const CIDADES_BRASIL: Record<string, InfoCidadeBrasil> = {
  // SÃO PAULO (SP)
  "sao paulo": {
    nome: "São Paulo",
    estado: "SP",
    lat: -23.5505,
    lng: -46.6333,
    ddd: "11",
    bairros: [
      "Pinheiros",
      "Moema",
      "Itaim Bibi",
      "Jardins",
      "Vila Mariana",
      "Bela Vista",
      "Santana",
      "Morumbi",
      "Tatuapé",
      "Perdizes",
      "Consolação",
      "Vila Madalena",
      "Brooklin",
    ],
  },
  campinas: {
    nome: "Campinas",
    estado: "SP",
    lat: -22.9056,
    lng: -47.0608,
    ddd: "19",
    bairros: ["Cambuí", "Taquaral", "Barão Geraldo", "Centro", "Nova Campinas"],
  },
  santos: {
    nome: "Santos",
    estado: "SP",
    lat: -23.9608,
    lng: -46.3336,
    ddd: "13",
    bairros: ["Gonzaga", "Boqueirão", "Ponta da Praia", "Embaré", "Centro"],
  },
  "sao bernardo do campo": {
    nome: "São Bernardo do Campo",
    estado: "SP",
    lat: -23.6914,
    lng: -46.5646,
    ddd: "11",
    bairros: ["Rudge Ramos", "Centro", "Paulicéia", "Baeta Neves"],
  },
  "sao jose dos campos": {
    nome: "São José dos Campos",
    estado: "SP",
    lat: -23.1896,
    lng: -45.8841,
    ddd: "12",
    bairros: ["Jardim Aquino", "Vila Ema", "Urbanova", "Centro"],
  },
  "ribeirao preto": {
    nome: "Ribeirão Preto",
    estado: "SP",
    lat: -21.1767,
    lng: -47.8208,
    ddd: "16",
    bairros: ["Jardim Paulista", "Nova Aliança", "Centro", "Ipiranga"],
  },
  sorocaba: {
    nome: "Sorocaba",
    estado: "SP",
    lat: -23.5015,
    lng: -47.4526,
    ddd: "15",
    bairros: ["Campolim", "Centro", "Além Ponte", "Trujillo"],
  },
  jundiai: {
    nome: "Jundiaí",
    estado: "SP",
    lat: -23.1857,
    lng: -46.8978,
    ddd: "11",
    bairros: ["Anhangabaú", "Centro", "Vila Arens", "Elor", "Malota"],
  },
  piracicaba: {
    nome: "Piracicaba",
    estado: "SP",
    lat: -22.7253,
    lng: -47.6492,
    ddd: "19",
    bairros: ["Centro", "Nova Piracicaba", "Paulista", "São Dimas"],
  },
  "sao jose do rio preto": {
    nome: "São José do Rio Preto",
    estado: "SP",
    lat: -20.8113,
    lng: -49.3758,
    ddd: "17",
    bairros: ["Redentora", "Centro", "Boa Vista", "Nova Redentora"],
  },

  // RIO DE JANEIRO (RJ)
  "rio de janeiro": {
    nome: "Rio de Janeiro",
    estado: "RJ",
    lat: -22.9068,
    lng: -43.1729,
    ddd: "21",
    bairros: [
      "Copacabana",
      "Ipanema",
      "Leblon",
      "Barra da Tijuca",
      "Botafogo",
      "Flamengo",
      "Tijuca",
      "Lapa",
      "Centro",
      "Recreio dos Bandeirantes",
      "Gávea",
    ],
  },
  niteroi: {
    nome: "Niterói",
    estado: "RJ",
    lat: -22.8833,
    lng: -43.1036,
    ddd: "21",
    bairros: ["Icaraí", "Ingá", "Centro", "Santa Rosa", "Charitas"],
  },

  // MINAS GERAIS (MG)
  "belo horizonte": {
    nome: "Belo Horizonte",
    estado: "MG",
    lat: -19.9167,
    lng: -43.9345,
    ddd: "31",
    bairros: ["Savassi", "Lourdes", "Funcionários", "Belvedere", "Buritis", "Pampulha", "Centro"],
  },
  uberlandia: {
    nome: "Uberlândia",
    estado: "MG",
    lat: -18.9186,
    lng: -48.2772,
    ddd: "34",
    bairros: ["Santa Mônica", "Tibery", "Centro", "Martins"],
  },
  "juiz de fora": {
    nome: "Juiz de Fora",
    estado: "MG",
    lat: -21.7587,
    lng: -43.3496,
    ddd: "32",
    bairros: ["Centro", "São Mateus", "Cascatinha", "Granbery"],
  },

  // DISTRITO FEDERAL (DF)
  brasilia: {
    nome: "Brasília",
    estado: "DF",
    lat: -15.7942,
    lng: -47.8822,
    ddd: "61",
    bairros: [
      "Asa Sul",
      "Asa Norte",
      "Sudoeste",
      "Noroeste",
      "Lago Sul",
      "Lago Norte",
      "Águas Claras",
      "Taguatinga",
    ],
  },

  // PARANÁ (PR)
  curitiba: {
    nome: "Curitiba",
    estado: "PR",
    lat: -25.429,
    lng: -49.2671,
    ddd: "41",
    bairros: [
      "Batel",
      "Bigorrilho",
      "Centro",
      "Água Verde",
      "Cabral",
      "Santa Felicidade",
      "Juvevê",
    ],
  },
  londrina: {
    nome: "Londrina",
    estado: "PR",
    lat: -23.3045,
    lng: -51.1696,
    ddd: "43",
    bairros: ["Gleba Palhano", "Centro", "Jardim Shangri-lá"],
  },
  maringa: {
    nome: "Maringá",
    estado: "PR",
    lat: -23.4209,
    lng: -51.9331,
    ddd: "44",
    bairros: ["Zona 01", "Zona 07", "Centro", "Jardim Alvorada"],
  },

  // RIO GRANDE DO SUL (RS)
  "porto alegre": {
    nome: "Porto Alegre",
    estado: "RS",
    lat: -30.0346,
    lng: -51.2177,
    ddd: "51",
    bairros: [
      "Moinhos de Vento",
      "Bela Vista",
      "Menino Deus",
      "Centro Histórico",
      "Petrópolis",
      "Bom Fim",
    ],
  },
  "caxias do sul": {
    nome: "Caxias do Sul",
    estado: "RS",
    lat: -29.1678,
    lng: -51.1794,
    ddd: "54",
    bairros: ["São Pelegrino", "Centro", "Exposição", "Pio X"],
  },

  // SANTA CATARINA (SC)
  florianopolis: {
    nome: "Florianópolis",
    estado: "SC",
    lat: -27.5954,
    lng: -48.548,
    ddd: "48",
    bairros: ["Centro", "Trindade", "Agronômica", "Lagoa da Conceição", "Jurerê Internacional"],
  },
  joinville: {
    nome: "Joinville",
    estado: "SC",
    lat: -26.3045,
    lng: -48.8487,
    ddd: "47",
    bairros: ["Centro", "América", "Anita Garibaldi", "Atiradores", "Glória"],
  },
  blumenau: {
    nome: "Blumenau",
    estado: "SC",
    lat: -26.9194,
    lng: -49.0661,
    ddd: "47",
    bairros: ["Centro", "Victor Konder", "Vila Nova", "Itoupava Seca"],
  },

  // BAHIA (BA)
  salvador: {
    nome: "Salvador",
    estado: "BA",
    lat: -12.9785,
    lng: -38.4552,
    ddd: "71",
    bairros: [
      "Pituba",
      "Caminho das Árvores",
      "Barra",
      "Itaigara",
      "Rio Vermelho",
      "Ondina",
      "Graça",
      "Imbuí",
    ],
  },
  "feira de santana": {
    nome: "Feira de Santana",
    estado: "BA",
    lat: -12.2664,
    lng: -38.9663,
    ddd: "75",
    bairros: ["Centro", "Kalilândia", "Santa Mônica", "Capuchinhos"],
  },

  // CEARÁ (CE)
  fortaleza: {
    nome: "Fortaleza",
    estado: "CE",
    lat: -3.7172,
    lng: -38.5433,
    ddd: "85",
    bairros: ["Meireles", "Aldeota", "Varjota", "Cocó", "Dionísio Torres", "Papicu", "Centro"],
  },

  // PERNAMBUCO (PE)
  recife: {
    nome: "Recife",
    estado: "PE",
    lat: -8.0476,
    lng: -34.877,
    ddd: "81",
    bairros: [
      "Boa Viagem",
      "Espinheiro",
      "Graças",
      "Jaqueira",
      "Casa Forte",
      "Pina",
      "Recife Antigo",
    ],
  },

  // GOIÁS (GO)
  goiania: {
    nome: "Goiânia",
    estado: "GO",
    lat: -16.6869,
    lng: -49.2648,
    ddd: "62",
    bairros: ["Setor Bueno", "Setor Marista", "Setor Oeste", "Jardim Goiás", "Centro"],
  },

  // ESPÍRITO SANTO (ES)
  vitoria: {
    nome: "Vitória",
    estado: "ES",
    lat: -20.3155,
    lng: -40.3128,
    ddd: "27",
    bairros: ["Praia do Canto", "Jardim da Penha", "Jardim Camburi", "Enseada do Suá", "Centro"],
  },

  // AMAZONAS (AM)
  manaus: {
    nome: "Manaus",
    estado: "AM",
    lat: -3.119,
    lng: -60.0217,
    ddd: "92",
    bairros: ["Adrianópolis", "Ponta Negra", "Vieiralves", "Centro", "Flores"],
  },

  // PARÁ (PA)
  belem: {
    nome: "Belém",
    estado: "PA",
    lat: -1.4558,
    lng: -48.4902,
    ddd: "91",
    bairros: ["Nazaré", "Umarizal", "Batista Campos", "Marco", "Centro"],
  },

  // MATO GROSSO (MT)
  cuiaba: {
    nome: "Cuiabá",
    estado: "MT",
    lat: -15.6014,
    lng: -56.0979,
    ddd: "65",
    bairros: ["Goiabeiras", "Duque de Caxias", "Santa Rosa", "Centro"],
  },

  // MATO GROSSO DO SUL (MS)
  "campo grande": {
    nome: "Campo Grande",
    estado: "MS",
    lat: -20.4697,
    lng: -54.6201,
    ddd: "67",
    bairros: ["Chácara Cachoeira", "Centro", "Jardim dos Estados", "Santa Fé"],
  },

  // RIO GRANDE DO NORTE (RN)
  natal: {
    nome: "Natal",
    estado: "RN",
    lat: -5.7945,
    lng: -35.211,
    ddd: "84",
    bairros: ["Ponta Negra", "Petrópolis", "Tirol", "Capim Macio", "Candelária"],
  },

  // PARAÍBA (PB)
  "joao pessoa": {
    nome: "João Pessoa",
    estado: "PB",
    lat: -7.1195,
    lng: -34.845,
    ddd: "83",
    bairros: ["Tambaú", "Manaíra", "Cabo Branco", "Bessa", "Altiplano"],
  },

  // ALAGOAS (AL)
  maceio: {
    nome: "Maceió",
    estado: "AL",
    lat: -9.6658,
    lng: -35.7351,
    ddd: "82",
    bairros: ["Ponta Verde", "Pajuçara", "Jatiúca", "Cruz das Almas", "Centro"],
  },

  // SERGIPE (SE)
  aracaju: {
    nome: "Aracaju",
    estado: "SE",
    lat: -10.9472,
    lng: -37.0731,
    ddd: "79",
    bairros: ["13 de Julho", "Jardins", "Atalaia", "Garcia", "Centro"],
  },

  // MARANHÃO (MA)
  "sao luis": {
    nome: "São Luís",
    estado: "MA",
    lat: -2.5307,
    lng: -44.3068,
    ddd: "98",
    bairros: ["Ponta d'Areia", "Renascença", "Calhau", "Cohama", "Centro"],
  },

  // PIAUÍ (PI)
  teresina: {
    nome: "Teresina",
    estado: "PI",
    lat: -5.0919,
    lng: -42.8034,
    ddd: "86",
    bairros: ["Jóquei", "Fátima", "Ilhotas", "Centro"],
  },

  // TOCANTINS (TO)
  palmas: {
    nome: "Palmas",
    estado: "TO",
    lat: -10.1844,
    lng: -48.3336,
    ddd: "63",
    bairros: ["Plano Diretor Sul", "Plano Diretor Norte", "Graciosa", "Taquaralto"],
  },

  // RONDÔNIA (RO)
  "porto velho": {
    nome: "Porto Velho",
    estado: "RO",
    lat: -8.7619,
    lng: -63.9039,
    ddd: "69",
    bairros: ["Centro", "Olaria", "Embratel", "São Cristóvão"],
  },

  // ACRE (AC)
  "rio branco": {
    nome: "Rio Branco",
    estado: "AC",
    lat: -9.9749,
    lng: -67.8243,
    ddd: "68",
    bairros: ["Bosque", "Centro", "Cerâmica", "Estação Experimental"],
  },

  // AMAPÁ (AP)
  macapa: {
    nome: "Macapá",
    estado: "AP",
    lat: 0.0349,
    lng: -51.0694,
    ddd: "96",
    bairros: ["Centro", "Santa Inês", "Central", "Trem"],
  },

  // RORAIMA (RR)
  "boa vista": {
    nome: "Boa Vista",
    estado: "RR",
    lat: 2.8235,
    lng: -60.6758,
    ddd: "95",
    bairros: ["São Pedro", "Centro", "Mecejana", "Paraviana"],
  },
};

export const CAPITAIS_BRASIL_RAPIDAS = [
  { label: "São Paulo, SP", valor: "sao paulo" },
  { label: "Rio de Janeiro, RJ", valor: "rio de janeiro" },
  { label: "Belo Horizonte, MG", valor: "belo horizonte" },
  { label: "Curitiba, PR", valor: "curitiba" },
  { label: "Porto Alegre, RS", valor: "porto alegre" },
  { label: "Brasília, DF", valor: "brasilia" },
  { label: "Salvador, BA", valor: "salvador" },
  { label: "Fortaleza, CE", valor: "fortaleza" },
  { label: "Recife, PE", valor: "recife" },
  { label: "Goiânia, GO", valor: "goiania" },
  { label: "Florianópolis, SC", valor: "florianopolis" },
  { label: "Manaus, AM", valor: "manaus" },
  { label: "Belém, PA", valor: "belem" },
  { label: "Vitória, ES", valor: "vitoria" },
  { label: "Cuiabá, MT", valor: "cuiaba" },
  { label: "Natal, RN", valor: "natal" },
];

export function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Detecta e extrai dinamicamente a UF de qualquer estado brasileiro contido na string
 */
export function extrairUfString(texto: string): string | null {
  const ufsValidas = [
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

  // 1. Procurar por formato ", SP", "- SP", "/ SP" ou " SP "
  for (const uf of ufsValidas) {
    const regex = new RegExp(`(?:[,-/\\s]|^)\\s*(${uf})(?:[,-/\\s]|$|\\d)`, "i");
    if (regex.test(texto)) {
      return uf;
    }
  }

  // 2. Procurar pelo nome completo do estado
  const norm = normalizarTexto(texto);
  for (const [uf, info] of Object.entries(ESTADOS_BRASIL)) {
    const nomeNorm = normalizarTexto(info.nome);
    if (norm.includes(nomeNorm)) {
      return uf;
    }
  }

  return null;
}

/**
 * Obtém informações completas da cidade brasileira digitada ou do endereço retornado
 */
export function obterCoordenadasCidadeBrasil(busca: string): InfoCidadeBrasil {
  const norm = normalizarTexto(busca);
  const ufEncontrada = extrairUfString(busca);

  // 1. Buscar correspondência exata em nosso catálogo de cidades
  for (const [chave, info] of Object.entries(CIDADES_BRASIL)) {
    const chaveNorm = normalizarTexto(chave);
    const nomeNorm = normalizarTexto(info.nome);

    if (norm === chaveNorm || norm === nomeNorm) {
      return info;
    }

    if (norm.includes(chaveNorm) || norm.includes(nomeNorm)) {
      if (ufEncontrada && info.estado !== ufEncontrada) {
        continue;
      }
      return info;
    }
  }

  // 2. Se tiver UF definida, usar a capital desse estado como referência geográfica
  if (ufEncontrada && ESTADOS_BRASIL[ufEncontrada]) {
    const est = ESTADOS_BRASIL[ufEncontrada]!;
    const capitalKey = normalizarTexto(est.capital);
    const capitalInfo = CIDADES_BRASIL[capitalKey];

    // Extrair o nome da cidade informado antes da vírgula/hífen
    const partes = busca.split(/[,-]/);
    const possivelNome = partes[0]?.trim() || est.capital;

    return {
      nome: possivelNome,
      estado: ufEncontrada,
      lat: capitalInfo?.lat ?? -15.7942,
      lng: capitalInfo?.lng ?? -47.8822,
      ddd: est.dddPadrao,
      bairros: capitalInfo?.bairros ?? ["Centro", "Jardins", "Comercial", "Bela Vista", "América"],
    };
  }

  // 3. Fallback inteligente: extrai o nome digitado pelo usuário
  const partes = busca.split(/[,-]/);
  const nomeDigitado = partes[0]?.trim() || "São Paulo";
  const ufPadrao = ufEncontrada || "SP";
  const dddPadrao = ESTADOS_BRASIL[ufPadrao]?.dddPadrao || "11";

  return {
    nome: nomeDigitado,
    estado: ufPadrao,
    lat: -23.5505,
    lng: -46.6333,
    ddd: dddPadrao,
    bairros: ["Centro", "Jardins", "Comercial", "Bela Vista", "América", "Primavera", "Industrial"],
  };
}

/**
 * Parser inteligente de endereço retornado pelo Google Places para cidades brasileiras
 */
export function extrairLocalizacaoCompleta(
  formattedAddress: string | null | undefined,
  termoRegiaoDigitado: string,
): {
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
} {
  const infoCidadeBuscada = obterCoordenadasCidadeBrasil(termoRegiaoDigitado);

  if (!formattedAddress) {
    return {
      endereco: termoRegiaoDigitado,
      bairro: "Centro",
      cidade: infoCidadeBuscada.nome,
      estado: infoCidadeBuscada.estado,
    };
  }

  // Exemplo de endereço Google Places:
  // "Av. Paulista, 1578 - Bela Vista, São Paulo - SP, 01310-200, Brasil"
  // "Rua XV de Novembro, 100 - Centro, Blumenau - SC, 89010-000, Brasil"
  const partesVirgula = formattedAddress.split(",").map((p) => p.trim());
  const ufDetectada = extrairUfString(formattedAddress) || infoCidadeBuscada.estado;

  const endereco = partesVirgula[0] || termoRegiaoDigitado;
  let bairro = "Centro";
  let cidade = infoCidadeBuscada.nome;

  // Tentar extrair bairro e cidade
  if (formattedAddress.includes("-")) {
    const partesTraco = formattedAddress.split("-").map((p) => p.trim());
    if (partesTraco.length > 1) {
      const parteBairroCidade = partesTraco[1] || "";
      const subPartes = parteBairroCidade.split(",").map((p) => p.trim());
      bairro = subPartes[0] || "Centro";
      if (subPartes.length > 1 && subPartes[1]) {
        cidade = subPartes[1].replace(/-\s*[A-Z]{2}/i, "").trim() || infoCidadeBuscada.nome;
      }
    }
  } else if (partesVirgula.length >= 3) {
    bairro = partesVirgula[1] || "Centro";
    cidade = partesVirgula[2]?.replace(/-\s*[A-Z]{2}/i, "").trim() || infoCidadeBuscada.nome;
  }

  // Se o nome da cidade extraída contiver número ou CEP, volta para a cidade da busca
  if (/\d{5}/.test(cidade) || cidade.length < 2) {
    cidade = infoCidadeBuscada.nome;
  }

  return {
    endereco: formattedAddress.replace(/,\s*Brasil$/i, ""),
    bairro: bairro || "Centro",
    cidade: cidade || infoCidadeBuscada.nome,
    estado: ufDetectada,
  };
}
