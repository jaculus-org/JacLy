import { m } from '@/paraglide/messages';
import { ConnectionSelector } from '@/features/jac-device';
import { LocaleSelector } from '@/features/locale';
import { ThemeToggle } from '@/features/theme/components/theme-toggle';
import { Link } from '@tanstack/react-router';
import { HouseIcon } from 'lucide-react';
import { ConnectedDevice } from '@/features/jac-device';
import { Badge } from '@/features/shared/components/ui/badge';
import { useActiveProject } from '../active-project';

export function ProjectEditorHeader() {
  const {
    state: { dbProject },
  } = useActiveProject();
  return (
    <header className="relative backdrop-blur-sm bg-white border-b border-blue-100 dark:bg-slate-800 dark:border-slate-700">
      <div className="max-w-full">
        <div className="flex justify-between items-center py-3 px-1 pl-3">
          {/* Navigation */}
          <nav className="flex gap-6 items-center">
            <Link
              to={'/project'}
              className="font-medium text-blue-900 no-underline transition-colors duration-300 ease-in-out hover:text-blue-500 dark:text-slate-100 dark:hover:text-blue-500"
            >
              <HouseIcon className="inline-block mr-1 mb-1 h-4 w-4" />
              {m.project_header_my()}
            </Link>

            {dbProject?.name && (
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 pl-4 border-l border-blue-200 dark:border-slate-600">
                {dbProject.name}
              </span>
            )}

            {import.meta.env.DEV && (
              <Badge variant="destructive">Dev server</Badge>
            )}
          </nav>

          {/* Theme switcher */}
          <div className="flex items-center gap-2">
            <ConnectedDevice />
            <ConnectionSelector />
            <ThemeToggle />
            <LocaleSelector />
          </div>
        </div>
      </div>
    </header>
  );
}
