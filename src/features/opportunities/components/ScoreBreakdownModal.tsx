import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flame, CheckCircle2, AlertCircle, Info, Sparkles } from "lucide-react";
import type { OportunidadeEnriquecida } from "../types";

interface ScoreBreakdownModalProps {
  oportunidade: OportunidadeEnriquecida | null;
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  onAbordarWhatsApp: () => void;
}

export function ScoreBreakdownModal({
  oportunidade,
  aberto,
  onOpenChange,
  onAbordarWhatsApp,
}: ScoreBreakdownModalProps) {
  if (!oportunidade) return null;

  const { lead, score, fatoresScore, proximaAcao } = oportunidade;

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center font-display text-lg font-bold">
              {score}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Composição do Score — {lead.nome}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {lead.categoria} · {lead.bairro || lead.cidade || "Brasil"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* PRÓXIMA MELHOR AÇÃO */}
          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/25 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" />
                Próxima Ação Recomendada
              </span>
              <span className="text-[10px] uppercase font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/20">
                Urgência: {proximaAcao.urgencia}
              </span>
            </div>
            <p className="text-xs font-semibold text-foreground">{proximaAcao.titulo}</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{proximaAcao.motivo}</p>
          </div>

          {/* LISTA DE FATORES DE SCORE */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider rotulo">
              Por que este estabelecimento recebeu Score {score}?
            </h4>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {fatoresScore.map((fator, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-surface/50 border border-border/70 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      {fator.tipo === "positivo" ? (
                        <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Info className="size-3.5 text-primary shrink-0" />
                      )}
                      <span>{fator.rotulo}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {fator.descricao}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 shrink-0 text-xs">
                    +{fator.pontos} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8"
          >
            Fechar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              onAbordarWhatsApp();
            }}
            className="text-xs h-8 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold gap-1.5"
          >
            Executar Próxima Ação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
