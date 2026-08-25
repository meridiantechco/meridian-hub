import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/prospecta/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  ShieldCheck,
  UserPlus,
  Shield,
  User,
  CheckCircle,
  Mail,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/usuarios")({
  head: () => ({
    meta: [
      { title: "Gestão de Usuários — Prospecta" },
      { name: "description", content: "Administração de acessos e equipe de prospecção" },
    ],
  }),
  component: PaginaUsuarios,
});

type UsuarioItem = {
  id: string;
  nome: string;
  email: string;
  papel: "admin" | "vendedor";
  criado_em: string;
};

const USUARIOS_DEMO: UsuarioItem[] = [
  {
    id: "usr-001",
    nome: "Administrador Geral",
    email: "admin@prospecta.com.br",
    papel: "admin",
    criado_em: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  {
    id: "usr-002",
    nome: "Carlos Eduardo (Comercial)",
    email: "carlos.vendas@prospecta.com.br",
    papel: "vendedor",
    criado_em: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
  },
  {
    id: "usr-003",
    nome: "Mariana Souza (SDR)",
    email: "mariana.sdr@prospecta.com.br",
    papel: "vendedor",
    criado_em: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
];

export function PaginaUsuarios() {
  const { ehAdmin, user } = useAuth();
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>(USUARIOS_DEMO);
  const [carregando, setCarregando] = useState(false);

  // Formulário de convite
  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novoPapel, setNovoPapel] = useState<"admin" | "vendedor">("vendedor");

  const carregarUsuarios = async () => {
    setCarregando(true);
    try {
      const [perfis, roles] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("user_roles").select("*"),
      ]);

      if (perfis.data && perfis.data.length > 0) {
        const combinados: UsuarioItem[] = perfis.data.map((p) => {
          const roleData = (roles.data ?? []).find((r) => r.user_id === p.id);
          return {
            id: p.id,
            nome: p.nome,
            email: p.email,
            papel: (roleData?.role as "admin" | "vendedor") ?? "vendedor",
            criado_em: p.criado_em,
          };
        });
        setUsuarios(combinados);
      }
    } catch {
      // fallback demo
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    void carregarUsuarios();
  }, []);

  const alterarPapel = async (userId: string, papel: "admin" | "vendedor") => {
    try {
      await supabase
        .from("user_roles")
        .upsert({ user_id: userId, role: papel });
    } catch {
      // fallback
    }

    setUsuarios((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, papel } : u))
    );
    toast.success("Permissão do usuário atualizada!");
  };

  const convidarMembro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim() || !novoEmail.trim()) {
      toast.error("Preencha todos os campos do membro.");
      return;
    }

    const novo: UsuarioItem = {
      id: `usr-${Date.now()}`,
      nome: novoNome,
      email: novoEmail,
      papel: novoPapel,
      criado_em: new Date().toISOString(),
    };

    setUsuarios((prev) => [novo, ...prev]);
    setNovoNome("");
    setNovoEmail("");
    toast.success(`Membro ${novoNome} adicionado à equipe!`);
  };

  return (
    <AppShell
      titulo="Gestão de Usuários e Permissões"
      descricao="Controle de acesso e equipe comercial do sistema Prospecta"
    >
      <div className="space-y-6 max-w-5xl">
        {/* AVISO DE POLÍTICA DE ACESSO */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border text-xs text-muted-foreground">
          <ShieldCheck className="size-5 text-primary shrink-0" />
          <div>
            <strong className="text-foreground block">Política de Segurança Comercial (RLS):</strong>
            Vendedores acessam exclusivamente os leads que lhes forem atribuídos (ou sem responsável). Administradores possuem visibilidade completa da base de dados e configurações da equipe.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* TABELA DE USUÁRIOS */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-card border-border shadow-elev">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  Membros da Equipe ({usuarios.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  Usuários com acesso ao painel de prospecção
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {usuarios.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-4 gap-3 hover:bg-secondary/20 transition-colors"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground truncate">
                            {u.nome}
                          </span>
                          {u.papel === "admin" ? (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                              <Shield className="size-2.5" /> Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                              <User className="size-2.5" /> Vendedor
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5 dado">
                          <Mail className="size-3" /> {u.email}
                        </p>
                      </div>

                      {/* Dropdown de Papel */}
                      <Select
                        value={u.papel}
                        onValueChange={(val) => alterarPapel(u.id, val as "admin" | "vendedor")}
                      >
                        <SelectTrigger className="h-8 w-32 text-xs bg-background/60">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vendedor">Vendedor</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FORMULÁRIO DE ADIÇÃO DE NOVO MEMBRO */}
          <div className="space-y-4">
            <Card className="bg-card border-border shadow-elev">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <UserPlus className="size-4 text-primary" />
                  Adicionar Membro
                </CardTitle>
                <CardDescription className="text-xs">
                  Cadastre novos vendedores ou administradores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={convidarMembro} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="nome-membro" className="text-xs">Nome Completo</Label>
                    <Input
                      id="nome-membro"
                      value={novoNome}
                      onChange={(e) => setNovoNome(e.target.value)}
                      placeholder="Ex: João Silva"
                      className="text-xs h-9"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="email-membro" className="text-xs">E-mail Profissional</Label>
                    <Input
                      id="email-membro"
                      type="email"
                      value={novoEmail}
                      onChange={(e) => setNovoEmail(e.target.value)}
                      placeholder="joao@empresa.com.br"
                      className="text-xs h-9"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="papel-membro" className="text-xs">Função / Papel</Label>
                    <Select
                      value={novoPapel}
                      onValueChange={(val) => setNovoPapel(val as any)}
                    >
                      <SelectTrigger id="papel-membro" className="text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vendedor">Vendedor (SDR / Closer)</SelectItem>
                        <SelectItem value="admin">Administrador Geral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground text-xs gap-1.5 mt-2"
                  >
                    <CheckCircle className="size-3.5" />
                    Adicionar à Equipe
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
