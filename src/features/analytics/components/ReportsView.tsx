import { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  FileSpreadsheet,
  Download,
  Printer,
  Filter,
  Search,
  CheckCircle2,
  Building2,
  Phone,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { leadsService, type LeadItem } from "@/features/leads";

export function ReportsView() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Filtros do Relatório
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroPresenca, setFiltroPresenca] = useState("todas");
  const [scoreMinimo, setScoreMinimo] = useState(0);

  useEffect(() => {
    leadsService.listarLeads().then((res) => {
      setLeads(res);
      setCarregando(false);
    });
  }, []);

  const categoriasDisponiveis = useMemo(() => {
    const s = new Set<string>();
    leads.forEach((l) => {
      if (l.categoria) s.add(l.categoria);
    });
    return Array.from(s).sort();
  }, [leads]);

  const leadsFiltrados = useMemo(() => {
    return leads.filter((l) => {
      if (filtroCategoria !== "todas" && l.categoria !== filtroCategoria) return false;
      if (filtroStatus !== "todos" && l.status !== filtroStatus) return false;
      if (filtroPresenca === "sem_site" && l.tem_site) return false;
      if (filtroPresenca === "com_site" && !l.tem_site) return false;
      if (l.score < scoreMinimo) return false;
      return true;
    });
  }, [leads, filtroCategoria, filtroStatus, filtroPresenca, scoreMinimo]);

  const exportarCSV = () => {
    if (leadsFiltrados.length === 0) {
      toast.error("Nenhum registro para exportar.");
      return;
    }

    const cabecalho = "Nome,Categoria,Bairro,Cidade,Score,Status,Telefone,PresencaDigital\n";
    const linhas = leadsFiltrados
      .map(
        (l) =>
          `"${l.nome}","${l.categoria}","${l.bairro || ""}","${l.cidade || ""}",${l.score},"${l.status}","${l.telefone || ""}","${!l.tem_site ? "Sem site" : "Com site"}"`,
      )
      .join("\n");

    const blob = new Blob([cabecalho + linhas], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_meridian_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Relatório CSV exportado com sucesso!");
  };

  const exportarJSON = () => {
    if (leadsFiltrados.length === 0) {
      toast.error("Nenhum registro para exportar.");
      return;
    }

    const blob = new Blob([JSON.stringify(leadsFiltrados, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_meridian_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Relatório JSON exportado com sucesso!");
  };

  const imprimirRelatorio = () => {
    window.print();
  };

  return (
    <AppShell
      titulo="Gerador de Relatórios Customizados"
      descricao="Construção de relatórios filtrados, segmentação sob demanda e exportação em múltiplos formatos"
      acoes={
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={imprimirRelatorio}
            className="h-8 text-xs border-border/80 gap-1.5"
          >
            <Printer className="size-3.5" />
            <span>Imprimir / PDF</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={exportarJSON}
            className="h-8 text-xs border-border/80 gap-1.5"
          >
            <Download className="size-3.5" />
            <span>Exportar JSON</span>
          </Button>

          <Button
            size="sm"
            onClick={exportarCSV}
            className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 shadow-xs"
          >
            <Download className="size-3.5" />
            <span>Exportar CSV</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-w-6xl">
        {/* FILTROS DO CONSTRUTOR DE RELATÓRIO */}
        <Card className="bg-card border-border/80 shadow-elev">
          <CardHeader className="pb-3 border-b border-border/60 bg-surface/30">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Filter className="size-4 text-primary" />
              Parâmetros do Relatório
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Configure os filtros para gerar a listagem exata desejada
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Categoria</span>
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger className="text-xs h-8.5 bg-surface/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as categorias</SelectItem>
                    {categoriasDisponiveis.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Status do Funil</span>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="text-xs h-8.5 bg-surface/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="novo">Novo</SelectItem>
                    <SelectItem value="contatado">Contatado</SelectItem>
                    <SelectItem value="proposta">Proposta</SelectItem>
                    <SelectItem value="fechado">Fechado</SelectItem>
                    <SelectItem value="recusado">Recusado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Presença Digital</span>
                <Select value={filtroPresenca} onValueChange={setFiltroPresenca}>
                  <SelectTrigger className="text-xs h-8.5 bg-surface/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as empresas</SelectItem>
                    <SelectItem value="sem_site">Apenas Sem Site Oficial</SelectItem>
                    <SelectItem value="com_site">Apenas Com Site</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Score Mínimo (0 a 100)</span>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={scoreMinimo}
                  onChange={(e) => setScoreMinimo(Number(e.target.value))}
                  className="text-xs h-8.5 bg-surface/50 font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PRÉ-VISUALIZAÇÃO DO RELATÓRIO */}
        <Card className="bg-card border-border/80 shadow-elev overflow-hidden">
          <div className="p-4 border-b border-border/60 bg-surface/30 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-foreground">
                Pré-visualização do Relatório Gerado
              </h4>
              <p className="text-xs text-muted-foreground">
                Total de <strong className="text-foreground">{leadsFiltrados.length} registros</strong> correspondentes aos filtros
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface/70 text-muted-foreground uppercase text-[10px] rotulo tracking-wider">
                  <th className="p-3 pl-4">Empresa / Razão Social</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Localização</th>
                  <th className="p-3">Telefone</th>
                  <th className="p-3">Presença Web</th>
                  <th className="p-3">Score</th>
                  <th className="p-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {leadsFiltrados.map((l) => (
                  <tr key={l.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-3 pl-4 font-semibold text-foreground">{l.nome}</td>
                    <td className="p-3 text-muted-foreground">{l.categoria}</td>
                    <td className="p-3 dado text-muted-foreground">
                      {l.bairro || l.cidade || "—"}
                    </td>
                    <td className="p-3 font-mono text-muted-foreground">{l.telefone || "—"}</td>
                    <td className="p-3">
                      {!l.tem_site ? (
                        <span className="text-primary font-semibold text-[11px]">Sem site</span>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">Com site</span>
                      )}
                    </td>
                    <td className="p-3 font-bold font-display text-primary dado">{l.score} pts</td>
                    <td className="p-3 pr-4 uppercase text-[10px] font-mono font-bold text-foreground">
                      {l.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
