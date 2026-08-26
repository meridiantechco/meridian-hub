import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/prospecta/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prospectaService } from "@/lib/prospecta-service";
import type { BuscaItem } from "@/lib/leads-mock";
import { Map, Search, RotateCw, Plus, Calendar, Layers, Globe, Compass } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/buscas")({
  head: () => ({
    meta: [
      { title: "Histórico de Buscas — Prospecta" },
      {
        name: "description",
        content: "Registro de varreduras cartográficas realizadas no Google Places",
      },
    ],
  }),
  component: PaginaBuscas,
});

export function PaginaBuscas() {
  const navigate = useNavigate();
  const [buscas, setBuscas] = useState<BuscaItem[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregarDados = async () => {
    setCarregando(true);
    const lista = await prospectaService.listarBuscas();
    setBuscas(lista);
    setCarregando(false);
  };

  useEffect(() => {
    void carregarDados();
  }, []);

  const reexecutarBusca = (busca: BuscaItem) => {
    toast.info(`Preparando re-execução para ${busca.categoria || busca.termo_busca}...`);
    void navigate({ to: "/nova-busca" });
  };

  return (
    <AppShell
      titulo="Varreduras e Buscas Realizadas"
      descricao="Histórico das regiões e categorias já mapeadas na API Google Places"
      acoes={
        <Button
          asChild
          size="sm"
          className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground"
        >
          <Link to="/nova-busca">
            <Plus className="size-3.5" />
            Nova Varredura
          </Link>
        </Button>
      }
    >
      <div className="space-y-4 max-w-5xl">
        <Card className="bg-card border-border shadow-elev overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface/70 text-muted-foreground uppercase text-[10px] rotulo tracking-wider">
                  <th className="p-3 pl-4">Termo / Segmento</th>
                  <th className="p-3">Região Mapeada</th>
                  <th className="p-3">Raio (km)</th>
                  <th className="p-3">Resultados</th>
                  <th className="p-3">Sem Site</th>
                  <th className="p-3">Data da Varredura</th>
                  <th className="p-3 pr-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {buscas.map((b) => {
                  const percSemSite =
                    b.total_resultados > 0
                      ? Math.round((b.total_sem_site / b.total_resultados) * 100)
                      : 0;

                  return (
                    <tr key={b.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-3 pl-4">
                        <p className="font-semibold text-sm text-foreground">
                          {b.categoria || b.termo_busca}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono truncate max-w-xs">
                          {b.termo_busca}
                        </p>
                      </td>

                      <td className="p-3 dado text-muted-foreground">
                        📍 {b.regiao || "Região metropolitana"}
                      </td>

                      <td className="p-3 dado text-foreground font-medium">{b.raio_km} km</td>

                      <td className="p-3 dado text-foreground font-medium">
                        <span className="flex items-center gap-1">
                          <Layers className="size-3 text-muted-foreground" />
                          {b.total_resultados} empresas
                        </span>
                      </td>

                      <td className="p-3 dado font-medium text-[var(--color-alerta)]">
                        <span className="flex items-center gap-1">
                          <Globe className="size-3" />
                          {b.total_sem_site} ({percSemSite}%)
                        </span>
                      </td>

                      <td className="p-3 dado text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {new Date(b.criada_em).toLocaleDateString("pt-BR")}
                        </span>
                      </td>

                      <td className="p-3 pr-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => reexecutarBusca(b)}
                          className="h-7 text-[11px] gap-1.5 hover:border-primary/50"
                        >
                          <RotateCw className="size-3" />
                          Re-executar
                        </Button>
                      </td>
                    </tr>
                  );
                })}

                {buscas.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-xs text-muted-foreground">
                      Nenhuma busca registrada ainda. Realize a primeira na tela de Nova Busca.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
