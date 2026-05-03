import type { JaculusProjectType } from '@jaculus/project/package';
import type { RegistryListTemplate } from '@jaculus/project/registry';
import { Link } from '@tanstack/react-router';
import { BlocksIcon, Code2Icon, SquareArrowRightIcon } from 'lucide-react';
import { m } from '@/core/paraglide/messages';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui';

interface HomeTemplateGroupProps {
  type: JaculusProjectType;
  title: string;
  description: string;
  templates: RegistryListTemplate[];
  templatesAvailable: boolean;
}

const typeIcons = {
  jacly: BlocksIcon,
  code: Code2Icon,
};

export function HomeTemplateGroup({
  type,
  title,
  description,
  templates,
  templatesAvailable,
}: HomeTemplateGroupProps) {
  const Icon = typeIcons[type];

  return (
    <Card className="border border-sky-200/80 bg-white/74 shadow-[0_20px_48px_-36px_rgba(15,23,42,0.24)] ring-0 backdrop-blur dark:border-sky-950/55 dark:bg-[linear-gradient(180deg,rgba(17,29,58,0.9),rgba(14,23,46,0.86))] dark:shadow-[0_22px_50px_-38px_rgba(2,6,23,0.8)]">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge
              variant="outline"
              className="border-sky-200/85 bg-white/78 text-slate-700 dark:border-sky-900/70 dark:bg-sky-950/25 dark:text-slate-300"
            >
              <Icon className="size-3.5" />
              {type === 'jacly' ? m.index_template_group_blocks() : m.index_template_group_code()}
            </Badge>
            <div>
              <CardTitle className="text-lg text-slate-950 dark:text-slate-50">{title}</CardTitle>
              <CardDescription className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {description}
              </CardDescription>
            </div>
          </div>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-slate-700 hover:bg-sky-100/80 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-sky-900/40 dark:hover:text-white dark:hover:ring-1 dark:hover:ring-sky-700/60"
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
          <div className="rounded-xl border border-dashed border-sky-200/85 bg-sky-50/65 px-4 py-5 text-sm text-slate-600 dark:border-sky-950/55 dark:bg-sky-950/24 dark:text-slate-300">
            {m.index_template_unavailable()}
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-sky-200/85 bg-sky-50/65 px-4 py-5 text-sm text-slate-600 dark:border-sky-950/55 dark:bg-sky-950/24 dark:text-slate-300">
            {m.index_template_empty()}
          </div>
        ) : (
          templates.map((template) => (
            <Link
              key={template.id}
              to="/project/new"
              search={{ type, template: template.id }}
              className="block rounded-xl border border-sky-200/80 bg-white/84 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-colors hover:border-sky-300 hover:bg-sky-50/78 dark:border-sky-900/55 dark:bg-[linear-gradient(180deg,rgba(22,36,68,0.76),rgba(18,30,58,0.68))] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] dark:hover:border-sky-800 dark:hover:bg-[linear-gradient(180deg,rgba(26,42,79,0.84),rgba(21,35,66,0.78))]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium text-slate-950 dark:text-slate-50">{template.id}</div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {template.description || m.index_template_fallback_description()}
                  </p>
                </div>

                <span className="mt-0.5 inline-flex items-center gap-1 text-sm font-medium text-sky-700 dark:text-sky-300">
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
