export type CategoriaTemplate =
  | "primeiro_contato"
  | "follow_up"
  | "proposta"
  | "pos_reuniao"
  | "reativacao";

export interface TemplateMensagem {
  id: string;
  titulo: string;
  categoria: CategoriaTemplate;
  canal: "whatsapp" | "email";
  texto: string;
  variaveisSuportadas: string[];
}
