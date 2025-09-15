import { Link } from '@tanstack/react-router';
import { ModeToggle } from '../mode-toggle';
// import { ThemeSwitcher } from '../ThemeSwitcher';

export interface Links {
  [key: string]: string;
}

interface HeaderProps {
  links: Links;
}

export function Header({ links }: HeaderProps) {
  return (
    <header className="relative backdrop-blur-sm bg-white border-b border-blue-100 dark:bg-slate-800 dark:border-slate-700">
      <div className="max-w-full mx-auto px-4">
        <div className="flex justify-between items-center py-3 px-4">
          {/* Navigation */}
          <nav className="flex gap-6">
            {Object.entries(links).map(([name, path]) => (
              <Link
                key={name}
                to={path}
                className="font-medium text-blue-900 no-underline transition-colors duration-300 ease-in-out hover:text-blue-500 dark:text-slate-100 dark:hover:text-blue-500"
              >
                {name}
              </Link>
            ))}
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
