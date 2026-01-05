import { EditorComponent } from '@/features/project/components/editor-component';
import { EditorHeader } from '@/features/project/components/editor-header';
import { ActiveProjectProvider } from '@/features/project/provider/active-project-provider';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { enqueueSnackbar } from 'notistack';

export const Route = createFileRoute('/project/$projectId')({
  loader: async ({ context, params }) => {
    const project = await context.runtimeService.getProject(params.projectId);
    if (!project) {
      enqueueSnackbar('I could not find the requested project.', {
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
      project={project}
      projectFsService={projectFsService}
    >
      <EditorHeader />
      <EditorComponent />
    </ActiveProjectProvider>
  );
}
