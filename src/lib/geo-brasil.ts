export interface InfoCidadeBrasil {
  nome: string;
  estado: string;
  lat: number;
  lng: number;
  ddd: string;
  bairros?: string[];
}

export const CIDADES_BRASIL: Record<string, InfoCidadeBrasil> = {
  // SÃO PAULO
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

  // RIO DE JANEIRO
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

  // MINAS GERAIS
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

  // DISTRITO FEDERAL
  brasilia: {
    nome: "Brasília",
    estado: "DF",
    lat: -15.7942,
    lng: -47.8822,
    ddd: "61",
    bairros: ["Asa Sul", "Asa Norte", "Sudoeste", "Noroeste", "Lago Sul", "Lago Norte", "Águas Claras", "Taguatinga"],
  },

  // PARANÁ
  curitiba: {
    nome: "Curitiba",
    estado: "PR",
    lat: -25.4290,
    lng: -49.2671,
    ddd: "41",
    bairros: ["Batel", "Bigorrilho", "Centro", "Água Verde", "Cabral", "Santa Felicidade", "Juvevê"],
  },
  londrina: {
    nome: "Londrina",
    estado: "PR",
    lat: -23.3045,
    lng: -51.1696,
    ddd: "43",
    bairros: ["Gleba Palhano", "Centro", "Jardim Shangri-lá"],
  },

  // RIO GRANDE DO SUL
  "porto alegre": {
    nome: "Porto Alegre",
    estado: "RS",
    lat: -30.0346,
    lng: -51.2177,
    ddd: "51",
    bairros: ["Moinhos de Vento", "Bela Vista", "Menino Deus", "Centro Histórico", "Petrópolis", "Bom Fim"],
  },
  "caxias do sul": {
    nome: "Caxias do Sul",
    estado: "RS",
    lat: -29.1678,
    lng: -51.1794,
    ddd: "54",
    bairros: ["São Pelegrino", "Centro", "Exposição", "Pio X"],
  },

  // SANTA CATARINA
  florianopolis: {
    nome: "Florianópolis",
    estado: "SC",
    lat: -27.5954,
    lng: -48.5480,
    ddd: "48",
    bairros: ["Centro", "Agronômica", "Itacorubi", "Lagoa da Conceição", "Jurerê Internacional", "Coqueiros"],
  },
  joinville: {
    nome: "Joinville",
    estado: "SC",
    lat: -26.3044,
    lng: -48.8464,
    ddd: "47",
    bairros: ["América", "Atiradores", "Centro", "Anita Garibaldi"],
  },
  "balneario camboriu": {
    nome: "Balneário Camboriú",
    estado: "SC",
    lat: -26.9926,
    lng: -48.6349,
    ddd: "47",
    bairros: ["Centro", "Barra Sul", "Pioneiros", "Praia dos Amores"],
  },

  // BAHIA
  salvador: {
    nome: "Salvador",
    estado: "BA",
    lat: -12.9785,
    lng: -38.4552,
    ddd: "71",
    bairros: [
      "Pituba",
      "Barra",
      "Rio Vermelho",
      "Itaigara",
      "Ondina",
      "Caminho das Árvores",
      "Pelourinho",
      "Graça",
      "Imbuí",
      "Cabula",
      "Stella Maris",
      "Armação",
      "Costa Azul",
      "Vitória",
      "Brotas",
      "Patamares",
    ],
  },
  "feira de santana": {
    nome: "Feira de Santana",
    estado: "BA",
    lat: -12.2667,
    lng: -38.9667,
    ddd: "75",
    bairros: ["Santa Mônica", "Capuchinhos", "Kalilândia", "Centro"],
  },

  // PERNAMBUCO
  recife: {
    nome: "Recife",
    estado: "PE",
    lat: -8.0476,
    lng: -34.8770,
    ddd: "81",
    bairros: ["Boa Viagem", "Graças", "Espinheiro", "Casa Forte", "Pina", "Recife Antigo", "Derby"],
  },

  // CEARÁ
  fortaleza: {
    nome: "Fortaleza",
    estado: "CE",
    lat: -3.7172,
    lng: -38.5433,
    ddd: "85",
    bairros: ["Meireles", "Aldeota", "Praia de Iracema", "Cocó", "Varjota", "Papicu", "Dionísio Torres"],
  },

  // GOIÁS
  goiania: {
    nome: "Goiânia",
    estado: "GO",
    lat: -16.6869,
    lng: -49.2648,
    ddd: "62",
    bairros: ["Setor Bueno", "Setor Marista", "Setor Oeste", "Jardim Goiás", "Centro", "Setor Sul"],
  },

  // AMAZONAS
  manaus: {
    nome: "Manaus",
    estado: "AM",
    lat: -3.1190,
    lng: -60.0217,
    ddd: "92",
    bairros: ["Adrianópolis", "Ponta Negra", "Vieiralves", "Centro", "Parque 10"],
  },

  // PARÁ
  belem: {
    nome: "Belém",
    estado: "PA",
    lat: -1.4558,
    lng: -48.4902,
    ddd: "91",
    bairros: ["Nazaré", "Umarizal", "Batista Campos", "Marco", "Reduto"],
  },

  // ESPÍRITO SANTO
  vitoria: {
    nome: "Vitória",
    estado: "ES",
    lat: -20.3155,
    lng: -40.3128,
    ddd: "27",
    bairros: ["Praia do Canto", "Jardim da Penha", "Jardim Camburi", "Enseada do Suá", "Centro"],
  },

  // RIO GRANDE DO NORTE
  natal: {
    nome: "Natal",
    estado: "RN",
    lat: -5.7945,
    lng: -35.2110,
    ddd: "84",
    bairros: ["Ponta Negra", "Petrópolis", "Tirol", "Capim Macio", "Candelária"],
  },

  // PARAÍBA
  "joao pessoa": {
    nome: "João Pessoa",
    estado: "PB",
    lat: -7.1195,
    lng: -34.8450,
    ddd: "83",
    bairros: ["Manaíra", "Tambaú", "Cabo Branco", "Bessa", "Miramar"],
  },

  // ALAGOAS
  maceio: {
    nome: "Maceió",
    estado: "AL",
    lat: -9.6498,
    lng: -35.7089,
    ddd: "82",
    bairros: ["Pajuçara", "Ponta Verde", "Jatiúca", "Cruz das Almas", "Farol"],
  },

  // MATO GROSSO DO SUL
  "campo grande": {
    nome: "Campo Grande",
    estado: "MS",
    lat: -20.4697,
    lng: -54.6201,
    ddd: "67",
    bairros: ["Chácara Cachoeira", "Centro", "Jardim dos Estados", "Santa Fé"],
  },

  // MATO GROSSO
  cuiaba: {
    nome: "Cuiabá",
    estado: "MT",
    lat: -15.6014,
    lng: -56.0979,
    ddd: "65",
    bairros: ["Goiabeiras", "Duque de Caxias", "Bosque da Saúde", "Centro"],
  },

  // MARANHÃO
  "sao luis": {
    nome: "São Luís",
    estado: "MA",
    lat: -2.5307,
    lng: -44.3068,
    ddd: "98",
    bairros: ["Renascença", "Ponta d'Areia", "Calhau", "Cohama", "Centro"],
  },

  // PIAUÍ
  teresina: {
    nome: "Teresina",
    estado: "PI",
    lat: -5.0919,
    lng: -42.8034,
    ddd: "86",
    bairros: ["Jóquei", "Fátima", "Ilhotas", "Centro"],
  },

  // SERGIPE
  aracaju: {
    nome: "Aracaju",
    estado: "SE",
    lat: -10.9472,
    lng: -37.0731,
    ddd: "79",
    bairros: ["Atalaia", "13 de Julho", "Jardins", "Grageru", "Centro"],
  },
};

