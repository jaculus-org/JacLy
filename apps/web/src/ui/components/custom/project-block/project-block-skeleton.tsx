import { Card, CardContent, CardHeader } from '@/ui/components/card';
import { Skeleton } from '@/ui/components/skeleton';

export function ProjectBlockSkeleton() {
  return (
    <Card className="h-full border border-sky-200/80 bg-white/74 ring-0 dark:border-sky-950/55 dark:bg-[linear-gradient(180deg,rgba(17,29,58,0.88),rgba(14,23,46,0.82))]">
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
