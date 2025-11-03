import { getProjectById } from '@/lib/projects/project-manager';
import { EditorProvider } from '@/providers/editor-provider';
import { JacProjectProvider } from '@/providers/jac-project-provider';
import { TerminalProvider } from '@/providers/terminal-provider';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { enqueueSnackbar } from 'notistack';

export const Route = createFileRoute('/editor/$projectId')({
  loader: ({ params }) => {
    const project = getProjectById(params.projectId);
    if (!project) {
      enqueueSnackbar('I could not find the requested project.', {
        variant: 'error',
      });
      throw redirect({ to: '/editor' });
    }
    return project;
  },
  component: EditorProject,
});

function EditorProject() {
  const project = Route.useLoaderData();

  return (
    <TerminalProvider>
      <JacProjectProvider project={project}>
        <EditorProvider project={project} />
      </JacProjectProvider>
    </TerminalProvider>
  );
}
