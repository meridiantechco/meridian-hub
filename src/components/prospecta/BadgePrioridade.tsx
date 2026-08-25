import { obterClassificacaoScore } from "@/lib/score";
import { cn } from "@/lib/utils";

export function BadgePrioridade({
  score,
  mostrarScore = true,
  mostrarBarra = true,
  className,
}: {
  score: number;
  mostrarScore?: boolean;
  mostrarBarra?: boolean;
  className?: string;
}) {
  const { nivel, rotulo, classeBadge } = obterClassificacaoScore(score);

  const corBarra =
    nivel === "alta"
      ? "bg-[var(--color-alerta)]"
      : nivel === "media"
      ? "bg-amber-400"
      : "bg-[var(--color-novo)]";

  return (
    <div className={cn("inline-flex flex-col gap-1", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-tight dado",
          classeBadge
        )}
      >
        <span className="size-1.5 rounded-full bg-current opacity-90" />
        {mostrarScore ? (
          <span>
            {score} pts · {rotulo.replace("Prioridade ", "")}
          </span>
        ) : (
          <span>{rotulo}</span>
        )}
      </span>

      {/* Barra de Prioridade Visual */}
      {mostrarBarra && (
        <div className="h-1 w-full min-w-[50px] rounded-full bg-secondary/80 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-300", corBarra)}
            style={{ width: `${Math.max(8, score)}%` }}
          />
        </div>
      )}
    </div>
  );
}
