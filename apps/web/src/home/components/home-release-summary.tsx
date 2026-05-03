import { Link } from '@tanstack/react-router';
import { SquareArrowRightIcon } from 'lucide-react';
import { m } from '@/core/paraglide/messages';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui';
import { useHome } from '../home-context';

export function HomeReleaseSummary() {
  const { state, meta } = useHome();

  return (
    <Card className="border border-border bg-card shadow-[0_22px_48px_-34px_rgba(37,99,235,0.15)] ring-0 dark:shadow-[0_24px_54px_-38px_rgba(0,0,0,0.5)]">
      <CardHeader className="gap-2">
        <CardDescription className="text-muted-foreground">
          {m.index_whats_new_version({
            version: meta.buildInfo.version,
          })}
        </CardDescription>
        <CardTitle className="text-xl text-foreground">{m.index_whats_new_title()}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {state.releaseSummary ? (
          <ul className="space-y-3 text-sm text-foreground">
            {state.releaseSummary.items.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{m.index_whats_new_empty()}</p>
        )}

        <Link
          to="/version"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          {m.index_version_link()}
          <SquareArrowRightIcon className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