export const CAPITAIS_BRASIL_RAPIDAS = [
  { label: "São Paulo, SP", valor: "sao paulo", lat: -23.5505, lng: -46.6333, zoom: 12 },
  { label: "Rio de Janeiro, RJ", valor: "rio de janeiro", lat: -22.9068, lng: -43.1729, zoom: 12 },
  { label: "Belo Horizonte, MG", valor: "belo horizonte", lat: -19.9167, lng: -43.9345, zoom: 12 },
  { label: "Brasília, DF", valor: "brasilia", lat: -15.7942, lng: -47.8822, zoom: 12 },
  { label: "Curitiba, PR", valor: "curitiba", lat: -25.4290, lng: -49.2671, zoom: 12 },
  { label: "Porto Alegre, RS", valor: "porto alegre", lat: -30.0346, lng: -51.2177, zoom: 12 },
  { label: "Salvador, BA", valor: "salvador", lat: -12.9785, lng: -38.4552, zoom: 12 },
  { label: "Fortaleza, CE", valor: "fortaleza", lat: -3.7172, lng: -38.5433, zoom: 12 },
  { label: "Recife, PE", valor: "recife", lat: -8.0476, lng: -34.8770, zoom: 12 },
  { label: "Goiânia, GO", valor: "goiania", lat: -16.6869, lng: -49.2648, zoom: 12 },
  { label: "Florianópolis, SC", valor: "florianopolis", lat: -27.5954, lng: -48.5480, zoom: 12 },
  { label: "Manaus, AM", valor: "manaus", lat: -3.1190, lng: -60.0217, zoom: 12 },
  { label: "Belém, PA", valor: "belem", lat: -1.4558, lng: -48.4902, zoom: 12 },
  { label: "Vitória, ES", valor: "vitoria", lat: -20.3155, lng: -40.3128, zoom: 12 },
  { label: "Brasil Inteiro", valor: "brasil", lat: -14.2350, lng: -51.9253, zoom: 4 },
];

