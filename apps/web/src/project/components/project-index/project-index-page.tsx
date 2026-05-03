import { m } from '@/core/paraglide/messages';
import type { IDbProject } from '@/core/types/project';
import { Card, CardContent } from '@/ui/components/card';
import { ProjectBlock } from '@/ui/components/custom/project-block';
import { ProjectIndexHeader } from './project-index-header';

interface ProjectIndexPageProps {
  projects: IDbProject[];
  renderAction: (project: IDbProject) => React.ReactNode;
}

export function ProjectIndexPage({ projects, renderAction }: ProjectIndexPageProps) {
  return (
    <div className="space-y-8 py-8">
      <ProjectIndexHeader />

      {projects.length === 0 ? (
        <Card className="border border-dashed border-border bg-muted/40">
          <CardContent className="py-10 text-sm text-muted-foreground">
            {m.project_empty()}
          </CardContent>
        </Card>
      ) : (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {m.index_recent_title()}
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectBlock key={project.id} project={project} action={renderAction(project)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
