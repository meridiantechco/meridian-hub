import type { Session, User } from "@supabase/supabase-js";

export type Papel = "admin" | "vendedor";

export type EstadoAuth = {
  carregando: boolean;
  session: Session | null;
  user: User | null;
  nome: string;
  papel: Papel | null;
  ehAdmin: boolean;
};

export type AuthTab = "entrar" | "primeiro_acesso";
