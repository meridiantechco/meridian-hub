import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface CardGridSkeletonProps {
  quantidade?: number;
  colunasGrid?: string;
  mostrarFiltros?: boolean;
}

export function CardGridSkeleton({
  quantidade = 6,
  colunasGrid = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  mostrarFiltros = true,
}: CardGridSkeletonProps) {
  return (
    <div className="space-y-4 w-full animate-fade-in">
      {mostrarFiltros && (
        <Card className="bg-card border-border/80 shadow-elev">
          <CardContent className="p-3.5 flex flex-col sm:flex-row gap-3">
            <Skeleton className="h-8.5 flex-1 rounded-lg" />
            <Skeleton className="h-8.5 w-full sm:w-44 rounded-lg" />
          </CardContent>
        </Card>
      )}

      <div className={`grid ${colunasGrid} gap-4`}>
        {Array.from({ length: quantidade }).map((_, i) => (
          <Card key={i} className="bg-card border-border/80 p-4 space-y-3.5 shadow-elev">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 flex-1">
                <Skeleton className="size-9 rounded-xl shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-2.5 w-1/2 rounded" />
                </div>
              </div>
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>

            <div className="space-y-2 pt-1">
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-4/5 rounded" />
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-20 rounded" />
              <div className="flex gap-1.5">
                <Skeleton className="size-7 rounded-lg" />
                <Skeleton className="h-7 w-20 rounded-lg" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
