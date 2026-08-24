import { calcularScore } from "./score";

export type LeadStatus = "novo" | "contatado" | "proposta" | "fechado" | "recusado";
export type LeadOrigem = "google_places" | "manual" | "importacao";

export type Lead = {
  id: string;
  nome: string;
  categoria: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  latitude: number;
  longitude: number;
  telefone: string | null;
  whatsapp_link: string | null;
  instagram: string | null;
  facebook: string | null;
  site_url: string | null;
  tem_site: boolean;
  avaliacao_google: number | null;
  total_avaliacoes: number;
  place_id: string | null;
  status: LeadStatus;
  score: number;
  origem: LeadOrigem;
  responsavel_id: string | null;
  responsavel_nome: string | null;
  observacoes: string | null;
  criado_em: string;
};

export const statusOrdem: LeadStatus[] = [
  "novo",
  "contatado",
  "proposta",
  "fechado",
  "recusado",
];

export const rotuloStatus: Record<LeadStatus, string> = {
  novo: "Novo",
  contatado: "Contatado",
  proposta: "Proposta",
  fechado: "Fechado",
  recusado: "Recusado",
};

const DOMINIOS_REDE = ["instagram.com", "facebook.com", "fb.com", "linktr.ee"];

/** Um link de rede social não conta como site próprio. */
export function ehLinkDeRedeSocial(url?: string | null): boolean {
  if (!url) return false;
  return DOMINIOS_REDE.some((d) => url.toLowerCase().includes(d));
}

export function normalizarTelefone(telefone?: string | null): string | null {
  if (!telefone) return null;
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.length < 10) return null;
  return digitos.startsWith("55") ? digitos : `55${digitos}`;
}

export function gerarLinkWhatsapp(telefone?: string | null, mensagem?: string): string | null {
  const numero = normalizarTelefone(telefone);
  if (!numero) return null;
  const texto = mensagem ? `?text=${encodeURIComponent(mensagem)}` : "";
  return `https://wa.me/${numero}${texto}`;
}

export function mensagemPadrao(lead: Pick<Lead, "nome">): string {
  return `Olá, tudo bem? Sou da equipe Prospecta. Vi o ${lead.nome} no Google e notei que vocês ainda não têm um site próprio. Podemos criar um site simples e rápido para o negócio aparecer melhor nas buscas. Posso te mandar alguns exemplos?`;
}

function diasAtras(dias: number): string {
  return new Date(Date.now() - dias * 86_400_000).toISOString();
}

type Semente = Omit<Lead, "score" | "whatsapp_link">;

