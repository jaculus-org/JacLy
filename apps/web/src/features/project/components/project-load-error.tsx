import { m } from '@/paraglide/messages';
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  RefreshCcwIcon,
  ToolCaseIcon,
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import type { ProjectError } from '../active-project';

interface EditorLoadErrorProps {
  error: ProjectError;
}

export function ProjectLoadError({ error }: EditorLoadErrorProps) {
  function getErrorDetails(error: ProjectError): string {
    switch (error.reason) {
      case 'fs-mount-failed':
        return m.project_error_fs_mount_failed();
      case 'missing-package-json':
        return m.project_error_missing_package_json();
      case 'invalid-package-json':
        return m.project_error_invalid_package_json();
      case 'load-failed':
        return m.project_error_load_failed();
      case 'unknown-error':
        return m.project_error_unknown();
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-6 p-8">
      <div className="flex flex-col items-center gap-6 max-w-md">
        {/* Error icon */}
        <div className="flex items-center justify-center h-20 w-20 rounded-full bg-destructive/10">
          <AlertCircleIcon className="h-10 w-10 text-destructive" />
        </div>

        {/* Error message */}
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="text-lg font-semibold text-destructive">
            {error.seriousness === 'recoverable'
              ? m.project_error_recoverable()
              : m.project_error_unrecoverable()}
          </h2>
          <p className="text-sm text-muted-foreground">
            {getErrorDetails(error)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full">
          <Link
            to="/project"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            {m.project_loading_back()}
          </Link>

          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors text-sm"
          >
            <RefreshCcwIcon className="h-4 w-4 inline-block mr-1" />
            {m.project_error_reload()}
          </button>

          {error.fixCallback && (
            <button
              onClick={error.fixCallback}
              className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors text-sm"
            >
              <ToolCaseIcon className="h-4 w-4 inline-block mr-1" />
              {m.project_error_fix()}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
