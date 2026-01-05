import { ModeToggle } from '@/features/theme/components/mode-toggle';
import { Link } from '@tanstack/react-router';
import { HouseIcon } from 'lucide-react';

export function EditorHeader() {
  return (
    <header className="relative backdrop-blur-sm bg-white border-b border-blue-100 dark:bg-slate-800 dark:border-slate-700">
      <div className="max-w-full mx-auto px-4">
        <div className="flex justify-between items-center py-3 px-4">
          {/* Navigation */}
          <nav className="flex gap-6">
            <Link
              to={'/project'}
              className="font-medium text-blue-900 no-underline transition-colors duration-300 ease-in-out hover:text-blue-500 dark:text-slate-100 dark:hover:text-blue-500"
            >
              <HouseIcon className="inline-block mr-1 mb-1 h-4 w-4" />
              All Projects
            </Link>
          </nav>

          {/* Theme switcher */}
          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
