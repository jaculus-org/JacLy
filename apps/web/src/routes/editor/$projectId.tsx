import { EditorComponent } from '@/features/editor/components/editor-component';
import { EditorHeader } from '@/features/editor/components/editor-header';
import { ActiveProjectProvider } from '@/features/editor/provider/active-project-provider';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { enqueueSnackbar } from 'notistack';

export const Route = createFileRoute('/editor/$projectId')({
  loader: async ({ context, params }) => {
    const project = await context.runtimeService.getProject(params.projectId);
    if (!project) {
      enqueueSnackbar('I could not find the requested project.', {
        variant: 'error',
      });
      throw redirect({ to: '/editor' });
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