const sementes: Semente[] = [
  {
    id: "1",
    nome: "Restaurante Sabor da Bahia",
    categoria: "Restaurante",
    endereco: "Rua Chile, 120",
    bairro: "Centro",
    cidade: "Salvador",
    estado: "BA",
    latitude: -12.9737,
    longitude: -38.5124,
    telefone: "(71) 98812-4455",
    instagram: "https://instagram.com/sabordabahia",
    facebook: null,
    site_url: null,
    tem_site: false,
    avaliacao_google: 4.7,
    total_avaliacoes: 184,
    place_id: "ChIJ_sabor_01",
    status: "novo",
    origem: "google_places",
    responsavel_id: null,
    responsavel_nome: null,
    observacoes: null,
    criado_em: diasAtras(1),
  },
  {
    id: "2",
    nome: "Salão Studio Vitória",
    categoria: "Salão de beleza",
    endereco: "Av. Sete de Setembro, 980",
    bairro: "Vitória",
    cidade: "Salvador",
    estado: "BA",
    latitude: -12.9925,
    longitude: -38.5231,
    telefone: "(71) 99654-1122",
    instagram: "https://instagram.com/studiovitoria",
    facebook: "https://facebook.com/studiovitoria",
    site_url: null,
    tem_site: false,
    avaliacao_google: 4.9,
    total_avaliacoes: 96,
    place_id: "ChIJ_salao_02",
    status: "contatado",
    responsavel_id: "u2",
    responsavel_nome: "Marina Alves",
    origem: "google_places",
    observacoes: "Pediu retorno na próxima semana.",
    criado_em: diasAtras(4),
  },
  {
    id: "3",
    nome: "Oficina Mecânica Dois Irmãos",
    categoria: "Oficina mecânica",
    endereco: "Rua Silveira Martins, 45",
    bairro: "Cabula",
    cidade: "Salvador",
    estado: "BA",
    latitude: -12.9483,
    longitude: -38.4487,
    telefone: "(71) 3245-8890",
    instagram: null,
    facebook: "https://facebook.com/oficinadoisirmaos",
    site_url: null,
    tem_site: false,
    avaliacao_google: 4.4,
    total_avaliacoes: 61,
    place_id: "ChIJ_oficina_03",
    status: "proposta",
    responsavel_id: "u3",
    responsavel_nome: "Diego Rocha",
    origem: "google_places",
    observacoes: null,
    criado_em: diasAtras(9),
  },
  {
    id: "4",
    nome: "Petshop Amigo Fiel",
    categoria: "Petshop",
    endereco: "Rua das Hortênsias, 33",
    bairro: "Pituba",
    cidade: "Salvador",
    estado: "BA",
    latitude: -13.0059,
    longitude: -38.4586,
    telefone: "(71) 98877-2201",
    instagram: "https://instagram.com/amigofielpet",
    facebook: null,
    site_url: null,
    tem_site: false,
    avaliacao_google: 4.6,
    total_avaliacoes: 132,
    place_id: "ChIJ_pet_04",
    status: "novo",
    responsavel_id: null,
    responsavel_nome: null,
    origem: "google_places",
    observacoes: null,
    criado_em: diasAtras(2),
  },
  {
    id: "5",
    nome: "Imobiliária Costa & Filhos",
    categoria: "Corretor de imóveis",
    endereco: "Av. Tancredo Neves, 1200",
    bairro: "Caminho das Árvores",
    cidade: "Salvador",
    estado: "BA",
    latitude: -12.9797,
    longitude: -38.4577,
    telefone: "(71) 3011-7788",
    instagram: "https://instagram.com/costaefilhos",
    facebook: null,
    site_url: "https://costaefilhos.com.br",
    tem_site: true,
    avaliacao_google: 4.1,
    total_avaliacoes: 44,
    place_id: "ChIJ_imob_05",
    status: "recusado",
    responsavel_id: "u2",
    responsavel_nome: "Marina Alves",
    origem: "google_places",
    observacoes: "Já possui site institucional.",
    criado_em: diasAtras(21),
  },
  {
    id: "6",
    nome: "Loja Bella Moda",
    categoria: "Loja de roupas",
    endereco: "Rua Marquês de Caravelas, 78",
    bairro: "Barra",
    cidade: "Salvador",
    estado: "BA",
    latitude: -13.0102,
    longitude: -38.5321,
    telefone: "(71) 99123-4567",
    instagram: "https://instagram.com/bellamodabarra",
    facebook: null,
    site_url: null,
    tem_site: false,
    avaliacao_google: 4.8,
    total_avaliacoes: 210,
    place_id: "ChIJ_moda_06",
    status: "fechado",
    responsavel_id: "u3",
    responsavel_nome: "Diego Rocha",
    origem: "google_places",
    observacoes: "Contrato assinado — landing page.",
    criado_em: diasAtras(15),
  },
  {
    id: "7",
    nome: "Padaria Pão de Ouro",
    categoria: "Padaria",
    endereco: "Rua Aristides Novis, 210",
    bairro: "Federação",
    cidade: "Salvador",
    estado: "BA",
    latitude: -12.9958,
    longitude: -38.5065,
    telefone: "(71) 3332-1010",
    instagram: null,
    facebook: null,
    site_url: null,
    tem_site: false,
    avaliacao_google: 4.3,
    total_avaliacoes: 77,
    place_id: "ChIJ_pad_07",
    status: "novo",
    responsavel_id: null,
    responsavel_nome: null,
    origem: "google_places",
    observacoes: null,
    criado_em: diasAtras(0),
  },
  {
    id: "8",
    nome: "Barbearia Navalha de Prata",
    categoria: "Barbearia",
    endereco: "Rua Lucaia, 55",
    bairro: "Rio Vermelho",
    cidade: "Salvador",
    estado: "BA",
    latitude: -13.0086,
    longitude: -38.4894,
    telefone: "(71) 98555-3344",
    instagram: "https://instagram.com/navalhadeprata",
    facebook: null,
    site_url: null,
    tem_site: false,
    avaliacao_google: 4.9,
    total_avaliacoes: 158,
    place_id: "ChIJ_barb_08",
    status: "contatado",
    responsavel_id: "u2",
    responsavel_nome: "Marina Alves",
    origem: "google_places",
    observacoes: null,
    criado_em: diasAtras(6),
  },
  {
    id: "9",
    nome: "Restaurante Casa do Bobó",
    categoria: "Restaurante",
    endereco: "Largo do Santana, 12",
    bairro: "Rio Vermelho",
    cidade: "Salvador",
    estado: "BA",
    latitude: -13.0075,
    longitude: -38.4913,
    telefone: "(71) 3245-0099",
    instagram: "https://instagram.com/casadobobo",
    facebook: null,
    site_url: null,
    tem_site: false,
    avaliacao_google: 4.5,
    total_avaliacoes: 340,
    place_id: "ChIJ_rest_09",
    status: "proposta",
    responsavel_id: "u3",
    responsavel_nome: "Diego Rocha",
    origem: "google_places",
    observacoes: null,
    criado_em: diasAtras(11),
  },
  {
    id: "10",
    nome: "Auto Elétrica Farol",
    categoria: "Oficina mecânica",
    endereco: "Av. Centenário, 900",
    bairro: "Garcia",
    cidade: "Salvador",
    estado: "BA",
    latitude: -12.9861,
    longitude: -38.5211,
    telefone: "(71) 3021-4433",
    instagram: null,
    facebook: null,
    site_url: null,
    tem_site: false,
    avaliacao_google: 4.0,
    total_avaliacoes: 28,
    place_id: "ChIJ_auto_10",
    status: "novo",
    responsavel_id: null,
    responsavel_nome: null,
    origem: "google_places",
    observacoes: null,
    criado_em: diasAtras(3),
  },
  {
    id: "11",
    nome: "Clínica Odonto Sorriso",
    categoria: "Clínica odontológica",
    endereco: "Rua Airosa Galvão, 15",
    bairro: "Federação",
    cidade: "Salvador",
    estado: "BA",
    latitude: -12.9931,
    longitude: -38.5104,
    telefone: "(71) 99887-1234",
    instagram: "https://instagram.com/odontosorriso",
    facebook: null,
    site_url: "https://linktr.ee/odontosorriso",
    tem_site: false,
    avaliacao_google: 4.7,
    total_avaliacoes: 119,
    place_id: "ChIJ_odon_11",
    status: "contatado",
    responsavel_id: "u2",
    responsavel_nome: "Marina Alves",
    origem: "google_places",
    observacoes: "Só tem Linktree — presença digital fraca.",
    criado_em: diasAtras(7),
  },
  {
    id: "12",
    nome: "Floricultura Jardim Secreto",
    categoria: "Floricultura",
    endereco: "Rua Alagoinhas, 88",
    bairro: "Graça",
    cidade: "Salvador",
    estado: "BA",
    latitude: -12.9982,
    longitude: -38.5182,
    telefone: "(71) 98444-7766",
    instagram: "https://instagram.com/jardimsecretoflores",
    facebook: null,
    site_url: null,
    tem_site: false,
    avaliacao_google: 4.6,
    total_avaliacoes: 52,
    place_id: "ChIJ_flor_12",
    status: "novo",
    responsavel_id: null,
    responsavel_nome: null,
    origem: "google_places",
    observacoes: null,
    criado_em: diasAtras(5),
  },
];

/** Leads de demonstração — serão substituídos pelos dados reais da busca no Google Places. */
export const leadsMock: Lead[] = sementes.map((lead) => ({
  ...lead,
  score: calcularScore(lead),
  whatsapp_link: gerarLinkWhatsapp(lead.telefone),
}));

export const categoriasSugeridas = [
  "Restaurante",
  "Salão de beleza",
  "Barbearia",
  "Oficina mecânica",
  "Corretor de imóveis",
  "Loja de roupas",
  "Petshop",
  "Padaria",
  "Academia",
  "Clínica odontológica",
];
