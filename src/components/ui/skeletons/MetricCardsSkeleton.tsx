import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface MetricCardsSkeletonProps {
  quantidade?: number;
  colunas?: string;
}

export function MetricCardsSkeleton({
  quantidade = 4,
  colunas = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
}: MetricCardsSkeletonProps) {
  return (
    <div className={`grid ${colunas} gap-4 w-full animate-fade-in`}>
      {Array.from({ length: quantidade }).map((_, i) => (
        <Card key={i} className="bg-card border-border/80 shadow-elev p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-28 rounded" />
            <Skeleton className="size-8 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-36 rounded" />
            <Skeleton className="h-2.5 w-24 rounded" />
          </div>
        </Card>
      ))}
    </div>
  );
}
