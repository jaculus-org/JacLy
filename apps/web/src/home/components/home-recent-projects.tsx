import { Link } from '@tanstack/react-router';
import { FolderOpen } from 'lucide-react';
import { m } from '@/core/paraglide/messages';
import { Button, Card, CardContent, ProjectBlock } from '@/ui';
import { useHome } from '../home-context';

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
          {state.recentProjects.map((project) => (
            <ProjectBlock key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}
