import { Link } from '@tanstack/react-router';
import { ModeToggle } from '@/components/theme/mode-toggle';
import { useHeaderActions } from '@/providers/header-provider';

export function Header() {
  const { actions } = useHeaderActions();

  const links = [
    { name: 'Home' as string, path: '/' },
    { name: 'Editor' as string, path: '/editor/' },
  ];

  return (
    <header className="relative backdrop-blur-sm bg-white border-b border-blue-100 dark:bg-slate-800 dark:border-slate-700">
      <div className="max-w-full mx-auto px-4">
        <div className="flex justify-between items-center py-3 px-4">
          {/* Navigation */}
          <nav className="flex gap-6">
            {links.map(({ name, path }) => (
              <Link
                key={path}
                to={path}
                className="font-medium text-blue-900 no-underline transition-colors duration-300 ease-in-out hover:text-blue-500 dark:text-slate-100 dark:hover:text-blue-500"
              >
                {name}
              </Link>
            ))}
          </nav>

          {/* Dynamic actions injected from current page */}
          {actions && <div className="flex items-center gap-4">{actions}</div>}

          {/* Theme switcher */}
          <div className="flex items-center gap-4">
            <ModeToggle />
            {/* <LocaleSwitcher /> */}
          </div>
        </div>
      </div>
    </header>
  );
}
