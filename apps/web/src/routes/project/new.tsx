import { createFromBundle } from '@jaculus/project/creation';
import type { JaculusProjectType } from '@jaculus/project/package';
import type { RegistryListTemplate } from '@jaculus/project/registry';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { BlocksIcon, CheckCircle, Code2Icon } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { Logger } from '@/core/components/logger';
import { m } from '@/core/paraglide/messages';
import { logger } from '@/core/services/logger-service';
import { loadPackageFromFile } from '@/project/services/load-package';
import { createProjectRegistry, defaultRegisters } from '@/project/services/registry';
import { FormPageLayout, ProjectFormSection, TemplateOptionCard } from '@/ui';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/components/accordion';
import { Badge } from '@/ui/components/badge';
import { Button } from '@/ui/components/button';
import { Input } from '@/ui/components/input';
import { Skeleton } from '@/ui/components/skeleton';

interface NewProjectSearchParams {
  type?: JaculusProjectType;
  template?: string;
}

export const Route = createFileRoute('/project/new')({
  component: NewProject,
  validateSearch: (search: Record<string, unknown>): NewProjectSearchParams => {
    const type =
      search.type === 'jacly' || search.type === 'code'
        ? (search.type as JaculusProjectType)
        : undefined;

    return {
      type,
      template: typeof search.template === 'string' ? search.template : undefined,
    };
  },
});

