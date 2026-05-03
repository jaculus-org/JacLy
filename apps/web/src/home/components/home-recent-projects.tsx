import { Link } from '@tanstack/react-router';
import { Blocks, Clock3, Code, FolderOpen } from 'lucide-react';
import { m } from '@/core/paraglide/messages';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui';
import { useHome } from '../home-context';

const projectTypeIcons = {
  jacly: Blocks,
  code: Code,
};

export function HomeRecentProjects() {
  const { state } = useHome();

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
            {m.index_recent_title()}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{m.index_recent_desc()}</p>
        </div>

        <Button asChild variant="ghost" className="hidden sm:inline-flex">
          <Link to="/project">
            {m.index_recent_browse_all()}
            <FolderOpen className="size-4" />
          </Link>
        </Button>
      </div>

      {state.recentProjects.length === 0 ? (
        <Card className="border border-dashed border-sky-200/85 bg-sky-50/65 dark:border-sky-950/55 dark:bg-sky-950/24">
          <CardContent className="py-8 text-sm text-slate-600 dark:text-slate-300">
            {m.index_recent_empty()}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {state.recentProjects.map((project) => {
            const Icon = projectTypeIcons[project.type];

            return (
              <Link
                key={project.id}
                to="/project/$projectId"
                params={{ projectId: project.id }}
                className="block"
              >
                <Card className="h-full border border-sky-200/80 bg-white/74 shadow-[0_20px_48px_-36px_rgba(15,23,42,0.24)] ring-0 transition-transform hover:-translate-y-0.5 hover:border-sky-300 dark:border-sky-950/55 dark:bg-[linear-gradient(180deg,rgba(17,29,58,0.88),rgba(14,23,46,0.82))] dark:shadow-[0_22px_50px_-38px_rgba(2,6,23,0.8)] dark:hover:border-sky-800">
                  <CardHeader className="gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <CardTitle className="truncate text-lg text-slate-950 dark:text-slate-50">
                          {project.name}
                        </CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <Clock3 className="size-3.5" />
                          {m.index_recent_updated({
                            date: formatProjectDate(project.modifiedAt),
                          })}
                        </CardDescription>
                      </div>

                      <Badge
                        variant="outline"
                        className="border-sky-200/85 bg-white/78 text-slate-700 dark:border-sky-900/70 dark:bg-sky-950/25 dark:text-slate-300"
                      >
                        <Icon className="size-3.5" />
                        {project.type === 'jacly'
                          ? m.index_template_group_blocks()
                          : m.index_template_group_code()}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 text-sm font-medium text-sky-700 dark:text-sky-300">
                    {m.index_recent_open()}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

function formatProjectDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp);
}
