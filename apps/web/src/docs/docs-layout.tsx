import { Link, useMatchRoute } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { DOC_PAGES } from './docs-config';
import { DocsSidebar } from './docs-sidebar';

interface Props {
  children: ReactNode;
}

export function DocsLayout({ children }: Props) {
  const matchRoute = useMatchRoute();

  return (
    <div className="flex gap-10 py-10">
      <aside className="hidden w-52 shrink-0 lg:block">
        <div className="sticky top-20">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Contents
          </p>
          <DocsSidebar />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <nav className="mb-6 flex gap-1 overflow-x-auto rounded-lg border border-border bg-card/50 p-1 lg:hidden">
          {DOC_PAGES.map(({ slug, title }) => {
            const isIndex = slug === 'index';
            const isActive = isIndex
              ? !!matchRoute({ to: '/docs', fuzzy: false })
              : !!matchRoute({ to: '/docs/$page', params: { page: slug }, fuzzy: false });

            const cls = [
              'shrink-0 rounded-md px-4 py-1.5 text-sm font-medium no-underline transition-colors whitespace-nowrap',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            ].join(' ');

            return isIndex ? (
              <Link key={slug} to="/docs" className={cls}>
                {title}
              </Link>
            ) : (
              <Link key={slug} to="/docs/$page" params={{ page: slug }} className={cls}>
                {title}
              </Link>
            );
          })}
        </nav>

        {children}
      </div>
    </div>
  );
}
