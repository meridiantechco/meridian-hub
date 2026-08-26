export interface LeadEncontrado {
  idTemp: string;
  nome: string;
  categoria: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  latitude: number | null;
  longitude: number | null;
  telefone: string;
  whatsapp_link?: string | null;
  instagram: string | null;
  facebook: string | null;
  site_url: string | null;
  tem_site: boolean;
  avaliacao_google: number | null;
  total_avaliacoes: number;
  place_id: string;
  score: number;
  selecionado: boolean;
}

export const SUGESTOES_CATEGORIAS = [
  "Restaurante",
  "Salão de Beleza",
  "Oficina Mecânica",
  "Barbearia",
  "Petshop",
  "Corretor de Imóveis",
  "Dentista",
  "Academia",
  "Loja de Roupas",
  "Clínica de Estética",
  "Pizzaria",
  "Autoescola",
  "Hamburgueria",
  "Contabilidade",
  "Clínica Veterinária",
];
