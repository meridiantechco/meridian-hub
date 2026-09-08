import { useState } from "react";
import {
  Table as TableIcon,
  LayoutGrid,
  Sparkles,
  Zap,
  Flame,
  Instagram,
  CheckCircle2,
  Globe,
  Star,
  ExternalLink,
  Phone,
  Pencil,
  Loader2,
  PlusCircle,
  UserPlus,
  Check,
  Building2,
  MapPin,
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
  salvandoId?: string | null;
  salvosSet?: Set<string>;
  carregandoMais: boolean;
  onAlternarSelecao: (idTemp: string) => void;
  onSelecionarTodos: () => void;
  onSelecionarApenasSemSite: () => void;
  onSalvarImportacao: () => void;
  onSalvarIndividual?: (lead: LeadEncontrado) => Promise<void> | void;
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
  salvandoId,
  salvosSet = new Set(),
  carregandoMais,
  onAlternarSelecao,
  onSelecionarTodos,
  onSelecionarApenasSemSite,
  onSalvarImportacao,
  onSalvarIndividual,
  onCarregarMais,
  onEditarRede,
}: ProspectingResultsProps) {
  const selecionados = resultados.filter((r) => r.selecionado);
  const totalSemSite = resultados.filter((r) => !r.tem_site).length;
  const totalComInstagram = resultados.filter((r) => Boolean(r.instagram)).length;
  const totalAltaScore = resultados.filter((r) => r.score >= 70).length;
  const percSemSite =
    resultados.length > 0 ? Math.round((totalSemSite / resultados.length) * 100) : 0;

  if (resultados.length === 0) return null;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* BENTO GRID SUPERIOR: KPIS & CÁPSULAS DE STATUS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Card 1: Total Mapeado */}
        <div className="p-4 md:p-5 rounded-3xl bg-card border border-border/70 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Mapeados no Maps
            </span>
            <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="size-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold font-display tracking-tight text-foreground">
              {resultados.length}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Empresas mineradas nesta varredura
            </p>
          </div>
        </div>

        {/* Card 2: Sem Site com Barra Cápsula */}
        <div className="p-4 md:p-5 rounded-3xl bg-card border border-amber-500/30 shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
              Sem Site Próprio
            </span>
            <div className="size-8 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Zap className="size-4 fill-current" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl md:text-3xl font-bold font-display tracking-tight text-amber-400">
                {totalSemSite}
              </p>
              <span className="text-xs font-mono font-bold text-amber-300/80">
                [{percSemSite}% do total]
              </span>
            </div>
            {/* Barra Cápsula Bipartida */}
            <div className="w-full h-2 rounded-full bg-secondary/80 mt-2 overflow-hidden flex">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${percSemSite}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Com Instagram */}
        <div className="p-4 md:p-5 rounded-3xl bg-card border border-border/70 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-pink-400 uppercase tracking-wider">
              Presença no Instagram
            </span>
            <div className="size-8 rounded-full bg-pink-500/10 text-pink-400 flex items-center justify-center">
              <Instagram className="size-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold font-display tracking-tight text-pink-400">
              {totalComInstagram}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Perfis sociais identificados</p>
          </div>
        </div>

        {/* Card 4: Score Alto */}
        <div className="p-4 md:p-5 rounded-3xl bg-card border border-border/70 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
              Alta Prioridade (Score &ge; 70)
            </span>
            <div className="size-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Flame className="size-4 fill-current" />
            </div>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold font-display tracking-tight text-emerald-400">
              {totalAltaScore}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Prontos para fechamento imediato
            </p>
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS POR PÍLULAS & AÇÕES EM MASSA */}
      <div className="p-3.5 rounded-3xl bg-card border border-border/70 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Pílulas de filtro instantâneo */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-secondary/60 rounded-2xl sm:rounded-full border border-border/60">
          <button
            type="button"
            onClick={() => setFiltroLista("todos")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer",
              filtroLista === "todos"
                ? "bg-foreground text-background font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Todos ({resultados.length})
          </button>
          <button
            type="button"
            onClick={() => setFiltroLista("sem_site")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5",
              filtroLista === "sem_site"
                ? "bg-amber-500 text-black font-semibold shadow-xs"
                : "text-amber-400 hover:text-amber-300",
            )}
          >
            <Zap className="size-3 fill-current" />
            <span>Sem Site ({totalSemSite})</span>
          </button>
          <button
            type="button"
            onClick={() => setFiltroLista("alta_prioridade")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer",
              filtroLista === "alta_prioridade"
                ? "bg-foreground text-background font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Score &ge; 70 ({totalAltaScore})
          </button>
        </div>

        {/* Ações em lote e modo de exibição */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onSelecionarApenasSemSite}
              className="h-8 text-xs rounded-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10 font-semibold"
            >
              Marcar Sem Site ({totalSemSite})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onSelecionarTodos}
              className="h-8 text-xs rounded-full border-border/70 font-semibold"
            >
              {resultados.every((r) => r.selecionado)
                ? "Desmarcar Todos"
                : `Marcar Todos (${resultados.length})`}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {selecionados.length > 0 && (
              <Button
                size="sm"
                onClick={onSalvarImportacao}
                disabled={salvando}
                className="h-8 text-xs rounded-full bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-sm gap-1.5"
              >
                {salvando ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <UserPlus className="size-3.5" />
                    Importar Selecionados ({selecionados.length})
                  </>
                )}
              </Button>
            )}

            <div className="flex items-center gap-1 bg-secondary/80 p-0.5 rounded-full border border-border/80">
              <button
                type="button"
                onClick={() => setModoVisualizacao("grade")}
                className={cn(
                  "p-1.5 rounded-full text-xs transition-all cursor-pointer",
                  modoVisualizacao === "grade"
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="Visualização em Cards Bento"
              >
                <LayoutGrid className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setModoVisualizacao("tabela")}
                className={cn(
                  "p-1.5 rounded-full text-xs transition-all cursor-pointer",
                  modoVisualizacao === "tabela"
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="Visualização em Tabela"
              >
                <TableIcon className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RENDERIZAÇÃO DOS RESULTADOS */}
      {modoVisualizacao === "grade" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resultadosFiltrados.map((item) => {
            const jaSalvo = salvosSet.has(item.idTemp);
            const estaSalvandoEste = salvandoId === item.idTemp;

            return (
              <div
                key={item.idTemp}
                className={cn(
                  "p-5 rounded-3xl bg-card border border-border/70 shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between space-y-4",
                  item.selecionado && "ring-2 ring-primary/40 border-primary bg-primary/5",
                  jaSalvo && "border-emerald-500/40 bg-emerald-500/5",
                )}
              >
                <div className="space-y-3">
                  {/* Topo do Card: Checkbox + Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={item.selecionado}
                        onCheckedChange={() => onAlternarSelecao(item.idTemp)}
                        aria-label={`Selecionar ${item.nome}`}
                      />
                      <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/60 truncate max-w-[150px]">
                        {item.categoria || "Comércio"}
                      </span>
                    </div>
                    <BadgePriority score={item.score} />
                  </div>

                  {/* Nome da Empresa e Localização */}
                  <div>
                    <h3 className="font-bold text-base text-foreground line-clamp-1">
                      {item.nome}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
                      <MapPin className="size-3 shrink-0 text-muted-foreground/70" />
                      <span>{item.bairro || item.cidade || "Localização disponível"}</span>
                    </p>
                  </div>

                  {/* Avaliação e Notas Google */}
                  <div className="flex items-center justify-between text-xs py-2 border-y border-border/60">
                    <div className="flex items-center gap-1">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-foreground">
                        {item.avaliacao_google ? item.avaliacao_google.toFixed(1) : "—"}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        ({item.total_avaliacoes} avaliações)
                      </span>
                    </div>

                    {!item.tem_site ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        <Zap className="size-2.5 fill-current" />
                        Sem site próprio
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-muted-foreground border border-border/60">
                        <Globe className="size-2.5" />
                        Possui site
                      </span>
                    )}
                  </div>

                  {/* Contato & Redes */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 truncate">
                      {item.instagram && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-pink-400 font-mono">
                          <Instagram className="size-3" />@{item.instagram}
                        </span>
                      )}
                      {item.telefone && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                          <Phone className="size-3" />
                          {item.telefone}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onEditarRede(item)}
                      className="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Pencil className="size-3" />
                      Editar
                    </button>
                  </div>
                </div>

                {/* BOTÃO DE AÇÃO 1-CLIQUE */}
                <div className="pt-2 border-t border-border/60">
                  <Button
                    type="button"
                    onClick={() => onSalvarIndividual?.(item)}
                    disabled={jaSalvo || estaSalvandoEste}
                    className={cn(
                      "w-full h-9 rounded-full text-xs font-semibold gap-1.5 transition-all cursor-pointer shadow-xs",
                      jaSalvo
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 cursor-default"
                        : "bg-foreground text-background hover:bg-foreground/90 active:scale-95",
                    )}
                  >
                    {estaSalvandoEste ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        Adicionando...
                      </>
                    ) : jaSalvo ? (
                      <>
                        <Check className="size-3.5" />
                        Salvo em Meus Clientes
                      </>
                    ) : (
                      <>
                        <UserPlus className="size-3.5" />
                        Adicionar a Meus Clientes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* MODO TABELA */
        <Card className="bg-card border-border/70 shadow-sm rounded-3xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface/70 text-muted-foreground uppercase text-[10px] rotulo tracking-wider">
                    <th className="p-3.5 pl-4 w-10">Sel.</th>
                    <th className="p-3.5">Empresa</th>
                    <th className="p-3.5">Segmento</th>
                    <th className="p-3.5">Presença Web</th>
                    <th className="p-3.5">Avaliações</th>
                    <th className="p-3.5">Score</th>
                    <th className="p-3.5 pr-4 text-right">Captura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {resultadosFiltrados.map((item) => {
                    const jaSalvo = salvosSet.has(item.idTemp);
                    const estaSalvandoEste = salvandoId === item.idTemp;

                    return (
                      <tr
                        key={item.idTemp}
                        className={cn(
                          "hover:bg-secondary/20 transition-colors",
                          item.selecionado && "bg-primary/5",
                          jaSalvo && "bg-emerald-500/5",
                        )}
                      >
                        <td className="p-3.5 pl-4">
                          <Checkbox
                            checked={item.selecionado}
                            onCheckedChange={() => onAlternarSelecao(item.idTemp)}
                          />
                        </td>

                        <td className="p-3.5">
                          <div className="font-semibold text-foreground text-sm line-clamp-1">
                            {item.nome}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            📍 {item.bairro || item.cidade}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-secondary text-muted-foreground border border-border/60">
                            {item.categoria}
                          </span>
                        </td>

                        <td className="p-3.5">
                          {!item.tem_site ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                              <Zap className="size-2.5 fill-current" /> Sem site
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">Possui site</span>
                          )}
                        </td>

                        <td className="p-3.5">
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

                        <td className="p-3.5">
                          <BadgePriority score={item.score} />
                        </td>

                        <td className="p-3.5 pr-4 text-right">
                          <Button
                            size="sm"
                            onClick={() => onSalvarIndividual?.(item)}
                            disabled={jaSalvo || estaSalvandoEste}
                            className={cn(
                              "h-7 text-xs rounded-full px-3 font-semibold",
                              jaSalvo
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                                : "bg-foreground text-background hover:bg-foreground/90",
                            )}
                          >
                            {jaSalvo ? "Salvo ✓" : "Adicionar"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* BOTÃO CARREGAR MAIS */}
      <div className="flex justify-center pt-3 pb-6">
        <Button
          variant="outline"
          onClick={onCarregarMais}
          disabled={carregandoMais}
          className="text-xs h-10 px-6 gap-2 rounded-full border-border/80 font-semibold cursor-pointer hover:bg-secondary"
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
