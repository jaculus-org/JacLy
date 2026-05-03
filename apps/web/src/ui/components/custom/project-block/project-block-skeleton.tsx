import { Card, CardContent, CardHeader } from '@/ui/components/card';
import { Skeleton } from '@/ui/components/skeleton';

export function ProjectBlockSkeleton() {
  return (
    <Card className="h-full border border-border bg-card ring-0">
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-4">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="size-8 rounded-lg" />
        </div>
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Skeleton className="h-5 w-24" />
      </CardContent>
    </Card>
  );
}
