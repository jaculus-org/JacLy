import { Loader2, Blocks } from 'lucide-react';

export function JaclyLoading() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-background">
      <div className="relative">
        <Loader2 className=" h-16 w-16 animate-spin text-primary" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-lg font-medium text-foreground">Loading Editor</h3>
        <p className="text-sm text-muted-foreground">
          Preparing your workspace...
        </p>
        <Blocks className="h-16 w-16 text-muted-foreground/30" />
      </div>
    </div>
  );
}
