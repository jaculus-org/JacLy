import { Link } from '@tanstack/react-router';
import { PwaInstall } from '@/core';
import { LocaleSelector } from '@/core/components/locale';
import { ThemeToggle } from '@/core/components/theme';
import { m } from '@/core/paraglide/messages';

export function GeneralHeader() {
  const links = [{ name: m.nav_projects(), path: '/project/' }];

  return (
    <header className="relative backdrop-blur-sm bg-white border-b border-blue-100 dark:bg-slate-800 dark:border-slate-700">
      <div className="max-w-full mx-auto px-4">
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap gap-4 sm:gap-6">
            <Link
              to={'/'}
              className="group font-medium text-blue-900 no-underline transition-colors duration-300 ease-in-out hover:text-blue-500 dark:text-slate-100 dark:hover:text-blue-500"
            >
              <img
                src="/favicon/favicon.svg"
                alt="JacLy"
                className="inline-block mr-2 mb-1 h-5 w-5 p-0 m-0 transition-transform duration-300 ease-in-out group-hover:scale-110 group-hover:brightness-110"
              />
              JacLy
            </Link>

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
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <PwaInstall.Button />
            <ThemeToggle />
            <LocaleSelector />
          </div>
        </div>
      </div>
    </header>
  );
}
