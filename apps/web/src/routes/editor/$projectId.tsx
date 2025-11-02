import { getProjectById } from '@/lib/projects/project-manager';
import { EditorProvider } from '@/providers/editor-provider';
import { JacProjectProvider } from '@/providers/jac-project-provider';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/editor/$projectId')({
  loader: ({ params }) => {
    const project = getProjectById(params.projectId);
    if (!project) {
      throw redirect({ to: '/editor' });
    }
    return project;
  },
  component: EditorProject,
});

function EditorProject() {
  const project = Route.useLoaderData();

  return (
    <JacProjectProvider project={project}>
      <EditorProvider />
    </JacProjectProvider>
  );
}
