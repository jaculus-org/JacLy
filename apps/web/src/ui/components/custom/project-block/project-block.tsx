import { Link } from '@tanstack/react-router';
import { Blocks, Clock3, Code } from 'lucide-react';
import { m } from '@/core/paraglide/messages';
import type { IDbProject } from '@/core/types/project';
import { Badge } from '@/ui/components/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/components/card';
import { cn } from '@/ui/lib/cn';

interface ProjectBlockProps {
  project: IDbProject;
  action?: React.ReactNode;
  className?: string;
}

const projectTypeIcons = {
  jacly: Blocks,
  code: Code,
};

export function ProjectBlock({ project, action, className }: ProjectBlockProps) {
  const Icon = projectTypeIcons[project.type];

  return (
    <Card
      className={cn(
        'group relative h-full overflow-hidden border border-border bg-card shadow-[0_20px_48px_-36px_rgba(15,23,42,0.12)] ring-0 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_24px_52px_-34px_rgba(14,30,63,0.2)] dark:shadow-[0_22px_50px_-38px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_28px_56px_-36px_rgba(0,0,0,0.6)]',
        className,
      )}
    >
      <Link
        to="/project/$projectId"
        params={{ projectId: project.id }}
        aria-label={project.name}
        className="absolute inset-0 z-0 rounded-[inherit]"
      />

      <CardHeader className="pointer-events-none relative z-10 gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-3 truncate text-lg text-foreground">
              <Icon className="size-5 shrink-0" />
              <span className="truncate">{project.name}</span>
            </CardTitle>
          </div>

          {action ? <div className="pointer-events-auto relative z-20">{action}</div> : null}
        </div>

        <div className="flex items-center justify-between gap-3">
          <CardDescription className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock3 className="size-3.5 shrink-0" />
            {m.index_recent_updated({
              date: formatProjectDate(project.modifiedAt),
            })}
          </CardDescription>

          <Badge
            variant="outline"
            className="h-8 gap-1.5 rounded-full border-border bg-card px-3 text-sm font-medium text-muted-foreground"
          >
            <Icon className="size-4" />
            {project.type === 'jacly'
              ? m.index_template_group_blocks()
              : m.index_template_group_code()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pointer-events-none relative z-10 pt-0 text-sm font-medium text-primary transition-colors group-hover:text-primary/80">
        {m.index_recent_open()}
      </CardContent>
    </Card>
  );
}

function formatProjectDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp);
}
