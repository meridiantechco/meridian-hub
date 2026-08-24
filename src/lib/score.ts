/**
 * Cálculo do score de prioridade (0 a 100) de um lead.
 *
 * Pesos:
 * - Não ter site próprio ....................... até 40 pts (peso alto)
 * - Ter rede social mas nenhum site ............ até 15 pts (site "fraco")
 * - Número de avaliações no Google ............. até 20 pts (com teto em 200)
 * - Nota média no Google ....................... até 15 pts
 * - Recência da captura ........................ até 10 pts (decai em 30 dias)
 */

export type EntradaScore = {
  tem_site: boolean;
  site_url?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  avaliacao_google?: number | null;
  total_avaliacoes?: number | null;
  criado_em: string | Date;
};

export const TETO_AVALIACOES = 200;

export function calcularScore(lead: EntradaScore): number {
  let score = 0;

  // 1. Sem site próprio (peso alto)
  if (!lead.tem_site) score += 40;

  // 2. Rede social presente sem site próprio (presença digital "fraca")
  const temRede = Boolean(lead.instagram || lead.facebook);
  if (temRede && !lead.tem_site) score += 15;
  else if (temRede) score += 5;

  // 3. Volume de avaliações (com teto)
  const total = Math.max(0, lead.total_avaliacoes ?? 0);
  score += Math.round((Math.min(total, TETO_AVALIACOES) / TETO_AVALIACOES) * 20);

  // 4. Nota média
  const nota = lead.avaliacao_google ?? 0;
  if (nota > 0) score += Math.round((Math.min(nota, 5) / 5) * 15);

  // 5. Recência da captura (30 dias de decaimento)
  const capturaMs = new Date(lead.criado_em).getTime();
  const dias = (Date.now() - capturaMs) / 86_400_000;
  const recencia = Math.max(0, 1 - dias / 30);
  score += Math.round(recencia * 10);

  return Math.max(0, Math.min(100, score));
}

export type Prioridade = "alta" | "media" | "baixa";

export function prioridadeDoScore(score: number): Prioridade {
  if (score >= 70) return "alta";
  if (score >= 45) return "media";
  return "baixa";
}

export const rotuloPrioridade: Record<Prioridade, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};
