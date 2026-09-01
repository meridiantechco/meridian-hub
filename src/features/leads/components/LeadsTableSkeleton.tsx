import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function LeadsTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* 5 KPI Summary Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-3.5 rounded-xl bg-card border border-border/70 flex justify-between items-center">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-12" />
            </div>
            <Skeleton className="size-8 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Filter Bar Skeleton */}
      <Card className="bg-card border-border/70 p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-7 w-56" />
        </div>
      </Card>

      {/* Table Rows Skeleton */}
      <Card className="bg-card border-border/70 p-0 overflow-hidden">
        <div className="p-3 border-b border-border/60 bg-surface/50">
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-border/40">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-7 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
