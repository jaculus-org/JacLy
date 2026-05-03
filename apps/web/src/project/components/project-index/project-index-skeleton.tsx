import { Card, CardContent } from '@/ui/components/card';
import { ProjectBlockSkeleton } from '@/ui/components/custom/project-block';
import { Skeleton } from '@/ui/components/skeleton';

export function ProjectIndexSkeleton() {
  return (
    <div className="space-y-8 py-8">
      <Card className="overflow-hidden rounded-[2rem] border border-border bg-card ring-0">
        <CardContent className="space-y-6 px-6 py-8 sm:px-8 sm:py-10">
          <Skeleton className="h-14 w-48" />
          <Skeleton className="h-6 w-full max-w-2xl" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-36" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-5 w-72" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ProjectBlockSkeleton />
          <ProjectBlockSkeleton />
          <ProjectBlockSkeleton />
          <ProjectBlockSkeleton />
          <ProjectBlockSkeleton />
          <ProjectBlockSkeleton />
        </div>
      </div>
    </div>
  );
}
