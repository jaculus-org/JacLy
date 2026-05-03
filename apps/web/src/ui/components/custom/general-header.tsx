import { Link } from '@tanstack/react-router';
import { PwaInstall } from '@/core';
import { LocaleSelector } from '@/core/components/locale';
import { ThemeToggle } from '@/core/components/theme';
import { m } from '@/core/paraglide/messages';

export function GeneralHeader() {
  const links = [{ name: m.nav_projects(), path: '/project/' }];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="mx-auto max-w-full px-4">
        <div className="flex items-center justify-between gap-3 px-2 py-3 sm:px-4">
          <nav className="flex min-w-0 items-center gap-4 sm:gap-6">
            <Link
              to={'/'}
              className="group inline-flex shrink-0 items-center font-medium text-foreground no-underline transition-colors duration-300 ease-in-out hover:text-primary"
            >
              <img
                src="/favicon/favicon.svg"
                alt="JacLy"
                className="mr-2 h-5 w-5 p-0 transition-transform duration-300 ease-in-out group-hover:scale-110 group-hover:brightness-110"
              />
              JacLy
            </Link>

            {links.map(({ name, path }) => (
              <Link
                key={path}
                to={path}
                className="truncate font-medium text-foreground no-underline transition-colors duration-300 ease-in-out hover:text-primary"
              >
                {name}
              </Link>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <PwaInstall.Button />
            <ThemeToggle />
            <LocaleSelector />
          </div>
        </div>
      </div>
    </header>
  );
}
