import { Link } from '@tanstack/react-router';
import { SquareArrowRightIcon } from 'lucide-react';
import { m } from '@/core/paraglide/messages';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui';
import { useHome } from '../home-context';

export function HomeReleaseSummary() {
  const { state, meta } = useHome();

  return (
    <Card className="border border-sky-200/85 bg-[linear-gradient(180deg,rgba(236,246,255,0.94),rgba(224,238,255,0.92))] text-slate-950 shadow-[0_22px_48px_-34px_rgba(37,99,235,0.28)] ring-0 dark:border-sky-950/55 dark:bg-[linear-gradient(180deg,rgba(18,31,60,0.96),rgba(14,24,48,0.94))] dark:text-white dark:shadow-[0_24px_54px_-38px_rgba(2,6,23,0.82)]">
      <CardHeader className="gap-2">
        <CardDescription className="text-slate-600 dark:text-slate-300">
          {m.index_whats_new_version({
            version: meta.buildInfo.version,
          })}
        </CardDescription>
        <CardTitle className="text-xl text-slate-950 dark:text-white">
          {m.index_whats_new_title()}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {state.releaseSummary ? (
          <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
            {state.releaseSummary.items.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-sky-500 dark:bg-sky-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-300">{m.index_whats_new_empty()}</p>
        )}

        <Link
          to="/version"
          className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 transition-colors hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200"
        >
          {m.index_version_link()}
          <SquareArrowRightIcon className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
