import { m } from '@/core/paraglide/messages';
import { ProjectFormSection, TemplateOptionCard } from '@/ui';
import { Badge } from '@/ui/components/badge';
import { Skeleton } from '@/ui/components/skeleton';
import { useProjectNew } from './project-new-context';

export function ProjectNewTemplatePicker() {
  const { state, actions, meta } = useProjectNew();

  return (
    <ProjectFormSection title={m.project_new_template_title()}>
      {meta.showInitialTemplateLoading ? (
        <TemplateLoadingSkeleton />
      ) : state.templatesError ? (
        <TemplateLoadError />
      ) : state.templates.length === 0 ? (
        <TemplateEmptyState />
      ) : (
        <div
          className={`grid gap-3 sm:grid-cols-2 ${
            meta.showTemplateRefresh ? 'pointer-events-none opacity-60' : ''
          }`}
        >
          {state.templates.map((template) => (
            <TemplateOptionCard
              key={template.id}
              title={template.id}
              description={template.description}
              isSelected={state.selectedTemplate?.id === template.id}
              onSelect={() => actions.selectTemplate(template.id)}
              badge={
                <Badge
                  variant="outline"
                  className="h-5 rounded-full border-sky-200/85 bg-white/84 px-2 text-xs font-medium text-slate-700 dark:border-sky-900/70 dark:bg-sky-950/25 dark:text-slate-300"
                >
                  {state.projectType}
                </Badge>
              }
            />
          ))}
        </div>
      )}
    </ProjectFormSection>
  );
}

function TemplateLoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card/50 p-4">
          <Skeleton className="mb-2 h-5 w-36" />
          <Skeleton className="h-4 w-56" />
        </div>
      ))}
    </div>
  );
}

function TemplateLoadError() {
  return (
    <div className="rounded-xl border border-dashed border-destructive/40 bg-destructive/8 p-6 text-center">
      <p className="text-sm font-medium text-destructive">{m.project_new_template_load_error()}</p>
    </div>
  );
}

function TemplateEmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center">
      <p className="text-sm text-muted-foreground">{m.project_new_template_loading()}</p>
    </div>
  );
}
