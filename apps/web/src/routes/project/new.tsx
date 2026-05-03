import { createFromBundle } from '@jaculus/project/creation';
import type { JaculusProjectType } from '@jaculus/project/package';
import type { RegistryListTemplate } from '@jaculus/project/registry';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { BlocksIcon, Code2Icon } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { Logger } from '@/core/components/logger';
import { m } from '@/core/paraglide/messages';
import { logger } from '@/core/services/logger-service';
import { loadPackageFromFile } from '@/project/services/load-package';
import { createProjectRegistry, defaultRegisters } from '@/project/services/registry';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/components/accordion';
import { Button } from '@/ui/components/button';
import { ProjectCard } from '@/ui/components/custom/project-card';
import { Input } from '@/ui/components/input';

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

interface JaculusProjectOptions {
  type: JaculusProjectType;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

function NewProject() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { projectManService: runtimeService, projectFsService } = Route.useRouteContext();
  const projectOptions = useMemo<JaculusProjectOptions[]>(
    () => [
      {
        type: 'jacly',
        title: m.project_new_blocks_title(),
        description: m.project_new_blocks_desc(),
        icon: <BlocksIcon />,
      },
      {
        type: 'code',
        title: m.project_new_code_title(),
        description: m.project_new_code_desc(),
        icon: <Code2Icon />,
      },
    ],
    [],
  );
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState<JaculusProjectType>(search.type ?? 'jacly');

  const [templates, setTemplates] = useState<RegistryListTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<RegistryListTemplate | null>(null);
  const [registers, setRegisters] = useState<string[]>(defaultRegisters);

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
    (async () => {
      try {
        const registry = createProjectRegistry(registers);
        const loadedTemplates = await registry.listTemplates(projectType);
        setTemplates(loadedTemplates);
        const preferredTemplate =
          (search.template
            ? loadedTemplates.find((template) => template.id === search.template)
            : null) ??
          loadedTemplates[0] ??
          null;

        setSelectedTemplate(preferredTemplate);
      } catch (error) {
        console.error('Failed to load templates from registry:', error);
        setTemplates([]);
        setSelectedTemplate(null);
        enqueueSnackbar(m.project_new_template_load_error(), {
          variant: 'error',
        });
      }
    })();
  }, [projectType, registers, search.template]);

  async function handleProjectCreation() {
    if (!selectedTemplate) {
      return;
    }

    // not allow empty project name
    if (projectName.trim() === '') {
      enqueueSnackbar(m.project_new_name_required(), { variant: 'warning' });
      return;
    }

    setIsCreating(true);
    try {
      const registry = createProjectRegistry(registers);
      const versions = await registry.listVersions(selectedTemplate.id);
      const tgz = await registry.getPackageTgz(selectedTemplate.id, versions[0]);

      // Load package using unified utility - convert Uint8Array to File
      const file = new File([new Uint8Array(tgz)], 'package.tar.gz', {
        type: 'application/gzip',
      });

      const importResult = await loadPackageFromFile(file);
      const pkg = importResult.package;

      // Create the project in the database
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
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">{m.project_new_title()}</h1>

      <div className="space-y-6">
        <div>
          <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
            {m.project_new_name_label()}
          </label>
          <Input
            id="projectName"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder={m.project_new_name_placeholder()}
            autoFocus
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">{m.project_new_type_title()}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectOptions.map((type) => (
              <ProjectCard
                key={type.type}
                title={type.title}
                description={type.description}
                isSelected={projectType === type.type}
                onSelect={() => setProjectType(type.type)}
                icon={type.icon}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">{m.project_new_template_title()}</h2>
          <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-2">
            {templates.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                {m.project_new_template_loading()}
              </p>
            ) : (
              templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`p-3 rounded-md cursor-pointer border transition-colors ${
                    selectedTemplate === template
                      ? 'border-primary bg-primary/10'
                      : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="font-medium">{template.id}</span>
                  <p className="text-sm text-gray-500">{template.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <Accordion type="single" collapsible>
          <AccordionItem value="advanced">
            <AccordionTrigger>{m.project_new_advanced()}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="defaultRegisters"
                    className="block text-sm font-medium text-gray-700 mb-1"
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
                  <p className="text-xs text-gray-500 mt-1">
                    {m.project_new_default_registers_hint()}
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button
          onClick={handleProjectCreation}
          className="w-full"
          disabled={!selectedTemplate || isCreating}
        >
          {isCreating ? m.project_new_btn_creating() : m.project_new_btn_create()}
        </Button>

        <Logger.Logs defaultLevel="silly" logLevelSelector={false} hideIfEmpty />
      </div>
    </div>
  );
}
