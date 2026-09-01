import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface TableSkeletonProps {
  colunas?: number;
  linhas?: number;
  mostrarFiltros?: boolean;
}

export function TableSkeleton({
  colunas = 6,
  linhas = 6,
  mostrarFiltros = true,
}: TableSkeletonProps) {
  return (
    <div className="space-y-4 w-full animate-fade-in">
      {mostrarFiltros && (
        <Card className="bg-card border-border/80 shadow-elev">
          <CardContent className="p-3.5 flex flex-col sm:flex-row gap-3">
            <Skeleton className="h-8.5 flex-1 rounded-lg" />
            <Skeleton className="h-8.5 w-full sm:w-48 rounded-lg" />
            <Skeleton className="h-8.5 w-full sm:w-40 rounded-lg" />
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border/80 shadow-elev overflow-hidden">
        <div className="border-b border-border/70 p-3.5 bg-surface/30 flex items-center justify-between">
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>

        <div className="divide-y divide-border/60">
          {Array.from({ length: linhas }).map((_, i) => (
            <div key={i} className="p-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="size-8 rounded-lg shrink-0" />
                <div className="space-y-1.5 flex-1 max-w-sm">
                  <Skeleton className="h-3.5 w-3/4 rounded" />
                  <Skeleton className="h-2.5 w-1/2 rounded" />
                </div>
              </div>

              {Array.from({ length: colunas - 2 }).map((_, cIdx) => (
                <Skeleton key={cIdx} className="h-3 w-20 hidden md:block rounded" />
              ))}

              <Skeleton className="h-7 w-16 rounded-md shrink-0" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
