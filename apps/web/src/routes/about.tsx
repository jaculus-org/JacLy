import { createFileRoute } from '@tanstack/react-router';
import { useBuildInfo } from '@/hooks/useBuildInfo';

export const Route = createFileRoute('/about')({
  component: RouteComponent,
});

function RouteComponent() {
  const buildInfo = useBuildInfo();

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          About JacLy
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
          JacLy is a web-based IDE for the Jaculus embedded systems platform.
        </p>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 space-y-4">
          <div className="border-b dark:border-slate-700 pb-4">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
              Build Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Version
              </label>
              <p className="text-lg text-slate-900 dark:text-slate-100 font-mono">
                {buildInfo.version}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Build Time
              </label>
              <p className="text-lg text-slate-900 dark:text-slate-100">
                {formatDate(buildInfo.buildTime)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Commit Hash
              </label>
              <p className="text-lg text-slate-900 dark:text-slate-100 font-mono">
                {buildInfo.commitHash.slice(0, 7)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Repository
              </label>
              <p className="text-lg text-slate-900 dark:text-slate-100 font-mono">
                {buildInfo.repository}
              </p>
            </div>
          </div>

          {buildInfo.commitLink && (
            <div className="pt-4 border-t dark:border-slate-700">
              <a
                href={buildInfo.commitLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-md transition-colors"
              >
                View Commit on GitHub
                <svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