function NewProject() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { projectManService: runtimeService, projectFsService } = Route.useRouteContext();

  const projectOptions = useMemo(
    () => [
      {
        type: 'jacly' as JaculusProjectType,
        title: m.project_new_blocks_title(),
        description: m.project_new_blocks_desc(),
        icon: BlocksIcon,
        color: 'sky',
      },
      {
        type: 'code' as JaculusProjectType,
        title: m.project_new_code_title(),
        description: m.project_new_code_desc(),
        icon: Code2Icon,
        color: 'emerald',
      },
    ],
    [],
  );

  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState<JaculusProjectType>(search.type ?? 'jacly');

  const [templates, setTemplates] = useState<RegistryListTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<RegistryListTemplate | null>(null);
  const [registers, setRegisters] = useState<string[]>(defaultRegisters);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState(false);

  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    logger.clear();
  }, []);

  useEffect(() => {
    if (!search.type || search.type === projectType) {
      return;
    }

    setProjectType(search.type);
  }, [projectType, search.type]);

  useEffect(() => {
    let cancelled = false;
    setTemplatesLoading(true);
    setTemplatesError(false);

    (async () => {
      try {
        const registry = createProjectRegistry(registers);
        const loadedTemplates = await registry.listTemplates(projectType);
        if (cancelled) return;
        setTemplates(loadedTemplates);
        const preferredTemplate =
          (search.template
            ? loadedTemplates.find((template) => template.id === search.template)
            : null) ??
          loadedTemplates[0] ??
          null;

        setSelectedTemplate(preferredTemplate);
        setTemplatesLoading(false);
      } catch (error) {
        if (cancelled) return;
        console.error('Failed to load templates from registry:', error);
        setTemplates([]);
        setSelectedTemplate(null);
        setTemplatesLoading(false);
        setTemplatesError(true);
        enqueueSnackbar(m.project_new_template_load_error(), {
          variant: 'error',
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [projectType, registers, search.template]);

  async function handleProjectCreation() {
    if (!selectedTemplate) {
      return;
    }

    if (projectName.trim() === '') {
      enqueueSnackbar(m.project_new_name_required(), { variant: 'warning' });
      return;
    }

    setIsCreating(true);
    try {
      const registry = createProjectRegistry(registers);
      const versions = await registry.listVersions(selectedTemplate.id);
      const tgz = await registry.getPackageTgz(selectedTemplate.id, versions[0]);

      const file = new File([new Uint8Array(tgz)], 'package.tar.gz', {
        type: 'application/gzip',
      });

      const importResult = await loadPackageFromFile(file);
      const pkg = importResult.package;

      const newProject = await runtimeService.createProject(projectName, projectType);

      const { fs, projectPath } = await projectFsService.mount(newProject.id);

      await createFromBundle(fs, projectPath, pkg, logger, false, false);

      navigate({
        to: '/project/$projectId',
        params: { projectId: newProject.id },
      });
    } catch (error) {
      console.error('Failed to create project:', error);
      enqueueSnackbar(m.project_new_creation_error(), { variant: 'error' });
      setIsCreating(false);
    }
  }

  return (
    <FormPageLayout title={m.project_new_title()}>
      <ProjectFormSection title={m.project_new_name_label()}>
        <Input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder={m.project_new_name_placeholder()}
          autoFocus
          className="h-11 text-base"
        />
      </ProjectFormSection>

      <ProjectFormSection title={m.project_new_type_title()}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {projectOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = projectType === option.type;

            return (
              <button
                key={option.type}
                type="button"
                onClick={() => setProjectType(option.type)}
                className={`group relative rounded-xl border p-5 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-primary/60 bg-primary/8 shadow-[0_8px_28px_-16px_rgba(37,150,228,0.25)]'
                    : 'border-border bg-card hover:-translate-y-0.5 hover:border-primary/40'
                }`}
              >
                {isSelected && (
                  <span className="absolute right-3 top-3">
                    <CheckCircle className="size-5 text-primary" />
                  </span>
                )}
                <div className="flex items-start gap-3 pr-8">
                  <div
                    className={`shrink-0 rounded-xl p-2.5 ${
                      option.color === 'sky'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    }`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground">{option.title}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ProjectFormSection>

      <ProjectFormSection title={m.project_new_template_title()}>
        {templatesLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card/50 p-4">
                <Skeleton className="mb-2 h-5 w-36" />
                <Skeleton className="h-4 w-56" />
              </div>
            ))}
          </div>
        ) : templatesError ? (
          <div className="rounded-xl border border-dashed border-destructive/40 bg-destructive/8 p-6 text-center">
            <p className="text-sm font-medium text-destructive">
              {m.project_new_template_load_error()}
            </p>
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center">
            <p className="text-sm text-muted-foreground">{m.project_new_template_loading()}</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {templates.map((template) => (
              <TemplateOptionCard
                key={template.id}
                title={template.id}
                description={template.description}
                isSelected={selectedTemplate === template}
                onSelect={() => setSelectedTemplate(template)}
                badge={
                  <Badge
                    variant="outline"
                    className="h-5 rounded-full border-sky-200/85 bg-white/84 px-2 text-xs font-medium text-slate-700 dark:border-sky-900/70 dark:bg-sky-950/25 dark:text-slate-300"
                  >
                    {projectType}
                  </Badge>
                }
              />
            ))}
          </div>
        )}
      </ProjectFormSection>

      <Accordion type="single" collapsible>
        <AccordionItem
          value="advanced"
          className="rounded-2xl border border-dashed border-border bg-muted/40"
        >
          <AccordionTrigger className="px-4 py-3 text-sm font-medium text-muted-foreground hover:no-underline">
            {m.project_new_advanced()}
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="defaultRegisters"
                  className="mb-1.5 block text-sm font-medium text-muted-foreground"
                >
                  {m.project_new_default_registers()}
                </label>
                <Input
                  id="defaultRegisters"
                  value={registers.join('; ')}
                  onChange={(e) => {
                    setRegisters(e.target.value.split(';').map((s) => s.trim()));
                  }}
                  className="text-sm"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {m.project_new_default_registers_hint()}
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="pt-2">
        <Button
          onClick={handleProjectCreation}
          size="lg"
          variant="cta"
          className="w-full"
          disabled={!selectedTemplate || isCreating}
        >
          {isCreating ? m.project_new_btn_creating() : m.project_new_btn_create()}
        </Button>
      </div>

      <Logger.Logs defaultLevel="silly" logLevelSelector={false} hideIfEmpty />
    </FormPageLayout>
  );
}
