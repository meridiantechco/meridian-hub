import type { LeadItem } from "@/features/leads";

export interface EmpresaItem extends LeadItem {
  cnpj?: string | null;
  email?: string | null;
  responsavel?: string | null;
  valor_potencial?: number;
  total_contatos?: number;
}

export interface ResumoInteligencia {
  sumario: string;
  recomendacaoAcao: string;
  pontosFortes: string[];
  riscos: string[];
  nivelProntidao: "alto" | "medio" | "baixo";
}
