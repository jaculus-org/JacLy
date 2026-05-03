import { createFileRoute } from '@tanstack/react-router';
import { ExternalLink, GitCommit, Github, Package, Tag, Timer } from 'lucide-react';
import { useBuildInfo } from '@/core/hooks/use-build-info';
import { m } from '@/core/paraglide/messages';
import { fetchReleaseSummary } from '@/core/services/release-summary';
import { Badge } from '@/ui/components/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/card';

export const Route = createFileRoute('/about')({
  loader: async () => {
    try {
      const entries = await fetchReleaseSummary();
      return { entries };
    } catch {
      return { entries: [] };
    }
  },
  component: AboutPage,
});

function InfoRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className={`mt-0.5 break-all text-sm font-medium ${mono ? 'font-mono' : ''}`}>{value}</p>
      </div>
    </div>
  );
}

function AboutPage() {
  const { entries } = Route.useLoaderData();
  const buildInfo = useBuildInfo();

  const buildDate = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(buildInfo.buildTime));

  const repoLink = buildInfo.commitLink ? buildInfo.commitLink.split('/commit/')[0] : null;

  return (
    <div className="space-y-8 py-10">
      <div>
        <div className="mb-2 flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{m.about_title()}</h1>
          <Badge variant="secondary" className="font-mono text-sm">
            v{buildInfo.version}
          </Badge>
        </div>
        <p className="text-muted-foreground">{m.about_description()}</p>
        {repoLink && (
          <a
            href={repoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Github className="size-4" />
            {buildInfo.repository}
            <ExternalLink className="size-3" />
          </a>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        {/* Changelog */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{m.index_whats_new_title()}</h2>

          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">{m.index_whats_new_empty()}</p>
          ) : (
            entries.map((entry) => (
              <Card key={entry.version}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-semibold">
                      {m.index_whats_new_version({ version: entry.version })}
                    </CardTitle>
                    {entry.version === buildInfo.version && (
                      <Badge className="text-xs">{m.about_version()}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {entry.items.map((item) => (
                      <li key={item} className="flex gap-3 text-sm">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Build Info */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">{m.about_build_info()}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow icon={Tag} label={m.about_version()} value={buildInfo.version} mono />
            <InfoRow icon={Timer} label={m.about_build_time()} value={buildDate} />
            <InfoRow
              icon={GitCommit}
              label={m.about_commit_hash()}
              value={buildInfo.commitHash.slice(0, 7)}
              mono
            />
            <InfoRow
              icon={Package}
              label={m.about_repository()}
              value={buildInfo.repository}
              mono
            />

            {buildInfo.commitLink && (
              <div className="border-t pt-2">
                <a
                  href={buildInfo.commitLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {m.about_view_commit()}
                  <ExternalLink className="size-4" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
