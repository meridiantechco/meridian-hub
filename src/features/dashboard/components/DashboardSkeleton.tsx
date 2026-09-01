import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8.5 w-28" />
          <Skeleton className="h-8.5 w-24" />
          <Skeleton className="h-8.5 w-36" />
        </div>
      </div>

      {/* 4 KPIs Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-card border-border/70 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-40" />
          </Card>
        ))}
      </div>

      {/* Attention Panel Skeleton */}
      <Card className="bg-card border-border/70 p-4 space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </div>
      </Card>

      {/* Bento Grid Skeleton: Chart & Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card border-border/70 p-4 space-y-3">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </Card>
        <Card className="bg-card border-border/70 p-4 space-y-3">
          <Skeleton className="h-5 w-40" />
          <div className="space-y-3 pt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        </Card>
      </div>

      {/* Financial Pulse Skeleton */}
      <Skeleton className="h-20 w-full rounded-2xl" />

      {/* Recent Table Skeleton */}
      <Card className="bg-card border-border/70 p-4 space-y-3">
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </Card>
    </div>
  );
}
