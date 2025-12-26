import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  createNewProject,
  getProjectDbName,
  saveProject,
  type JaclyProject,
} from '@/lib/projects/project-manager';
import { BlocksIcon, Code2Icon } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import { loadPackageUri } from '@/lib/projects/request';
import { Writable } from 'node:stream';
import logger from '@/lib/logger';
import { Project, type JaculusProjectType } from '@jaculus/project';
import { configure, fs } from '@zenfs/core';
import type { FSInterface } from '@jaculus/project/fs';
import { ProjectCard } from './project-card';
import { IndexedDB } from '@zenfs/dom';

interface JaculusProjectOptions {
  id: JaculusProjectType;
  title: string;
  description: string;
  icon?: React.ReactNode;
  templateUrl: string;
}

const projectOptions: JaculusProjectOptions[] = [
  {
    id: 'jacly',
    title: 'Jacly Blocks Project',
    icon: <BlocksIcon />,
    description: "Design your project using Jacly's visual blocks.",
    templateUrl: 'http://localhost:3737/jacly-template/1.0.0/package.tar.gz',
  },
  {
    id: 'code',
    title: 'Jaculus Code Project',
    description: 'Code your project directly in TypeScript.',
    icon: <Code2Icon />,
    templateUrl: 'http://localhost:3737/jaculus-template/1.0.0/package.tar.gz',
  },
];

export function NewProject() {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('demo-project');
  const [projectOption, setProjectOption] = useState<JaculusProjectOptions>(
    projectOptions[0]
  );
  const [isCreating, setIsCreating] = useState(false);

  async function handleProjectCreation() {
    const newProject = createNewProject(projectName, projectOption.id);
    if (!newProject) {
      enqueueSnackbar('Failed to create project. Project ID already exist.', {
        variant: 'error',
      });
      return;
    }
    setIsCreating(true);

    try {
      const pkg = await loadPackageUri(projectOption.templateUrl);
      logger?.info(`Pkg loaded with ${Object.keys(pkg.files).length} files`);

      function writableErr(): Writable {
        const stream = new Writable({
          write(chunk, _encoding, callback) {
            logger?.error(chunk.toString());
            callback();
          },
        });
        return stream;
      }

      function writableOut(): Writable {
        const stream = new Writable({
          write(chunk, _encoding, callback) {
            logger?.info(chunk.toString());
            callback();
          },
        });
        return stream;
      }

      await configure({
        mounts: {
          [`/${newProject.id}`]: {
            backend: IndexedDB,
            storeName: getProjectDbName(newProject.id),
          },
        },
      });

      const project = new Project(
        fs as unknown as FSInterface,
        `/${newProject.id}`,
        writableOut(),
        writableErr()
      );
      await project.createFromPackage(pkg, false, false);

      const rootDirs = await fs.promises.readdir('/' + newProject.id);
      logger?.info('Project root directories:' + rootDirs);

      saveProject(newProject);
      enqueueSnackbar('Project created successfully!', {
        variant: 'success',
      });
      navigate({
        to: '/editor/$projectId',
        params: { projectId: newProject.id! },
      });
    } catch (err) {
      logger?.error('Error creating project from package:' + err);
      enqueueSnackbar(`Error creating project: ${(err as Error).message}`, {
        variant: 'error',
      });
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Create New Project</h1>

      <div className="space-y-6">
        <div>
          <label
            htmlFor="projectName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Project Name
          </label>
          <Input
            id="projectName"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            placeholder="My awesome project"
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Project Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectOptions.map(type => (
              <ProjectCard
                key={type.id}
                title={type.title}
                description={type.description}
                isSelected={projectOption?.id === type.id}
                onSelect={() => setProjectOption(type)}
                icon={type.icon}
              />
            ))}
          </div>
        </div>

        <Accordion type="single" collapsible>
          <AccordionItem value="advanced">
            <AccordionTrigger>Advanced Settings</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="templateUrl"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Template URL (optional)
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
                    Leave empty to use the default template for the selected
                    project type.
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
          {isCreating ? 'Creating...' : 'Create Project'}
        </Button>
      </div>
    </div>
  );
}
