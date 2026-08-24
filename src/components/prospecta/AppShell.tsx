import { Link, useNavigate } from "@tanstack/react-router";
import {
  Compass,
  LayoutDashboard,
  ListFilter,
  LogOut,
  Map as MapIcon,
  Menu,
  Search,
  Kanban,
  Users,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type ItemNav = {
  para: string;
  rotulo: string;
  icone: typeof LayoutDashboard;
  somenteAdmin?: boolean;
};

const itens: ItemNav[] = [
  { para: "/painel", rotulo: "Painel", icone: LayoutDashboard },
  { para: "/nova-busca", rotulo: "Nova busca", icone: Search },
  { para: "/leads", rotulo: "Leads", icone: ListFilter },
  { para: "/funil", rotulo: "Funil", icone: Kanban },
  { para: "/buscas", rotulo: "Buscas realizadas", icone: MapIcon },
  { para: "/usuarios", rotulo: "Usuários", icone: Users, somenteAdmin: true },
];

function Navegacao({ ehAdmin, aoNavegar }: { ehAdmin: boolean; aoNavegar?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 p-3">
      {itens
        .filter((item) => !item.somenteAdmin || ehAdmin)
        .map((item) => (
          <Link
            key={item.para}
            to={item.para}
            onClick={aoNavegar}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            activeProps={{
              className:
                "bg-sidebar-accent text-sidebar-foreground border-l-2 border-l-primary",
            }}
          >
            <item.icone className="size-4 shrink-0" />
            <span>{item.rotulo}</span>
          </Link>
        ))}
    </nav>
  );
}

function Marca() {
  return (
    <div className="flex items-center gap-2.5 border-b border-sidebar-border px-4 py-4">
      <span className="flex size-9 items-center justify-center rounded-md bg-primary/12 text-primary ring-1 ring-primary/25">
        <Compass className="size-5" />
      </span>
      <div className="leading-tight">
        <p className="font-display text-base font-semibold tracking-tight">Prospecta</p>
        <p className="rotulo">12°58'S 38°30'W</p>
      </div>
    </div>
  );
}

export function AppShell({
  titulo,
  descricao,
  acoes,
  children,
}: {
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
  children: ReactNode;
}) {
  const { ehAdmin, nome, papel, user } = useAuth();
  const navigate = useNavigate();
  const [aberto, setAberto] = useState(false);

  async function sair() {
    await supabase.auth.signOut();
    void navigate({ to: "/auth" });
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <Marca />
        <div className="flex-1 overflow-y-auto">
          <Navegacao ehAdmin={ehAdmin} />
        </div>
        <div className="border-t border-sidebar-border p-3">
          <p className="rotulo">Sessão</p>
          <p className="truncate text-sm font-medium">{nome || user?.email}</p>
          <p className="dado text-xs text-muted-foreground capitalize">{papel ?? "—"}</p>
          <Button variant="ghost" size="sm" className="mt-2 w-full justify-start" onClick={sair}>
            <LogOut className="size-4" /> Sair
          </Button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur md:px-6">
          <Sheet open={aberto} onOpenChange={setAberto}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-0">
              <SheetTitle className="sr-only">Navegação</SheetTitle>
              <Marca />
              <Navegacao ehAdmin={ehAdmin} aoNavegar={() => setAberto(false)} />
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold md:text-xl">{titulo}</h1>
            {descricao ? (
              <p className="truncate text-xs text-muted-foreground md:text-sm">{descricao}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">{acoes}</div>
        </header>

        <main className={cn("malha-mapa min-h-[calc(100vh-65px)] p-4 md:p-6")}>{children}</main>
      </div>
    </div>
  );
}
