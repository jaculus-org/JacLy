import { createFileRoute, redirect } from '@tanstack/react-router';
import { enqueueSnackbar } from 'notistack';
import { useCallback } from 'react';
import { Console } from '@/console';
import { m } from '@/core/paraglide/messages';
import { JacDevice } from '@/device';
import { jaclySaveCoordinator } from '@/editor';
import { JacPackages } from '@/packages';
import { ActiveProject, ProjectEditor } from '@/project';
import { ProjectSaveGuard } from './-project-save-guard';

export const Route = createFileRoute('/project/$projectId')({
  loader: async ({ context, params }) => {
    const project = await context.projectManService.getProject(params.projectId);
    if (!project) {
      enqueueSnackbar(m.project_id_not_found(), {
        variant: 'error',
      });
      throw redirect({ to: '/project' });
    }
    return project;
  },
  component: ProjectEditorRoute,
});

function ProjectEditorRoute() {
  const project = Route.useLoaderData();
  const { projectFsService, projectManService, streamBusService } = Route.useRouteContext();
  const flushPendingWrites = useCallback(() => jaclySaveCoordinator.flushPendingWrites(), []);

  return (
    <ActiveProject.Provider
      dbProject={project}
      projectFsService={projectFsService}
      projectManService={projectManService}
      flushPendingWrites={flushPendingWrites}
    >
      <ProjectSaveGuard />
      <Console.Provider channel={`project:${project.id}`} streamBusService={streamBusService}>
        <JacDevice.Provider>
          <ProjectEditor.Provider projectManService={projectManService}>
            <JacPackages.Provider>
              <ProjectEditor.Header />
              <ProjectEditor.Layout />
            </JacPackages.Provider>
          </ProjectEditor.Provider>
        </JacDevice.Provider>
      </Console.Provider>
    </ActiveProject.Provider>
  );
}
