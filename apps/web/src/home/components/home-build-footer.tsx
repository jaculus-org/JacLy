import { Link } from '@tanstack/react-router';
import { m } from '@/core/paraglide/messages';
import { useHome } from '../home-context';

export function HomeBuildFooter() {
  const { meta } = useHome();
  const buildDate = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  }).format(new Date(meta.buildInfo.buildTime));

  return (
    <footer className="border-t border-slate-200/80 pt-6 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
      <Link
        to="/version"
        className="inline-flex items-center gap-2 rounded-md px-1 py-1 transition-colors hover:text-slate-950 dark:hover:text-slate-50"
      >
        {m.index_build_version_meta({
          version: meta.buildInfo.version,
          date: buildDate,
        })}
      </Link>
    </footer>
  );
}
