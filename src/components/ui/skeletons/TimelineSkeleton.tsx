import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface TimelineSkeletonProps {
  itens?: number;
}

export function TimelineSkeleton({ itens = 5 }: TimelineSkeletonProps) {
  return (
    <div className="space-y-4 max-w-4xl w-full animate-fade-in">
      <Card className="bg-card border-border/80 shadow-elev">
        <CardContent className="p-3.5 flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-8.5 flex-1 rounded-lg" />
          <Skeleton className="h-8.5 w-full sm:w-44 rounded-lg" />
        </CardContent>
      </Card>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border/60">
        {Array.from({ length: itens }).map((_, i) => (
          <div key={i} className="relative flex items-start gap-4">
            <Skeleton className="absolute -left-6 size-5 rounded-full border-2 border-background" />

            <Card className="bg-card border-border/80 p-4 w-full shadow-elev space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-20 rounded" />
              </div>

              <Skeleton className="h-3.5 w-full rounded" />
              <Skeleton className="h-3.5 w-3/4 rounded" />

              <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                <Skeleton className="h-3 w-28 rounded" />
                <Skeleton className="size-6 rounded-md" />
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
