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
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {m.index_recent_title()}
          </h2>
        </div>

        <Button asChild variant="ghost" className="hidden sm:inline-flex">
          <Link to="/project">
            {m.index_recent_browse_all()}
            <FolderOpen className="size-4" />
          </Link>
        </Button>
      </div>

      {state.recentProjects.length === 0 ? (
        <Card className="border border-dashed border-border bg-muted/40">
          <CardContent className="py-8 text-sm text-muted-foreground">
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