function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function obterCoordenadasCidadeBrasil(busca: string): InfoCidadeBrasil {
  const norm = normalizarTexto(busca);

  for (const [chave, info] of Object.entries(CIDADES_BRASIL)) {
    const chaveNorm = normalizarTexto(chave);
    const nomeNorm = normalizarTexto(info.nome);
    if (norm.includes(chaveNorm) || norm.includes(nomeNorm) || chaveNorm.includes(norm)) {
      return info;
    }
  }

  // Estados
  if (norm.includes("sp") || norm.includes("paulo")) return CIDADES_BRASIL["sao paulo"]!;
  if (norm.includes("rj") || norm.includes("rio")) return CIDADES_BRASIL["rio de janeiro"]!;
  if (norm.includes("mg") || norm.includes("minas") || norm.includes("horizonte"))
    return CIDADES_BRASIL["belo horizonte"]!;
  if (norm.includes("pr") || norm.includes("curitiba") || norm.includes("parana"))
    return CIDADES_BRASIL["curitiba"]!;
  if (norm.includes("rs") || norm.includes("gaucho") || norm.includes("alegre"))
    return CIDADES_BRASIL["porto alegre"]!;
  if (norm.includes("df") || norm.includes("brasilia")) return CIDADES_BRASIL["brasilia"]!;
  if (norm.includes("ce") || norm.includes("fortaleza") || norm.includes("ceara"))
    return CIDADES_BRASIL["fortaleza"]!;
  if (norm.includes("pe") || norm.includes("recife") || norm.includes("pernambuco"))
    return CIDADES_BRASIL["recife"]!;
  if (norm.includes("ba") || norm.includes("salvador") || norm.includes("bahia"))
    return CIDADES_BRASIL["salvador"]!;
  if (norm.includes("sc") || norm.includes("florianopolis") || norm.includes("catarina"))
    return CIDADES_BRASIL["florianopolis"]!;
  if (norm.includes("go") || norm.includes("goias") || norm.includes("goiania"))
    return CIDADES_BRASIL["goiania"]!;

  // Default: São Paulo como centro econômico nacional
  return CIDADES_BRASIL["sao paulo"]!;
}
