import { Card, Skeleton } from '@/ui';

export function HomeSkeleton() {
  return (
    <div className="space-y-8 py-8">
      <Card className="overflow-hidden rounded-[2rem] border-0 bg-card ring-1 ring-border">
        <div className="space-y-6 px-6 py-8 sm:px-8 sm:py-10">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-14 w-full max-w-3xl" />
          <Skeleton className="h-6 w-full max-w-2xl" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.7fr)]">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 bg-card ring-1 ring-border">
            <div className="space-y-4 px-4 py-4">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </Card>
          <Card className="border-0 bg-card ring-1 ring-border">
            <div className="space-y-4 px-4 py-4">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </Card>
        </div>

        <Card className="border-0 bg-card ring-1 ring-border">
          <div className="space-y-4 px-4 py-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-0 bg-card ring-1 ring-border">
          <div className="space-y-4 px-4 py-4">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </Card>
        <Card className="border-0 bg-card ring-1 ring-border">
          <div className="space-y-4 px-4 py-4">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </Card>
      </div>
    </div>
  );
}
