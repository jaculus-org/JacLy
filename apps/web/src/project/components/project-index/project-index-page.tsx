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
        <Card className="border border-dashed border-sky-200/85 bg-sky-50/65 dark:border-sky-950/55 dark:bg-sky-950/24">
          <CardContent className="py-10 text-sm text-slate-600 dark:text-slate-300">
            {m.project_empty()}
          </CardContent>
        </Card>
      ) : (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
              {m.index_recent_title()}
            </h2>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              {m.index_recent_desc()}
            </p>
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
