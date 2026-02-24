import { m } from '@/paraglide/messages';
import { ProjectCard } from '@/features/shared/components/custom/project-card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/features/shared/components/ui/accordion';
import { Button } from '@/features/shared/components/ui/button';
import { Input } from '@/features/shared/components/ui/input';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { BlocksIcon, Code2Icon } from 'lucide-react';
import type { FSInterface } from '@jaculus/project/fs';
import { useEffect, useState } from 'react';
import { getRequest } from '@jaculus/jacly/project';
import { enqueueSnackbar } from 'notistack';
import type { JaculusProjectType } from '@jaculus/project/package';
import { Registry } from '@jaculus/project/registry';
import { Project } from '@jaculus/project';
import { loadPackageFromFile } from '@/features/project/lib/loadPackage';
import { Stream } from '@/features/stream';

export const Route = createFileRoute('/project/new')({
  component: NewProject,
});

interface JaculusProjectOptions {
  type: JaculusProjectType;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const projectOptions: JaculusProjectOptions[] = [
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
];

const defaultRegisters = [
  'http://127.0.0.1:3737/',
  'https://registry.jaculus.org/',
];

function NewProject() {
  const navigate = useNavigate();
  const {
    projectManService: runtimeService,
    projectFsService,
    streamBusService,
  } = Route.useRouteContext();
  const [projectName, setProjectName] = useState('demo-project');
  const [projectOption, setProjectOption] = useState<JaculusProjectOptions>(
    projectOptions[0]
  );

  const [templates, setTemplates] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [registers, setRegisters] = useState<string[]>(defaultRegisters);

  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const registry = await Registry.create(registers, getRequest);
        const loadedTemplates = await registry.listTemplates(
          projectOption.type
        );
        setTemplates(loadedTemplates);
        if (loadedTemplates.length > 0) {
          setSelectedTemplate(loadedTemplates[0]);
        } else {
          setSelectedTemplate(null);
        }
      } catch (error) {
        console.error('Failed to load templates from registry:', error);
        enqueueSnackbar(m.project_new_template_load_error(), {
          variant: 'error',
        });
      }
    })();
  }, [registers, projectOption]);

  async function handleProjectCreation() {
    if (!selectedTemplate) {
      return;
    }

    setIsCreating(true);
    streamBusService.clear('global:new-project');

    try {
      const registry = await Registry.create(registers, getRequest);
      const versions = await registry.listVersions(selectedTemplate);
      const tgz = await registry.getPackageTgz(selectedTemplate, versions[0]);

      // Load package using unified utility - convert Uint8Array to File
      const file = new File([new Uint8Array(tgz)], 'package.tar.gz', {
        type: 'application/gzip',
      });

      const importResult = await loadPackageFromFile(file);
      const pkg = importResult.package;

      // Create the project in the database
      const newProject = await runtimeService.createProject(
        projectName,
        projectOption.type
      );

      const { fs, projectPath } = await projectFsService.mount(newProject.id);
      const creationStreams = streamBusService.createWritablePair(
        'global:new-project',
        'compiler'
      );

      const project = new Project(
        fs as unknown as FSInterface,
        projectPath,
        creationStreams.out,
        creationStreams.err
      );
      await project.createFromPackage(pkg, false, false);

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
          <label
            htmlFor="projectName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {m.project_new_name_label()}
          </label>
          <Input
            id="projectName"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            placeholder={m.project_new_name_placeholder()}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">
            {m.project_new_type_title()}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectOptions.map(type => (
              <ProjectCard
                key={type.type}
                title={type.title}
                description={type.description}
                isSelected={projectOption?.type === type.type}
                onSelect={() => setProjectOption(type)}
                icon={type.icon}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">
            {m.project_new_template_title()}
          </h2>
          <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-2">
            {templates.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                {m.project_new_template_loading()}
              </p>
            ) : (
              templates.map(template => (
                <div
                  key={template}
                  onClick={() => setSelectedTemplate(template)}
                  className={`p-3 rounded-md cursor-pointer border transition-colors ${
                    selectedTemplate === template
                      ? 'border-primary bg-primary/10'
                      : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="font-medium">{template}</span>
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
                    onChange={e => {
                      setRegisters(
                        e.target.value.split(';').map(s => s.trim())
                      );
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
          {isCreating
            ? m.project_new_btn_creating()
            : m.project_new_btn_create()}
        </Button>

        <Stream.CreateNewLogs streamBusService={streamBusService} />
      </div>
    </div>
  );
}
