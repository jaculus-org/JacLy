import { m } from '@/paraglide/messages';
import { Build } from '@/features/jac-device/components/build';
import { BuildFlash } from '@/features/jac-device/components/build-flash';
import { ConnectionSelector } from '@/features/jac-device/components/connection-selector';
import { ConsoleSelector } from '@/features/jac-device/components/console-selector';
import { LocaleSelector } from '@/features/locale/components/locale-selector';
import { ThemeToggle } from '@/features/theme/components/theme-toggle';
import { Link } from '@tanstack/react-router';
import { HouseIcon } from 'lucide-react';

export function ProjectEditorHeader() {
  return (
    <header className="relative backdrop-blur-sm bg-white border-b border-blue-100 dark:bg-slate-800 dark:border-slate-700">
      <div className="max-w-full">
        <div className="flex justify-between items-center py-3 px-1 pl-3">
          {/* Navigation */}
          <nav className="flex gap-6">
            <Link
              to={'/project'}
              className="font-medium text-blue-900 no-underline transition-colors duration-300 ease-in-out hover:text-blue-500 dark:text-slate-100 dark:hover:text-blue-500"
            >
              <HouseIcon className="inline-block mr-1 mb-1 h-4 w-4" />
              {m.project_header_all()}
            </Link>
          </nav>

          {/* Theme switcher */}
          <div className="flex items-center gap-4">
            <Build />
            <BuildFlash />
            <ConsoleSelector />
            <ConnectionSelector />
            <ThemeToggle />
            <LocaleSelector />
          </div>
        </div>
      </div>
    </header>
  );
}
