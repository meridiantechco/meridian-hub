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
    <Card className="bg-card border-border shadow-elev">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Search className="size-4 text-primary" />
          Parâmetros da Varredura Geográfica
        </CardTitle>
        <CardDescription className="text-xs">
          Defina o segmento de mercado, cidade e raio de busca para minerar oportunidades locais
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onBuscar} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Categoria / Nicho */}
            <div className="space-y-2">
              <Label htmlFor="categoria" className="text-xs font-semibold text-foreground">
                Nicho / Ramo de Atividade *
              </Label>
              <div className="relative">
                <Input
                  id="categoria"
                  placeholder="Ex: Restaurante, Barbearia, Petshop, Dentista..."
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="text-xs h-9.5 bg-surface/50 font-medium"
                  required
                />
              </div>

              {/* Tags de sugestão de nicho */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SUGESTOES_CATEGORIAS.slice(0, 8).map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setCategoria(sug)}
                    className="px-2 py-0.5 rounded-full text-[10px] bg-secondary/80 hover:bg-primary/20 hover:text-primary transition-all text-muted-foreground border border-border/60"
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
                <MapPin className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="regiao"
                  placeholder="Ex: São Paulo, SP ou Salvador, BA"
                  value={regiao}
                  onChange={(e) => setRegiao(e.target.value)}
                  className="pl-9 text-xs h-9.5 bg-surface/50 font-medium"
                  required
                />
              </div>

              {/* Capitais rápidas */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {CAPITAIS_BRASIL_RAPIDAS.slice(0, 8).map((cap) => (
                  <button
                    key={cap.label}
                    type="button"
                    onClick={() => setRegiao(cap.label)}
                    className="px-2 py-0.5 rounded-full text-[10px] bg-secondary/80 hover:bg-primary/20 hover:text-primary transition-all text-muted-foreground border border-border/60"
                  >
                    {cap.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Slider de Raio */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Raio da Varredura:</span>
              <span className="font-bold text-primary font-mono">{raioKm[0]} km</span>
            </div>
            <Slider
              value={raioKm}
              onValueChange={setRaioKm}
              min={1}
              max={30}
              step={1}
              className="py-1"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground/60">
              <span>1 km (Bairro)</span>
              <span>15 km (Cidade)</span>
              <span>30 km (Metrópole)</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={buscando}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-9.5 px-6 gap-2 shadow-sm"
            >
              {buscando ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Varrendo Região...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Iniciar Varredura Inteligente
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
