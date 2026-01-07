import { createFileRoute, Link } from '@tanstack/react-router';
import { HomeIcon, ArrowLeftIcon } from 'lucide-react';

export const Route = createFileRoute('/not-found')({
  component: NotFoundPage,
});

export function NotFoundPage() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-8 max-w-md p-8 text-center">
        {/* 404 Number */}
        <div className="relative">
          <h1 className="text-9xl font-bold text-primary/20 select-none">
            404
          </h1>
        </div>

        {/* Message */}
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold text-foreground">
            Page Not Found
          </h2>
          <p className="text-sm text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <HomeIcon className="h-4 w-4" />
            Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 border border-border rounded-md hover:bg-accent transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
