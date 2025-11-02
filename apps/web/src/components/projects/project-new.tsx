import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { JaclyProjectType } from './projects-list';
import {
  createNewProject,
  saveProject,
  type JaclyProject,
} from '@/lib/projects/project-manager';
import { enqueueSnackbar } from 'notistack';
import { loadPackageUri } from '@/lib/projects/request';
import { Writable } from 'node:stream';
import logger from '@/lib/logger';
import { Project } from '@jaculus/project';
import { configure, fs as fsVirtual } from '@zenfs/core';
import type { FSInterface } from '@jaculus/project/fs';
import { ProjectCard } from './project-card';
import { IndexedDB } from '@zenfs/dom';

export function NewProject() {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState<JaclyProjectType>('jacly');
  const [newProjectConf, setNewProjectConf] = useState<JaclyProject | null>(
    null
  );

  useEffect(() => {
    if (!newProjectConf) return;

    async function finishCreation(projectConf: JaclyProject) {
      const pkg = await loadPackageUri(
        'https://robutek.robotikabrno.cz/v2/robot/lekce1/example1.tar.gz'
      );

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

      try {
        await configure({
          mounts: {
            [`/${projectConf.id}`]: {
              backend: IndexedDB,
              storeName: `jaculus-${projectConf.id}`,
            },
          },
        });

        const project = new Project(
          fsVirtual as unknown as FSInterface,
          `/${projectConf.id}`,
          writableOut(),
          writableErr()
        );
        await project.createFromPackage(pkg, true);

        saveProject(newProjectConf as JaclyProject);
        enqueueSnackbar('Project created successfully!', {
          variant: 'success',
        });
        navigate({
          to: '/editor/$projectId',
          params: { projectId: projectConf.id! },
        });
      } catch (err) {
        logger?.error('Error creating project from package:' + err);
        enqueueSnackbar(`Error creating project: ${(err as Error).message}`, {
          variant: 'error',
        });
      }
    }

    finishCreation(newProjectConf);
  }, [newProjectConf, navigate]);

  async function createProjectHelper() {
    const newProject = createNewProject(projectName, projectType);
    if (!newProject) {
      enqueueSnackbar(
        'Failed to create project. Project ID may already exist.',
        { variant: 'error' }
      );
      return;
    }

    setNewProjectConf(newProject);
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
            <ProjectCard
              title="Jacly Project"
              description="A project using the Jacly framework."
              isSelected={projectType === 'jacly'}
              onSelect={() => setProjectType('jacly')}
            />
            <ProjectCard
              title="Jaculus Project"
              description="A standard Jaculus project."
              isSelected={projectType === 'code'}
              onSelect={() => setProjectType('code')}
            />
          </div>
        </div>

        <Button onClick={createProjectHelper} className="w-full">
          Create Project
        </Button>
      </div>
    </div>
  );
}
