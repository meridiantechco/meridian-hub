export interface UsuarioEquipe {
  id: string;
  nome: string;
  email: string;
  papel: "admin" | "vendedor";
  status: "ativo" | "pendente_primeiro_acesso";
  senhaProvisoria?: string | null;
  criado_em: string;
  ultimo_acesso?: string | null;
}
