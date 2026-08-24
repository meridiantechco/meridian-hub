import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Compass, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar no Prospecta — prospecção de leads sem site" },
      {
        name: "description",
        content:
          "Acesse o Prospecta para localizar, priorizar e gerenciar leads de empresas locais que ainda não têm site próprio.",
      },
      { property: "og:title", content: "Entrar no Prospecta" },
      {
        property: "og:description",
        content: "Painel interno de prospecção de empresas locais sem site próprio.",
      },
    ],
  }),
  component: PaginaAuth,
});

function PaginaAuth() {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/painel" });
    });
  }, [navigate]);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setCarregando(false);
    if (error) {
      toast.error("Não foi possível entrar", { description: error.message });
      return;
    }
    void navigate({ to: "/painel" });
  }

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome },
        emailRedirectTo: `${window.location.origin}/painel`,
      },
    });
    setCarregando(false);
    if (error) {
      toast.error("Não foi possível criar a conta", { description: error.message });
      return;
    }
    toast.success("Conta criada", {
      description: "Se a confirmação de e-mail estiver ativa, verifique sua caixa de entrada.",
    });
    void navigate({ to: "/painel" });
  }

  return (
    <div className="malha-mapa flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-md bg-primary/12 text-primary ring-1 ring-primary/25">
            <Compass className="size-6" />
          </span>
          <div>
            <p className="font-display text-2xl font-semibold tracking-tight">Prospecta</p>
            <p className="rotulo">Prospecção de campo · leads sem site</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-elev">
          <Tabs defaultValue="entrar">
            <TabsList className="w-full">
              <TabsTrigger value="entrar" className="flex-1">
                Entrar
              </TabsTrigger>
              <TabsTrigger value="criar" className="flex-1">
                Criar conta
              </TabsTrigger>
            </TabsList>

            <TabsContent value="entrar" className="pt-5">
              <form className="space-y-4" onSubmit={entrar}>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@empresa.com.br"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha</Label>
                  <Input
                    id="senha"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={carregando}>
                  {carregando ? <Loader2 className="size-4 animate-spin" /> : null}
                  Entrar no painel
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="criar" className="pt-5">
              <form className="space-y-4" onSubmit={cadastrar}>
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input
                    id="nome"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Maria Souza"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-novo">E-mail</Label>
                  <Input
                    id="email-novo"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha-nova">Senha</Label>
                  <Input
                    id="senha-nova"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={carregando}>
                  {carregando ? <Loader2 className="size-4 animate-spin" /> : null}
                  Criar conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          O primeiro usuário cadastrado recebe o papel de administrador.
        </p>
      </div>
    </div>
  );
}
