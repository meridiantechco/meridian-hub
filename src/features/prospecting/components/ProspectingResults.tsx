import { useState } from "react";
import {
  Table as TableIcon,
  LayoutGrid,
  Sparkles,
  Zap,
  Flame,
  Instagram,
  CheckCircle2,
  AlertCircle,
  Globe,
  Star,
  ExternalLink,
  Phone,
  Pencil,
  Loader2,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { BadgePriority } from "@/features/leads";
import { cn } from "@/lib/utils";
import type { LeadEncontrado } from "../types";

interface ProspectingResultsProps {
  resultados: LeadEncontrado[];
  resultadosFiltrados: LeadEncontrado[];
  modoVisualizacao: "tabela" | "grade";
  setModoVisualizacao: (modo: "tabela" | "grade") => void;
  filtroLista: "todos" | "sem_site" | "alta_prioridade" | "com_whatsapp";
  setFiltroLista: (f: "todos" | "sem_site" | "alta_prioridade" | "com_whatsapp") => void;
  origemBusca: string;
  salvando: boolean;
  carregandoMais: boolean;
  onAlternarSelecao: (idTemp: string) => void;
  onSelecionarTodos: () => void;
  onSelecionarApenasSemSite: () => void;
  onSalvarImportacao: () => void;
  onCarregarMais: () => void;
  onEditarRede: (lead: LeadEncontrado) => void;
}

export function ProspectingResults({
  resultados,
  resultadosFiltrados,
  modoVisualizacao,
  setModoVisualizacao,
  filtroLista,
  setFiltroLista,
  origemBusca,
  salvando,
  carregandoMais,
  onAlternarSelecao,
  onSelecionarTodos,
  onSelecionarApenasSemSite,
  onSalvarImportacao,
  onCarregarMais,
  onEditarRede,
}: ProspectingResultsProps) {
  const selecionados = resultados.filter((r) => r.selecionado);
  const totalSemSite = resultados.filter((r) => !r.tem_site).length;
  const totalComInstagram = resultados.filter((r) => Boolean(r.instagram)).length;
  const totalAltaScore = resultados.filter((r) => r.score >= 70).length;

  if (resultados.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* BARRA SUPERIOR DE RESUMO */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-card border border-border/70 shadow-sm flex items-center justify-between">
          <div>
            <p className="rotulo text-[10px]">Total Detectado</p>
            <p className="text-xl font-bold font-display dado mt-0.5 text-foreground">
              {resultados.length}
            </p>
          </div>
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Sparkles className="size-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-card border border-border/70 shadow-sm flex items-center justify-between ring-1 ring-[var(--color-alerta)]/30">
          <div>
            <p className="rotulo text-[10px] text-[var(--color-alerta)]">Sem Site Próprio</p>
            <p className="text-xl font-bold font-display text-[var(--color-alerta)] dado mt-0.5">
              {totalSemSite}
            </p>
          </div>
          <div className="size-8 rounded-lg bg-[var(--color-alerta)]/15 text-[var(--color-alerta)] flex items-center justify-center">
            <Zap className="size-4 fill-current" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-card border border-border/70 shadow-sm flex items-center justify-between">
          <div>
            <p className="rotulo text-[10px] text-pink-400">Com Instagram</p>
            <p className="text-xl font-bold font-display text-pink-400 dado mt-0.5">
              {totalComInstagram}
            </p>
          </div>
          <div className="size-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
            <Instagram className="size-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-card border border-border/70 shadow-sm flex items-center justify-between">
          <div>
            <p className="rotulo text-[10px] text-amber-400">Score &ge; 70</p>
            <p className="text-xl font-bold font-display text-amber-400 dado mt-0.5">
              {totalAltaScore}
            </p>
          </div>
          <div className="size-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Flame className="size-4 fill-current" />
          </div>
        </div>
      </div>

      {/* BARRA DE AÇÕES EM MASSA & FILTROS */}
      <Card className="bg-card border-border shadow-elev">
        <CardContent className="p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onSelecionarTodos}
              className="h-8 text-xs font-semibold"
            >
              {resultados.every((r) => r.selecionado)
                ? "Desmarcar Todos"
                : `Selecionar Todos (${resultados.length})`}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onSelecionarApenasSemSite}
              className="h-8 text-xs text-[var(--color-alerta)] hover:bg-[var(--color-alerta)]/10 border-[var(--color-alerta)]/30 font-semibold"
            >
              Selecionar Sem Site ({totalSemSite})
            </Button>

            {/* Filtros da lista */}
            <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-border/70">
              <button
                type="button"
                onClick={() => setFiltroLista("todos")}
                className={cn(
                  "px-2 py-0.5 text-[11px] rounded font-medium transition-all",
                  filtroLista === "todos"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Todos ({resultados.length})
              </button>
              <button
                type="button"
                onClick={() => setFiltroLista("sem_site")}
                className={cn(
                  "px-2 py-0.5 text-[11px] rounded font-medium transition-all",
                  filtroLista === "sem_site"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Sem site ({totalSemSite})
              </button>
              <button
                type="button"
                onClick={() => setFiltroLista("alta_prioridade")}
                className={cn(
                  "px-2 py-0.5 text-[11px] rounded font-medium transition-all",
                  filtroLista === "alta_prioridade"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Score Alto ({totalAltaScore})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1 bg-secondary/80 p-0.5 rounded-lg border border-border/80">
              <button
                type="button"
                onClick={() => setModoVisualizacao("tabela")}
                className={cn(
                  "p-1.5 rounded text-xs transition-all",
                  modoVisualizacao === "tabela"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <TableIcon className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setModoVisualizacao("grade")}
                className={cn(
                  "p-1.5 rounded text-xs transition-all",
                  modoVisualizacao === "grade"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <LayoutGrid className="size-3.5" />
              </button>
            </div>

            <Button
              onClick={onSalvarImportacao}
              disabled={salvando || selecionados.length === 0}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-8 px-4 gap-1.5 shadow-sm"
            >
              {salvando ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="size-3.5" />
              )}
              Importar {selecionados.length} Selecionados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* MODO TABELA */}
      {modoVisualizacao === "tabela" ? (
        <Card className="bg-card border-border shadow-elev overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface/70 text-muted-foreground uppercase text-[10px] rotulo tracking-wider">
                    <th className="p-3 pl-4 w-10">
                      <Checkbox
                        checked={
                          resultados.length > 0 && resultados.every((r) => r.selecionado)
                        }
                        onCheckedChange={onSelecionarTodos}
                      />
                    </th>
                    <th className="p-3">Estabelecimento</th>
                    <th className="p-3">Localização</th>
                    <th className="p-3">Contato & Instagram</th>
                    <th className="p-3">Presença Web</th>
                    <th className="p-3">Google Places</th>
                    <th className="p-3">Score</th>
                    <th className="p-3 pr-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {resultadosFiltrados.map((item) => (
                    <tr
                      key={item.idTemp}
                      className={cn(
                        "hover:bg-secondary/20 transition-colors",
                        item.selecionado && "bg-primary/5",
                      )}
                    >
                      <td className="p-3 pl-4">
                        <Checkbox
                          checked={item.selecionado}
                          onCheckedChange={() => onAlternarSelecao(item.idTemp)}
                        />
                      </td>

                      <td className="p-3">
                        <p className="font-semibold text-foreground line-clamp-1">{item.nome}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">
                          {item.endereco || item.categoria}
                        </p>
                      </td>

                      <td className="p-3 dado text-muted-foreground">
                        {item.bairro || item.cidade}
                      </td>

                      <td className="p-3">
                        <div className="space-y-0.5">
                          {item.telefone ? (
                            <p className="font-mono text-xs text-foreground flex items-center gap-1">
                              <Phone className="size-3 text-muted-foreground" />
                              {item.telefone}
                            </p>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">Sem telefone</span>
                          )}

                          {item.instagram && (
                            <p className="text-[10px] text-pink-400 font-mono flex items-center gap-1">
                              <Instagram className="size-2.5" /> @{item.instagram}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="p-3">
                        {!item.tem_site ? (
                          <span className="inline-flex items-center gap-1 rounded bg-[var(--color-alerta)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-alerta)] border border-[var(--color-alerta)]/30">
                            <AlertCircle className="size-2.5" /> Sem site
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Globe className="size-2.5" /> Com site
                          </span>
                        )}
                      </td>

                      <td className="p-3">
                        {item.avaliacao_google ? (
                          <div className="flex items-center gap-1 text-amber-400 font-mono">
                            <Star className="size-3 fill-amber-400" />
                            <span className="font-bold">{item.avaliacao_google.toFixed(1)}</span>
                            <span className="text-[10px] text-muted-foreground">
                              ({item.total_avaliacoes})
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-[10px]">Sem nota</span>
                        )}
                      </td>

                      <td className="p-3">
                        <BadgePriority score={item.score} />
                      </td>

                      <td className="p-3 pr-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditarRede(item)}
                          className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="size-3 mr-1" /> Editar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* MODO GRADE */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {resultadosFiltrados.map((item) => (
            <Card
              key={item.idTemp}
              className={cn(
                "bg-card border-border/80 shadow-elev hover:border-primary/40 transition-all flex flex-col justify-between",
                item.selecionado && "border-primary ring-1 ring-primary/30 bg-primary/5",
              )}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Checkbox
                    checked={item.selecionado}
                    onCheckedChange={() => onAlternarSelecao(item.idTemp)}
                  />
                  <BadgePriority score={item.score} />
                </div>

                <div>
                  <h4 className="font-bold text-sm text-foreground line-clamp-1">{item.nome}</h4>
                  <p className="text-xs text-muted-foreground truncate dado mt-0.5">
                    📍 {item.bairro || item.cidade}
                  </p>
                </div>

                <div className="space-y-1 py-1 border-y border-border/60 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px]">Presença:</span>
                    {!item.tem_site ? (
                      <span className="text-[10px] font-semibold text-[var(--color-alerta)]">
                        Sem site próprio
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Possui site</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px]">Instagram:</span>
                    <span className="text-[10px] text-pink-400 font-mono truncate max-w-[120px]">
                      @{item.instagram || "—"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditarRede(item)}
                    className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="size-3 mr-1" /> Redes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* BOTÃO CARREGAR MAIS */}
      <div className="flex justify-center pt-3 pb-6">
        <Button
          variant="outline"
          onClick={onCarregarMais}
          disabled={carregandoMais}
          className="text-xs h-9 px-6 gap-2 border-border/80 font-semibold"
        >
          {carregandoMais ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Varrendo Mais Estabelecimentos...
            </>
          ) : (
            <>
              <PlusCircle className="size-3.5" />
              Carregar +20 Empresas na Região
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
