import { ModeToggle } from '@/features/theme/components/mode-toggle';
import { Link } from '@tanstack/react-router';

export function GeneralHeader() {
  const links = [
    { name: 'Home' as string, path: '/' },
    { name: 'Projects' as string, path: '/project/' },
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
