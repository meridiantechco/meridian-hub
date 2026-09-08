import { Search, Loader2, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CAPITAIS_BRASIL_RAPIDAS } from "@/lib/geo-brasil";
import { SUGESTOES_CATEGORIAS } from "../types";

interface ProspectingFormProps {
  categoria: string;
  setCategoria: (cat: string) => void;
  regiao: string;
  setRegiao: (regiao: string) => void;
  raioKm: number[];
  setRaioKm: (raio: number[]) => void;
  buscando: boolean;
  onBuscar: (e: React.FormEvent) => void;
}

export function ProspectingForm({
  categoria,
  setCategoria,
  regiao,
  setRegiao,
  raioKm,
  setRaioKm,
  buscando,
  onBuscar,
}: ProspectingFormProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-card via-card/90 to-surface/60 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
      {/* Glow decorativo de fundo */}
      <div className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 size-64 rounded-full bg-purple-600/10 blur-3xl" />

      <div className="relative z-10 space-y-6">
        {/* Cabeçalho Hero Bento */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[11px] font-semibold tracking-wide">
              <Sparkles className="size-3.5" />
              <span>Varredura & Mineração no Google Maps</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight text-foreground">
              Buscar Novos Clientes Locais
            </h2>
            <p className="text-xs text-muted-foreground max-w-lg">
              Digite o nicho e a cidade para detectar estabelecimentos comerciais e priorizar
              empresas sem site.
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/60 border border-border/60 text-xs text-muted-foreground font-mono">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Workspace Isolado</span>
          </div>
        </div>

        <form onSubmit={onBuscar} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Categoria / Nicho */}
            <div className="space-y-2">
              <Label htmlFor="categoria" className="text-xs font-semibold text-foreground">
                Segmento / Nicho de Atuação *
              </Label>
              <div className="relative">
                <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
                <Input
                  id="categoria"
                  placeholder="Ex: Restaurante, Barbearia, Petshop, Imobiliária..."
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="pl-10 text-xs h-10 rounded-2xl bg-surface/70 border-border/80 font-medium focus-visible:ring-primary/40"
                  required
                />
              </div>

              {/* Tags de sugestão em Pílula */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SUGESTOES_CATEGORIAS.slice(0, 7).map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setCategoria(sug)}
                    className="px-3 py-1 rounded-full text-[11px] font-medium bg-secondary/80 hover:bg-foreground hover:text-background transition-all text-muted-foreground border border-border/60 cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Cidade / Região */}
            <div className="space-y-2">
              <Label htmlFor="regiao" className="text-xs font-semibold text-foreground">
                Cidade ou Região (Brasil) *
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
                <Input
                  id="regiao"
                  placeholder="Ex: São Paulo, SP ou Salvador, BA"
                  value={regiao}
                  onChange={(e) => setRegiao(e.target.value)}
                  className="pl-10 text-xs h-10 rounded-2xl bg-surface/70 border-border/80 font-medium focus-visible:ring-primary/40"
                  required
                />
              </div>

              {/* Capitais rápidas em Pílula */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {CAPITAIS_BRASIL_RAPIDAS.slice(0, 7).map((cap) => (
                  <button
                    key={cap.label}
                    type="button"
                    onClick={() => setRegiao(cap.label)}
                    className="px-3 py-1 rounded-full text-[11px] font-medium bg-secondary/80 hover:bg-foreground hover:text-background transition-all text-muted-foreground border border-border/60 cursor-pointer"
                  >
                    {cap.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Slider de Raio em Cápsula */}
          <div className="p-4 rounded-2xl bg-surface/40 border border-border/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Raio da Varredura no Mapa:</span>
              <span className="font-bold text-foreground px-2.5 py-0.5 rounded-full bg-secondary border border-border/80 font-mono">
                {raioKm[0]} km
              </span>
            </div>
            <Slider
              value={raioKm}
              onValueChange={setRaioKm}
              min={1}
              max={30}
              step={1}
              className="py-1"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground/70">
              <span>1 km (Bairro Local)</span>
              <span>15 km (Cidade Média)</span>
              <span>30 km (Metrópole / Grande Região)</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <Button
              type="submit"
              disabled={buscando}
              className="bg-foreground text-background hover:bg-foreground/90 font-semibold text-xs h-11 px-7 rounded-full shadow-lg gap-2 cursor-pointer transition-transform active:scale-95"
            >
              {buscando ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Minerando Estabelecimentos...
                </>
              ) : (
                <>
                  <Search className="size-4" />
                  Buscar Clientes no Maps
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
