import { m } from '@/paraglide/messages';
import { JacDeviceProvider } from '@/features/jac-device/provider/jac-device-provider';
import { ProjectEditorComponent } from '@/features/project/components';
import { ActiveProjectProvider } from '@/features/project/provider/active-project-provider';
import { TerminalProvider } from '@/features/terminal/provider/terminal-provider';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { enqueueSnackbar } from 'notistack';

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
  const { projectFsService } = Route.useRouteContext();

  return (
    <ActiveProjectProvider
      dbProject={project}
      projectFsService={projectFsService}
    >
      <TerminalProvider>
        <JacDeviceProvider>
          <ProjectEditorComponent />
        </JacDeviceProvider>
      </TerminalProvider>
    </ActiveProjectProvider>
  );
}
