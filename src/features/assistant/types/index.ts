export interface MensagemChat {
  id: string;
  autor: "usuario" | "assistente";
  conteudo: string;
  data_hora: string;
  metadadosLeads?: { id: string; nome: string; categoria: string; score: number }[];
}
