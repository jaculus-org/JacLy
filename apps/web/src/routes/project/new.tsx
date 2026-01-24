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
import { Project, type JaculusProjectType } from '@jaculus/project';
import type { FSInterface } from '@jaculus/project/fs';
import { Writable } from 'node:stream';
import { useState } from 'react';
import { loadPackageUri } from '@/features/project/lib/request';

export const Route = createFileRoute('/project/new')({
  component: NewProject,
});

interface JaculusProjectOptions {
  type: JaculusProjectType;
  title: string;
  description: string;
  icon?: React.ReactNode;
  templateUrl: string;
}

const projectOptions: JaculusProjectOptions[] = [
  {
    type: 'jacly',
    title: m.project_new_blocks_title(),
    description: m.project_new_blocks_desc(),
    icon: <BlocksIcon />,
    templateUrl: 'http://localhost:3737/jacly-template/1.0.0/package.tar.gz',
  },
  {
    type: 'code',
    title: m.project_new_code_title(),
    description: m.project_new_code_desc(),
    icon: <Code2Icon />,
    templateUrl: 'http://localhost:3737/jaculus-template/1.0.0/package.tar.gz',
  },
];

function NewProject() {
  const navigate = useNavigate();
  const { runtimeService, projectFsService } = Route.useRouteContext();
  const [projectName, setProjectName] = useState('demo-project');
  const [projectOption, setProjectOption] = useState<JaculusProjectOptions>(
    projectOptions[0]
  );
  const [isCreating, setIsCreating] = useState(false);

  async function handleProjectCreation() {
    setIsCreating(true);

    function writableErr(): Writable {
      const stream = new Writable({
        write(chunk, _encoding, callback) {
          console.log('ERR:', chunk.toString());
          callback();
        },
      });
      return stream;
    }

    function writableOut(): Writable {
      const stream = new Writable({
        write(chunk, _encoding, callback) {
          console.log('OUT:', chunk.toString());
          callback();
        },
      });
      return stream;
    }

    try {
      const pkg = await loadPackageUri(projectOption.templateUrl);

      // Create the project in the database
      const newProject = await runtimeService.createProject(
        projectName,
        projectOption.type
      );

      // Temporarily mount the filesystem to write initial files
      await projectFsService.withMount(
        newProject.id,
        async ({ fs, projectPath }) => {
          // Write test.txt with current timestamp

          const project = new Project(
            fs as unknown as FSInterface,
            projectPath,
            writableOut(),
            writableErr()
          );
          await project.createFromPackage(pkg, false, false);
        }
      );

      navigate({
        to: '/project/$projectId',
        params: { projectId: newProject.id },
      });
    } catch (error) {
      console.error('Failed to create project:', error);
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
          <h2 className="text-lg font-semibold mb-2">{m.project_new_type_title()}</h2>
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

        <Accordion type="single" collapsible>
          <AccordionItem value="advanced">
            <AccordionTrigger>{m.project_new_advanced()}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="templateUrl"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {m.project_new_template_label()}
                  </label>
                  <Input
                    id="templateUrl"
                    value={projectOption.templateUrl}
                    onChange={e => {
                      setProjectOption({
                        ...projectOption,
                        templateUrl: e.target.value,
                      });
                    }}
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {m.project_new_template_hint()}
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button
          onClick={handleProjectCreation}
          className="w-full"
          disabled={isCreating}
        >
          {isCreating ? m.project_new_btn_creating() : m.project_new_btn_create()}
        </Button>
      </div>
    </div>
  );
}
