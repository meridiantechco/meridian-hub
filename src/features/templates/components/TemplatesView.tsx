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
  Zap,
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
  const [simResponsavel, setSimResponsavel] = useState("Equipe Comercial");

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
      descricao="Modelos validados de alta conversão para WhatsApp e E-mail com interpolação dinâmica"
      acoes={
        <Button
          onClick={() => {
            setTemplateEditando(null);
            setModalAberto(true);
          }}
          size="sm"
          className="h-9 px-4 rounded-full gap-2 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Plus className="size-4" />
          <span>Novo Script</span>
        </Button>
      }
    >
      <div className="space-y-6 sm:space-y-8 w-full">
        {/* SIMULADOR DE VARIÁVEIS BENTO */}
        <Card className="bg-card/85 backdrop-blur-sm border-border/70 shadow-sm rounded-3xl p-5 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <Sparkles className="size-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground font-display">
                  Simulador de Variáveis Dinâmicas
                </h4>
                <p className="text-xs text-muted-foreground">
                  Altere os valores de teste para visualizar os scripts personalizados em tempo real
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground">
                {`{nome}`} (Decisor / Contato)
              </span>
              <Input
                value={simNome}
                onChange={(e) => setSimNome(e.target.value)}
                className="text-xs h-9 rounded-full bg-surface/60 font-mono border-border/70"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground">
                {`{empresa}`} (Nome Comercial)
              </span>
              <Input
                value={simEmpresa}
                onChange={(e) => setSimEmpresa(e.target.value)}
                className="text-xs h-9 rounded-full bg-surface/60 font-mono border-border/70"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground">
                {`{segmento}`} (Nicho)
              </span>
              <Input
                value={simSegmento}
                onChange={(e) => setSimSegmento(e.target.value)}
                className="text-xs h-9 rounded-full bg-surface/60 font-mono border-border/70"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground">
                {`{responsavel}`} (Seu Nome / Agência)
              </span>
              <Input
                value={simResponsavel}
                onChange={(e) => setSimResponsavel(e.target.value)}
                className="text-xs h-9 rounded-full bg-surface/60 font-mono border-border/70"
              />
            </div>
          </div>
        </Card>

        {/* BARRA DE FILTROS POR ETAPA EM CÁPSULAS */}
        <div className="flex items-center gap-1.5 bg-secondary/70 backdrop-blur-sm p-1.5 rounded-2xl sm:rounded-full border border-border/70 overflow-x-auto scrollbar-none">
          {[
            { id: "todos", rotulo: "Todos os Scripts" },
            { id: "primeiro_contato", rotulo: "Primeiro Contato" },
            { id: "follow_up", rotulo: "Follow-up" },
            { id: "proposta", rotulo: "Envio de Proposta" },
            { id: "pos_reuniao", rotulo: "Pós-Apresentação" },
            { id: "reativacao", rotulo: "Reativação" },
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoriaAtiva(c.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all whitespace-nowrap",
                categoriaAtiva === c.id
                  ? "bg-foreground text-background shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {c.rotulo}
            </button>
          ))}
        </div>

        {/* LISTA DE TEMPLATES BENTO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                className="bg-card/85 backdrop-blur-sm border-border/70 rounded-3xl p-5 sm:p-6 shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10.5px] uppercase font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                        {tpl.categoria.replace("_", " ")}
                      </span>
                      <h4 className="font-bold text-base text-foreground mt-1.5">{tpl.titulo}</h4>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
                        {tpl.canal === "whatsapp" ? "WhatsApp" : "E-mail"}
                      </span>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setTemplateEditando(tpl);
                          setModalAberto(true);
                        }}
                        className="size-7.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary"
                        title="Editar script"
                      >
                        <Pencil className="size-3.5" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleExcluir(tpl.id, tpl.titulo)}
                        className="size-7.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Remover script"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface/60 border border-border/60 text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                    {preview}
                  </div>
                </div>

                <div className="pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-1 flex-wrap">
                    {tpl.variaveisSuportadas.map((v, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-full border border-border/60"
                      >
                        {v}
                      </span>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => copiarTexto(tpl)}
                    className="h-8.5 px-4 rounded-full text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold gap-1.5 shadow-xs transition-all hover:scale-105 active:scale-95"
                  >
                    <Copy className="size-3.5" />
                    <span>Copiar Script</span>
                  </Button>
                </div>
              </Card>
            );
          })}

          {templatesFiltrados.length === 0 && !carregando && (
            <div className="col-span-full py-14 text-center space-y-3 bg-card/50 rounded-3xl border border-dashed border-border/70 p-8">
              <MessageSquare className="size-9 text-muted-foreground/40 mx-auto" />
              <p className="text-base font-bold text-foreground">
                Nenhum script encontrado nesta categoria
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Você pode cadastrar scripts personalizados para sua equipe usar nas abordagens
                comerciais.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTemplateEditando(null);
                  setModalAberto(true);
                }}
                className="text-xs rounded-full mt-2 gap-1.5"
              >
                <Plus className="size-3.5" />
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
