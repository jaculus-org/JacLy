import type { JaculusProjectType } from '@jaculus/project/package';
import type { RegistryListTemplate } from '@jaculus/project/registry';
import { Link } from '@tanstack/react-router';
import { BlocksIcon, Code2Icon, SquareArrowRightIcon } from 'lucide-react';
import { m } from '@/core/paraglide/messages';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/ui';

interface HomeTemplateGroupProps {
  type: JaculusProjectType;
  title: string;
  templates: RegistryListTemplate[];
  templatesAvailable: boolean;
}

const typeIcons = {
  jacly: BlocksIcon,
  code: Code2Icon,
};

const typeIconClassNames = {
  jacly: 'text-project-jacly',
  code: 'text-project-code',
};

export function HomeTemplateGroup({
  type,
  title,
  templates,
  templatesAvailable,
}: HomeTemplateGroupProps) {
  const Icon = typeIcons[type];
  const iconClassName = typeIconClassNames[type];

  return (
    <Card className="border border-border bg-card shadow-[0_20px_48px_-36px_rgba(15,23,42,0.1)] ring-0 backdrop-blur dark:shadow-[0_22px_50px_-38px_rgba(0,0,0,0.5)]">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge variant="outline" className="border-border bg-card text-muted-foreground">
              <Icon className={`size-3.5 ${iconClassName}`} />
              {type === 'jacly' ? m.index_template_group_blocks() : m.index_template_group_code()}
            </Badge>
            <div>
              <CardTitle className="text-lg text-foreground">{title}</CardTitle>
            </div>
          </div>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Link to="/project/new" search={{ type }}>
              {m.index_template_group_browse()}
              <SquareArrowRightIcon className="size-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {!templatesAvailable ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-5 text-sm text-muted-foreground">
            {m.index_template_unavailable()}
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-5 text-sm text-muted-foreground">
            {m.index_template_empty()}
          </div>
        ) : (
          templates.map((template) => (
            <Link
              key={template.id}
              to="/project/new"
              search={{ type, template: template.id }}
              className="block rounded-xl border border-border bg-card px-4 py-4 transition-colors hover:border-primary/40 hover:bg-accent/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium text-foreground">{template.id}</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {template.description || m.index_template_fallback_description()}
                  </p>
                </div>

                <span className="mt-0.5 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  {m.index_template_create()}
                  <SquareArrowRightIcon className="size-4" />
                </span>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
