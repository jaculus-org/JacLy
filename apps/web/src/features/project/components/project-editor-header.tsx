import { ConnectionSelector } from '@/features/jac-device';
import { LocaleSelector } from '@/features/locale';
import { ThemeToggle } from '@/features/theme/components/theme-toggle';
import { Link } from '@tanstack/react-router';
import { HouseIcon } from 'lucide-react';
import { ConnectedDevice } from '@/features/jac-device';
import { Badge } from '@/features/shared/components/ui/badge';
import { useActiveProject } from '../active-project';
import { ProjectNameEditor } from './project-name-editor';

export function ProjectEditorHeader() {
  const {
    state: { dbProject },
  } = useActiveProject();
  return (
    <header className="relative backdrop-blur-sm bg-white border-b border-blue-100 dark:bg-slate-800 dark:border-slate-700">
      <div className="max-w-full">
        <div className="flex justify-between items-center py-1 px-1 pl-3">
          {/* Navigation */}
          <nav className="flex gap-4 items-center">
            <Link
              to={'/project'}
              className="group font-medium text-blue-900 no-underline transition-colors duration-300 ease-in-out hover:text-blue-500 dark:text-slate-100 dark:hover:text-blue-500"
            >
              <img
                src="/logo/jacly.png"
                alt="JacLy"
                className="inline-block mr-2 mb-1 h-5 w-5 p-0 m-0 transition-transform duration-300 ease-in-out group-hover:scale-110 group-hover:brightness-110"
              />
              JacLy
              <HouseIcon className="inline-block mr-1 mb-1 h-4 w-4 ml-2 transition-transform duration-300 ease-in-out group-hover:scale-110" />
            </Link>

            {dbProject?.name && <ProjectNameEditor />}

            {import.meta.env.DEV && (
              <Badge variant="destructive">Dev server</Badge>
            )}
          </nav>

          {/* Controls */}
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
