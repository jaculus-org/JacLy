import { createFileRoute } from '@tanstack/react-router';
import { useBuildInfo } from '@/hooks/use-build-info';
import { LinkIcon } from 'lucide-react';

export const Route = createFileRoute('/about')({
  component: RouteComponent,
});

function RouteComponent() {
  const buildInfo = useBuildInfo();

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">About JacLy</h1>
        <p className="text-lg text-muted-foreground mb-8">
          JacLy is a web-based IDE for the Jaculus embedded systems platform.
        </p>

        <div className="bg-card rounded-lg border p-6 space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-2xl font-semibold mb-4">Build Information</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Version
              </label>
              <p className="text-lg font-mono">{buildInfo.version}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Build Time
              </label>
              <p className="text-lg">{formatDate(buildInfo.buildTime)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Commit Hash
              </label>
              <p className="text-lg font-mono">
                {buildInfo.commitHash.slice(0, 7)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Repository
              </label>
              <p className="text-lg font-mono">{buildInfo.repository}</p>
            </div>
          </div>

          {buildInfo.commitLink && (
            <div className="pt-4 border-t">
              <a
                href={buildInfo.commitLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                View Commit on GitHub
                <LinkIcon className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
