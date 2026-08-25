export type NivelPrioridade = "alta" | "media" | "baixa";

export interface DadosParaScore {
  tem_site?: boolean | null;
  instagram?: string | null;
  facebook?: string | null;
  avaliacao_google?: number | null;
  total_avaliacoes?: number | null;
  criado_em?: string | null;
}

export function calcularScoreLead(dados: DadosParaScore): number {
  let score = 0;

  // 1. Não ter site próprio é a principal oportunidade comercial (peso máximo: 45)
  if (!dados.tem_site) {
    score += 45;
  }

  // 2. Ter redes sociais mas não ter site indica empresa ativa que investe em marketing digital (peso: 15)
  const temRedeSocial = Boolean(dados.instagram || dados.facebook);
  if (!dados.tem_site && temRedeSocial) {
    score += 15;
  }

  // 3. Quantidade de avaliações no Google (máximo: 20 pontos)
  const avaliacoes = dados.total_avaliacoes ?? 0;
  if (avaliacoes > 0) {
    // 50+ avaliações ganha nota máxima de volume
    const ptsVolume = Math.min(20, Math.round((avaliacoes / 50) * 20));
    score += ptsVolume;
  }

  // 4. Nota média no Google (máximo: 15 pontos)
  const nota = dados.avaliacao_google ?? 0;
  if (nota > 0) {
    const ptsNota = Math.round((Math.min(5, nota) / 5) * 15);
    score += ptsNota;
  }

  // 5. Recência da captura (5 pontos se capturado nos últimos 7 dias)
  if (dados.criado_em) {
    const dias = (Date.now() - new Date(dados.criado_em).getTime()) / (1000 * 60 * 60 * 24);
    if (dias <= 7) {
      score += 5;
    }
  }

  return Math.min(100, Math.max(0, score));
}

// Alias para compatibilidade
export const calcularScore = calcularScoreLead;

export function obterClassificacaoScore(score: number): {
  nivel: NivelPrioridade;
  rotulo: string;
  classeCor: string;
  classeBadge: string;
  classeBorda: string;
} {
  if (score >= 70) {
    return {
      nivel: "alta",
      rotulo: "Prioridade Alta",
      classeCor: "text-[var(--color-alerta)]",
      classeBadge: "bg-[var(--color-alerta)]/15 text-[var(--color-alerta)] border-[var(--color-alerta)]/30",
      classeBorda: "border-l-[var(--color-alerta)]",
    };
  }

  if (score >= 40) {
    return {
      nivel: "media",
      rotulo: "Prioridade Média",
      classeCor: "text-amber-400",
      classeBadge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      classeBorda: "border-l-amber-500",
    };
  }

  return {
    nivel: "baixa",
    rotulo: "Prioridade Baixa",
    classeCor: "text-[var(--color-novo)]",
    classeBadge: "bg-[var(--color-novo)]/15 text-[var(--color-novo)] border-[var(--color-novo)]/30",
    classeBorda: "border-l-[var(--color-novo)]",
  };
}
