import { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  MessageSquare,
  Copy,
  Plus,
  Sparkles,
  Trash2,
  Pencil,
  Building2,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { templatesService } from "../services/templatesService";
import { TemplateModal } from "./TemplateModal";
import type { TemplateMensagem, CategoriaTemplate } from "../types";
import { cn } from "@/lib/utils";

export function TemplatesView() {
  const [templates, setTemplates] = useState<TemplateMensagem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>("todos");

  // Modais
  const [modalAberto, setModalAberto] = useState(false);
  const [templateEditando, setTemplateEditando] = useState<TemplateMensagem | null>(null);

  // Simulador de variáveis
  const [simNome, setSimNome] = useState("Carlos");
  const [simEmpresa, setSimEmpresa] = useState("Restaurante Porto");
  const [simSegmento, setSimSegmento] = useState("Gastronomia");
  const [simResponsavel, setSimResponsavel] = useState("Equipe Meridian");

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const lista = await templatesService.listarTemplates();
      setTemplates(lista);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    void carregarDados();
  }, []);

  const templatesFiltrados = useMemo(() => {
    return templates.filter((t) => {
      if (categoriaAtiva !== "todos" && t.categoria !== categoriaAtiva) return false;
      return true;
    });
  }, [templates, categoriaAtiva]);

  const copiarTexto = (template: TemplateMensagem) => {
    const renderizado = templatesService.interpolar(template.texto, {
      nome: simNome,
      empresa: simEmpresa,
      segmento: simSegmento,
      responsavel: simResponsavel,
    });

    navigator.clipboard.writeText(renderizado);
    toast.success("Script copiado para a área de transferência!");
  };

  const handleSalvar = async (dados: Omit<TemplateMensagem, "id" | "variaveisSuportadas">) => {
    if (templateEditando) {
      await templatesService.atualizarTemplate(templateEditando.id, dados);
    } else {
      await templatesService.salvarTemplate(dados);
    }
    await carregarDados();
  };

  const handleExcluir = async (id: string, titulo: string) => {
    if (window.confirm(`Deseja excluir o script "${titulo}"?`)) {
      await templatesService.excluirTemplate(id);
      await carregarDados();
      toast.success("Script removido com sucesso!");
    }
  };

  return (
    <AppShell
      titulo="Templates & Scripts Comerciais"
      descricao="Modelos de mensagens de alta conversão para WhatsApp e E-mail com interpolação dinâmica"
      acoes={
        <Button
          onClick={() => {
            setTemplateEditando(null);
            setModalAberto(true);
          }}
          size="sm"
          className="h-8.5 px-3.5 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
        >
          <Plus className="size-3.5" />
          <span>Novo Script</span>
        </Button>
      }
    >
      <div className="space-y-6 max-w-6xl">
        {/* SIMULADOR DE VARIÁVEIS */}
        <Card className="bg-card border-border/80 shadow-elev p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider rotulo">
              Simulador de Variáveis Dinâmicas
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <span className="text-[10.5px] text-muted-foreground">{`{nome}`} (Decisor)</span>
              <Input
                value={simNome}
                onChange={(e) => setSimNome(e.target.value)}
                className="text-xs h-8 bg-surface/50 font-mono"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10.5px] text-muted-foreground">{`{empresa}`} (Conta)</span>
              <Input
                value={simEmpresa}
                onChange={(e) => setSimEmpresa(e.target.value)}
                className="text-xs h-8 bg-surface/50 font-mono"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10.5px] text-muted-foreground">{`{segmento}`} (Nicho)</span>
              <Input
                value={simSegmento}
                onChange={(e) => setSimSegmento(e.target.value)}
                className="text-xs h-8 bg-surface/50 font-mono"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10.5px] text-muted-foreground">{`{responsavel}`}</span>
              <Input
                value={simResponsavel}
                onChange={(e) => setSimResponsavel(e.target.value)}
                className="text-xs h-8 bg-surface/50 font-mono"
              />
            </div>
          </div>
        </Card>

        {/* ABAS DE CATEGORIAS */}
        <div className="flex items-center gap-1 bg-surface/80 p-1 rounded-xl border border-border/70 overflow-x-auto">
          {[
            { id: "todos", rotulo: "Todos os Scripts" },
            { id: "primeiro_contato", rotulo: "Primeiro Contato" },
            { id: "follow_up", rotulo: "Follow-up" },
            { id: "proposta", rotulo: "Proposta" },
            { id: "pos_reuniao", rotulo: "Pós-Reunião" },
            { id: "reativacao", rotulo: "Reativação" },
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoriaAtiva(c.id)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all whitespace-nowrap",
                categoriaAtiva === c.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {c.rotulo}
            </button>
          ))}
        </div>

        {/* LISTA DE TEMPLATES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templatesFiltrados.map((tpl) => {
            const preview = templatesService.interpolar(tpl.texto, {
              nome: simNome,
              empresa: simEmpresa,
              segmento: simSegmento,
              responsavel: simResponsavel,
            });

            return (
              <Card
                key={tpl.id}
                className="bg-card border-border/80 p-4 space-y-3.5 shadow-elev hover:border-primary/40 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-primary rotulo">
                        {tpl.categoria.replace("_", " ")}
                      </span>
                      <h4 className="font-bold text-sm text-foreground">{tpl.titulo}</h4>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {tpl.canal === "whatsapp" ? "WhatsApp" : "E-mail"}
                      </span>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setTemplateEditando(tpl);
                          setModalAberto(true);
                        }}
                        className="size-7 text-muted-foreground hover:text-foreground"
                        title="Editar script"
                      >
                        <Pencil className="size-3.5" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleExcluir(tpl.id, tpl.titulo)}
                        className="size-7 text-muted-foreground hover:text-destructive"
                        title="Remover script"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface/50 border border-border/60 text-xs text-foreground leading-relaxed font-sans">
                    {preview}
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {tpl.variaveisSuportadas.map((v, i) => (
                      <span
                        key={i}
                        className="text-[9.5px] font-mono text-muted-foreground bg-surface px-1.5 py-0.5 rounded border border-border"
                      >
                        {v}
                      </span>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => copiarTexto(tpl)}
                    className="h-7.5 px-3 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 shadow-xs"
                  >
                    <Copy className="size-3" />
                    <span>Copiar Script</span>
                  </Button>
                </div>
              </Card>
            );
          })}

          {templatesFiltrados.length === 0 && !carregando && (
            <div className="col-span-full py-12 text-center space-y-2 bg-card/40 rounded-2xl border border-dashed border-border/70 p-8">
              <MessageSquare className="size-8 text-muted-foreground/40 mx-auto" />
              <p className="text-sm font-semibold text-foreground">Nenhum script encontrado nesta categoria</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTemplateEditando(null);
                  setModalAberto(true);
                }}
                className="text-xs mt-2 gap-1.5"
              >
                <Plus className="size-3" />
                Criar Novo Script
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL ADICIONAR / EDITAR TEMPLATE */}
      <TemplateModal
        aberto={modalAberto}
        onOpenChange={setModalAberto}
        templateParaEditar={templateEditando}
        onSalvar={handleSalvar}
      />
    </AppShell>
  );
}
