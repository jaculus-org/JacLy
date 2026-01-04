import { Loader2Icon, ArrowLeftIcon } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export function EditorMountLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-8">
        {/* Multiple spinning loaders */}
        <div className="relative flex items-center justify-center h-48 w-48">
          {/* Outer ring - slowest */}
          <div className="absolute h-48 w-48 animate-spin rounded-full border-4 border-transparent border-t-primary/20 [animation-duration:3s]" />

          {/* Middle ring - medium speed */}
          <div className="absolute h-32 w-32 animate-spin rounded-full border-4 border-transparent border-t-primary/40 [animation-duration:2s] [animation-direction:reverse]" />

          {/* Inner ring - fastest */}
          <div className="absolute h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-primary/60 [animation-duration:1s]" />

          {/* Center icon */}
          <Loader2Icon className="h-6 w-6 animate-spin text-primary [animation-duration:0.75s]" />
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-medium text-foreground">Loading Project</p>
          <p className="text-xs text-muted-foreground animate-pulse">
            Mounting filesystem...
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0ms]" />
          <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:150ms]" />
          <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:300ms]" />
        </div>

        {/* Back to projects link */}
        <Link
          to="/editor"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Projects
        </Link>
      </div>
    </div>
  );
}
