import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { leadsService, type BuscaItem } from "@/features/leads";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function ProspectingHistoryView() {
  const navigate = useNavigate();
  const [buscas, setBuscas] = useState<BuscaItem[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregarDados = async () => {
    setCarregando(true);
    const lista = await leadsService.listarBuscas();
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
      descricao="Histórico das regiões e categorias já mapeadas pela Meridian Tech"
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

                      <td className="p-3 dado font-bold text-foreground">{b.total_resultados}</td>

                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 rounded bg-[var(--color-alerta)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-alerta)] border border-[var(--color-alerta)]/30 dado">
                          {b.total_sem_site} ({percSemSite}%)
                        </span>
                      </td>

                      <td className="p-3 dado text-muted-foreground">
                        {new Date(b.criada_em).toLocaleDateString("pt-BR")}
                      </td>

                      <td className="p-3 pr-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => reexecutarBusca(b)}
                          className="h-7 text-xs text-primary hover:underline"
                        >
                          Re-executar
                        </Button>
                      </td>
                    </tr>
                  );
                })}

                {buscas.length === 0 && !carregando && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground text-xs">
                      Nenhuma varredura registrada ainda. Clique em "Nova Varredura" para iniciar.
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
