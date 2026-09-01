import { Skeleton } from "@/components/ui/skeleton";

interface KanbanSkeletonProps {
  colunas?: number;
  cardsPorColuna?: number;
}

export function KanbanSkeleton({ colunas = 5, cardsPorColuna = 3 }: KanbanSkeletonProps) {
  return (
    <div className="overflow-x-auto pb-4 w-full animate-fade-in">
      <div className="flex gap-3.5 sm:gap-4 min-w-max lg:min-w-full items-start">
        {Array.from({ length: colunas }).map((_, cIdx) => (
          <div
            key={cIdx}
            className="flex flex-col w-72 sm:w-80 shrink-0 bg-secondary/30 rounded-2xl p-3 border border-border/70 space-y-3"
          >
            {/* Header Coluna */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Skeleton className="size-2.5 rounded-full" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
              <Skeleton className="h-4.5 w-7 rounded-full" />
            </div>

            {/* Cards da Coluna */}
            <div className="space-y-2.5 min-h-[420px]">
              {Array.from({ length: cardsPorColuna }).map((_, rIdx) => (
                <div
                  key={rIdx}
                  className="bg-card border border-border/80 rounded-xl p-3.5 space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3.5 w-4/5 rounded" />
                      <Skeleton className="h-2.5 w-1/2 rounded" />
                    </div>
                    <Skeleton className="size-6 rounded-md shrink-0" />
                  </div>

                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-16 rounded" />
                    <Skeleton className="h-4 w-20 rounded" />
                  </div>

                  <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                    <Skeleton className="h-3 w-24 rounded" />
                    <Skeleton className="size-5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
