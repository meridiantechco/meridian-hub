import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Instagram, Facebook, Globe, Search, Save } from "lucide-react";
import {
  sanitizarHandleInstagram,
  ehRedeSocialOuAgregador,
  gerarUrlBuscaInstagram,
  gerarHandleSugerido,
} from "@/features/leads";
import { calcularScoreLead } from "@/features/leads";
import { toast } from "sonner";
import { useProspecting } from "../hooks/useProspecting";
import { ProspectingForm } from "./ProspectingForm";
import { ProspectingResults } from "./ProspectingResults";
import type { LeadEncontrado } from "../types";

export function ProspectingView() {
  const {
    categoria,
    setCategoria,
    regiao,
    setRegiao,
    raioKm,
    setRaioKm,
    buscando,
    salvando,
    carregandoMais,
    resultados,
    setResultados,
    resultadosFiltrados,
    modoVisualizacao,
    setModoVisualizacao,
    buscaRealizada,
    origemBusca,
    filtroLista,
    setFiltroLista,
    executarBusca,
    carregarMaisEstabelecimentos,
    alternarSelecao,
    selecionarTodos,
    selecionarApenasSemSite,
    salvarLeadsSelecionados,
  } = useProspecting();

  const [leadEditandoRede, setLeadEditandoRede] = useState<LeadEncontrado | null>(null);
  const [modalEditarRedeAberto, setModalEditarRedeAberto] = useState(false);

  const handleSalvarRedeManual = (
    idTemp: string,
    instagram: string,
    facebook: string,
    site_url: string,
  ) => {
    setResultados((prev) =>
      prev.map((item) => {
        if (item.idTemp !== idTemp) return item;

        const instaLimpo = sanitizarHandleInstagram(instagram);
        const faceLimpo = facebook.trim() || null;
        const ehSocial = ehRedeSocialOuAgregador(site_url);
        const tem_site = Boolean(site_url.trim() && !ehSocial);

        const novoScore = calcularScoreLead({
          tem_site,
          instagram: instaLimpo,
          facebook: faceLimpo,
          total_avaliacoes: item.total_avaliacoes,
          avaliacao_google: item.avaliacao_google,
          criado_em: new Date().toISOString(),
        });

        return {
          ...item,
          instagram: instaLimpo,
          facebook: faceLimpo,
          site_url: tem_site ? site_url : null,
          tem_site,
          score: novoScore,
        };
      }),
    );
    toast.success("Redes sociais ajustadas e score recalculado!");
  };

  const handleAbrirEdicao = (lead: LeadEncontrado) => {
    setLeadEditandoRede(lead);
    setModalEditarRedeAberto(true);
  };

  return (
    <AppShell
      titulo="Detectar Empresas"
      descricao="Varredura geográfica para identificar estabelecimentos locais e oportunidades sem site"
    >
      <div className="space-y-6 max-w-6xl">
        <ProspectingForm
          categoria={categoria}
          setCategoria={setCategoria}
          regiao={regiao}
          setRegiao={setRegiao}
          raioKm={raioKm}
          setRaioKm={setRaioKm}
          buscando={buscando}
          onBuscar={executarBusca}
        />

        {buscaRealizada && (
          <ProspectingResults
            resultados={resultados}
            resultadosFiltrados={resultadosFiltrados}
            modoVisualizacao={modoVisualizacao}
            setModoVisualizacao={setModoVisualizacao}
            filtroLista={filtroLista}
            setFiltroLista={setFiltroLista}
            origemBusca={origemBusca}
            salvando={salvando}
            carregandoMais={carregandoMais}
            onAlternarSelecao={alternarSelecao}
            onSelecionarTodos={selecionarTodos}
            onSelecionarApenasSemSite={selecionarApenasSemSite}
            onSalvarImportacao={salvarLeadsSelecionados}
            onCarregarMais={carregarMaisEstabelecimentos}
            onEditarRede={handleAbrirEdicao}
          />
        )}
      </div>

      {leadEditandoRede && (
        <ModalEditarRedeSimulada
          lead={leadEditandoRede}
          aberto={modalEditarRedeAberto}
          onOpenChange={setModalEditarRedeAberto}
          onSalvar={(insta, face, site) =>
            handleSalvarRedeManual(leadEditandoRede.idTemp, insta, face, site)
          }
        />
      )}
    </AppShell>
  );
}

function ModalEditarRedeSimulada({
  lead,
  aberto,
  onOpenChange,
  onSalvar,
}: {
  lead: LeadEncontrado;
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  onSalvar: (instagram: string, facebook: string, siteUrl: string) => void;
}) {
  const [instagram, setInstagram] = useState(lead.instagram || "");
  const [facebook, setFacebook] = useState(lead.facebook || "");
  const [siteUrl, setSiteUrl] = useState(lead.site_url || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvar(instagram, facebook, siteUrl);
    onOpenChange(false);
  };

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base flex items-center gap-2">
            <Instagram className="size-4 text-pink-400" />
            Editar Redes Sociais do Lead
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Ajuste o Instagram ou Facebook de <strong>{lead.nome}</strong> antes de importar para a
            base.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="edit-insta"
                className="text-xs font-semibold text-foreground flex items-center gap-1.5"
              >
                <Instagram className="size-3.5 text-pink-400" />
                Perfil do Instagram
              </Label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInstagram(gerarHandleSugerido(lead.nome))}
                  className="text-[10px] text-primary hover:underline"
                >
                  Sugerir @
                </button>
                <a
                  href={gerarUrlBuscaInstagram(lead.nome, lead.cidade || lead.bairro)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-pink-400 hover:underline flex items-center gap-0.5"
                >
                  <Search className="size-2.5" /> Buscar no Google
                </a>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">@</span>
              <Input
                id="edit-insta"
                placeholder="ex: perfil_da_empresa"
                value={instagram.replace(/^@/, "")}
                onChange={(e) => setInstagram(e.target.value)}
                className="text-xs h-9 pl-7 bg-surface/50 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="edit-face"
              className="text-xs font-semibold text-foreground flex items-center gap-1.5"
            >
              <Facebook className="size-3.5 text-blue-400" />
              Página do Facebook (Opcional)
            </Label>
            <Input
              id="edit-face"
              placeholder="ex: pagina_da_empresa"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              className="text-xs h-9 bg-surface/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="edit-site"
              className="text-xs font-semibold text-foreground flex items-center gap-1.5"
            >
              <Globe className="size-3.5 text-primary" />
              Website / Link na Bio
            </Label>
            <Input
              id="edit-site"
              placeholder="ex: https://linktr.ee/..."
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              className="text-xs h-9 bg-surface/50 font-mono text-[11px]"
            />
          </div>

          <DialogFooter className="pt-2 border-t border-border flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-primary text-primary-foreground text-xs h-8 gap-1.5 font-semibold"
            >
              <Save className="size-3.5" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
