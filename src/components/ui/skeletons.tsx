import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Recipe Card Skeleton
 */
export function RecipeCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-secondary/50 animate-pulse" />
      <CardContent className="p-4 space-y-3">
        <div className="h-4 bg-secondary/50 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-secondary/50 rounded animate-pulse w-full" />
        <div className="h-3 bg-secondary/50 rounded animate-pulse w-2/3" />
        <div className="flex gap-2 mt-3">
          <div className="h-6 w-16 bg-secondary/50 rounded animate-pulse" />
          <div className="h-6 w-16 bg-secondary/50 rounded animate-pulse" />
          <div className="h-6 w-16 bg-secondary/50 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Recipe Grid Skeleton
 */
export function RecipeGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Dashboard Card Skeleton
 */
export function DashboardCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-secondary/50 rounded animate-pulse" />
          <div className="h-8 w-8 bg-secondary/50 rounded-full animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-12 bg-secondary/50 rounded animate-pulse" />
        <div className="h-24 bg-secondary/50 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-8 flex-1 bg-secondary/50 rounded animate-pulse" />
          <div className="h-8 flex-1 bg-secondary/50 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * List Item Skeleton
 */
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/20">
      <div className="w-12 h-12 bg-secondary/50 rounded-full animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-secondary/50 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-secondary/50 rounded animate-pulse w-1/2" />
      </div>
      <div className="h-8 w-20 bg-secondary/50 rounded animate-pulse" />
    </div>
  );
}

/**
 * Stats Card Skeleton
 */
export function StatsCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="h-4 w-24 bg-secondary/50 rounded animate-pulse" />
          <div className="h-4 w-4 bg-secondary/50 rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-secondary/50 rounded animate-pulse mb-2" />
        <div className="h-3 w-20 bg-secondary/50 rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

/**
 * Form Skeleton
 */
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-4 w-24 bg-secondary/50 rounded animate-pulse" />
        <div className="h-10 bg-secondary/50 rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-32 bg-secondary/50 rounded animate-pulse" />
        <div className="h-24 bg-secondary/50 rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-28 bg-secondary/50 rounded animate-pulse" />
        <div className="h-10 bg-secondary/50 rounded animate-pulse" />
      </div>
      <div className="h-10 bg-secondary/50 rounded animate-pulse" />
    </div>
  );
}

/**
 * Table Skeleton
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border rounded-lg">
          <div className="h-4 flex-1 bg-secondary/50 rounded animate-pulse" />
          <div className="h-4 w-24 bg-secondary/50 rounded animate-pulse" />
          <div className="h-4 w-20 bg-secondary/50 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

/**
 * Page Header Skeleton
 */
export function PageHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-secondary/50 rounded animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-48 bg-secondary/50 rounded animate-pulse" />
          <div className="h-4 w-64 bg-secondary/50 rounded animate-pulse" />
        </div>
      </div>
      <div className="h-10 w-32 bg-secondary/50 rounded animate-pulse" />
    </div>
  );
}

/**
 * Profile Skeleton
 */
export function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <div className="w-20 h-20 bg-secondary/50 rounded-full animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-6 w-40 bg-secondary/50 rounded animate-pulse" />
        <div className="h-4 w-56 bg-secondary/50 rounded animate-pulse" />
        <div className="h-4 w-32 bg-secondary/50 rounded animate-pulse" />
      </div>
    </div>
  );
}
