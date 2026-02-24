import { m } from '@/paraglide/messages';
import { JacDevice } from '@/features/jac-device';
import { ActiveProject } from '@/features/project/active-project';
import { Stream } from '@/features/stream';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { enqueueSnackbar } from 'notistack';
import { ProjectEditor } from '@/features/project/editor';

export const Route = createFileRoute('/project/$projectId')({
  loader: async ({ context, params }) => {
    const project = await context.projectManService.getProject(
      params.projectId
    );
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
  const { projectFsService, projectManService, streamBusService } =
    Route.useRouteContext();

  return (
    <ActiveProject.Provider
      dbProject={project}
      projectFsService={projectFsService}
    >
      <Stream.Provider
        channel={`project:${project.id}`}
        streamBusService={streamBusService}
      >
        <JacDevice.Provider>
          <ProjectEditor.Provider projectManService={projectManService}>
            <ProjectEditor.Header />
            <ProjectEditor.Layout />
          </ProjectEditor.Provider>
        </JacDevice.Provider>
      </Stream.Provider>
    </ActiveProject.Provider>
  );
}
