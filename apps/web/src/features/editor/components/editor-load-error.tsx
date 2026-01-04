import { AlertCircleIcon, ArrowLeftIcon } from 'lucide-react';
import { Link } from '@tanstack/react-router';

interface EditorLoadErrorProps {
  error: Error;
}

export function EditorLoadError({ error }: EditorLoadErrorProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 max-w-md p-8">
        {/* Error icon */}
        <div className="flex items-center justify-center h-20 w-20 rounded-full bg-destructive/10">
          <AlertCircleIcon className="h-10 w-10 text-destructive" />
        </div>

        {/* Error message */}
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="text-lg font-semibold text-destructive">
            Failed to Load Project Filesystem
          </h2>
          <p className="text-sm text-muted-foreground">
            {error.message ||
              'An unknown error occurred while mounting the filesystem'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full">
          <Link
            to="/editor"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Projects
          </Link>

          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors text-sm"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}
