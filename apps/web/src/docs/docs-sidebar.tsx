import { Link, useMatchRoute } from '@tanstack/react-router';
import { DOC_PAGES } from './docs-config';

export function DocsSidebar() {
  const matchRoute = useMatchRoute();

  return (
    <nav className="space-y-1">
      {DOC_PAGES.map(({ slug, title }) => {
        const isIndex = slug === 'index';
        const isActive = isIndex
          ? !!matchRoute({ to: '/docs', fuzzy: false })
          : !!matchRoute({ to: '/docs/$page', params: { page: slug }, fuzzy: false });

        return isIndex ? (
          <Link
            key={slug}
            to="/docs"
            className={[
              'block rounded-md px-3 py-2 text-sm font-medium no-underline transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            ].join(' ')}
          >
            {title}
          </Link>
        ) : (
          <Link
            key={slug}
            to="/docs/$page"
            params={{ page: slug }}
            className={[
              'block rounded-md px-3 py-2 text-sm font-medium no-underline transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            ].join(' ')}
          >
            {title}
          </Link>
        );
      })}
    </nav>
  );
}
